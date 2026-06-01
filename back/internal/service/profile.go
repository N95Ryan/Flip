package service

import (
	"errors"
	"regexp"
	"strings"

	"github.com/N95Ryan/flip-back/internal/model"
	"github.com/N95Ryan/flip-back/internal/repository"
)

var (
	ErrProfileNotFound    = errors.New("user not found")
	ErrInvalidUsername    = errors.New("invalid username")
	ErrUsernameTaken      = errors.New("username already taken")
	ErrAvatarTooLarge     = errors.New("avatar file too large")
	ErrAvatarInvalidType  = errors.New("invalid avatar file type")
)

var usernamePattern = regexp.MustCompile(`^[a-zA-Z0-9_]{3,30}$`)

// ProfileUserRepository defines persistence for profile operations.
type ProfileUserRepository interface {
	GetUserByID(id string) (*model.User, error)
	UpdateUsername(userID, username string) (*model.User, error)
	UpdateProfile(userID string, username, avatarURL *string) (*model.User, error)
}

// AvatarStorage uploads and deletes user avatar files.
type AvatarStorage interface {
	Upload(userID string, data []byte, contentType string) (publicURL string, err error)
	Delete(userID string) error
}

// ProfileService handles user profile reads and updates.
type ProfileService struct {
	repo    ProfileUserRepository
	avatars AvatarStorage
}

// NewProfileService constructs a profile service.
func NewProfileService(repo ProfileUserRepository, avatars AvatarStorage) *ProfileService {
	return &ProfileService{repo: repo, avatars: avatars}
}

// GetMe returns the user for the given ID.
func (s *ProfileService) GetMe(userID string) (*model.User, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrProfileNotFound
	}
	return user, nil
}

// UpdateUsername sets the username for the given user.
func (s *ProfileService) UpdateUsername(userID, username string) (*model.User, error) {
	normalized := strings.TrimSpace(username)
	if !usernamePattern.MatchString(normalized) {
		return nil, ErrInvalidUsername
	}

	user, err := s.repo.UpdateUsername(userID, normalized)
	if err != nil {
		if errors.Is(err, repository.ErrUsernameExists) {
			return nil, ErrUsernameTaken
		}
		return nil, err
	}
	return user, nil
}

const maxAvatarBytes = 5 << 20 // 5 MiB

var allowedAvatarTypes = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
}

// UploadAvatar stores a new avatar and updates the user's avatar_url.
func (s *ProfileService) UploadAvatar(userID string, data []byte, contentType string) (*model.User, error) {
	if len(data) == 0 {
		return nil, ErrAvatarInvalidType
	}
	if len(data) > maxAvatarBytes {
		return nil, ErrAvatarTooLarge
	}
	if _, ok := allowedAvatarTypes[contentType]; !ok {
		return nil, ErrAvatarInvalidType
	}

	if s.avatars != nil {
		if err := s.avatars.Delete(userID); err != nil {
			return nil, err
		}
	}

	url, err := s.avatars.Upload(userID, data, contentType)
	if err != nil {
		return nil, err
	}

	user, err := s.repo.UpdateProfile(userID, nil, &url)
	if err != nil {
		return nil, err
	}
	return user, nil
}

// DeleteAvatar removes the avatar file and clears avatar_url.
func (s *ProfileService) DeleteAvatar(userID string) (*model.User, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrProfileNotFound
	}

	if s.avatars != nil && user.AvatarURL != "" {
		_ = s.avatars.Delete(userID)
	}

	empty := ""
	return s.repo.UpdateProfile(userID, nil, &empty)
}
