package storage

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

var extByContentType = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
}

// AvatarStore uploads and deletes avatar objects.
type AvatarStore interface {
	Upload(userID string, data []byte, contentType string) (publicURL string, err error)
	Delete(userID string) error
}

// LocalAvatarStore saves files on disk and builds public URLs from baseURL.
type LocalAvatarStore struct {
	dir     string
	baseURL string
}

// NewLocalAvatarStore creates a filesystem-backed avatar store.
func NewLocalAvatarStore(dir, baseURL string) (*LocalAvatarStore, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, err
	}
	return &LocalAvatarStore{dir: dir, baseURL: strings.TrimRight(baseURL, "/")}, nil
}

func (s *LocalAvatarStore) objectKey(userID, contentType string) string {
	ext := extByContentType[contentType]
	if ext == "" {
		ext = ".jpg"
	}
	return userID + ext
}

func (s *LocalAvatarStore) Upload(userID string, data []byte, contentType string) (string, error) {
	key := s.objectKey(userID, contentType)
	path := filepath.Join(s.dir, key)
	if err := os.WriteFile(path, data, 0o644); err != nil {
		return "", err
	}
	return fmt.Sprintf("%s/avatars/%s", s.baseURL, key), nil
}

func (s *LocalAvatarStore) Delete(userID string) error {
	entries, err := os.ReadDir(s.dir)
	if err != nil {
		return err
	}
	prefix := userID
	for _, e := range entries {
		if strings.HasPrefix(e.Name(), prefix) {
			_ = os.Remove(filepath.Join(s.dir, e.Name()))
		}
	}
	return nil
}

// S3AvatarStore uploads to S3-compatible storage (AWS S3, Cloudflare R2, etc.).
type S3AvatarStore struct {
	client     *s3.Client
	bucket     string
	publicBase string
}

// S3Config holds settings for S3-compatible avatar storage.
type S3Config struct {
	Endpoint        string
	Region          string
	Bucket          string
	AccessKeyID     string
	SecretAccessKey string
	PublicBaseURL   string
}

// NewS3AvatarStore creates an S3-compatible avatar store.
func NewS3AvatarStore(cfg S3Config) (*S3AvatarStore, error) {
	loadOpts := []func(*config.LoadOptions) error{
		config.WithRegion(cfg.Region),
	}
	if cfg.AccessKeyID != "" && cfg.SecretAccessKey != "" {
		loadOpts = append(loadOpts, config.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
		))
	}

	awsCfg, err := config.LoadDefaultConfig(context.Background(), loadOpts...)
	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		if cfg.Endpoint != "" {
			o.BaseEndpoint = aws.String(cfg.Endpoint)
			o.UsePathStyle = true
		}
	})

	publicBase := strings.TrimRight(cfg.PublicBaseURL, "/")
	if publicBase == "" {
		publicBase = fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", cfg.Bucket, cfg.Region, cfg.Bucket)
	}

	return &S3AvatarStore{
		client:     client,
		bucket:     cfg.Bucket,
		publicBase: publicBase,
	}, nil
}

func (s *S3AvatarStore) objectKey(userID, contentType string) string {
	ext := extByContentType[contentType]
	if ext == "" {
		ext = ".jpg"
	}
	return "avatars/" + userID + ext
}

func (s *S3AvatarStore) Upload(userID string, data []byte, contentType string) (string, error) {
	key := s.objectKey(userID, contentType)
	_, err := s.client.PutObject(context.Background(), &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(data),
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%s/%s", s.publicBase, key), nil
}

func (s *S3AvatarStore) Delete(userID string) error {
	for _, ext := range []string{".jpg", ".png", ".webp"} {
		key := "avatars/" + userID + ext
		_, err := s.client.DeleteObject(context.Background(), &s3.DeleteObjectInput{
			Bucket: aws.String(s.bucket),
			Key:    aws.String(key),
		})
		if err != nil {
			continue
		}
	}
	return nil
}
