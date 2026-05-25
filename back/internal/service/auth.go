package service

import (
	"errors"
	"log"
	"time"

	"github.com/N95Ryan/flip-back/internal/model"
	"github.com/N95Ryan/flip-back/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Auth errors returned to handlers for HTTP mapping.
var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInvalidInput       = errors.New("invalid email or password")
	ErrEmailExists        = errors.New("email already registered")
)

// AuthService handles registration, login, and JWT issuance.
type AuthService struct {
	repo      *repository.UserRepository
	jwtSecret []byte
	stripeSvc *BillingService
}

// NewAuthService constructs an auth service.
func NewAuthService(repo *repository.UserRepository, jwtSecret string, stripeSvc *BillingService) *AuthService {
	return &AuthService{repo: repo, jwtSecret: []byte(jwtSecret), stripeSvc: stripeSvc}
}

// Register creates a user and returns the user plus a JWT.
func (s *AuthService) Register(email, password string) (*model.User, string, error) {
	if email == "" || len(password) < 8 {
		return nil, "", ErrInvalidInput
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}

	user, err := s.repo.CreateUser(email, string(hash))
	if err != nil {
		if errors.Is(err, repository.ErrEmailExists) {
			return nil, "", ErrEmailExists
		}
		return nil, "", err
	}

	if s.stripeSvc != nil {
		customerID, err := s.stripeSvc.CreateStripeCustomer(user.ID, user.Email)
		if err != nil {
			log.Printf("stripe customer creation failed: %v", err)
		} else if err := s.repo.UpdateStripeCustomerID(user.ID, customerID); err == nil {
			user.StripeCustomerID = customerID
		}
	}

	token, err := s.generateToken(user.ID)
	if err != nil {
		return nil, "", err
	}
	return user, token, nil
}

// Login validates credentials and returns the user plus a JWT.
func (s *AuthService) Login(email, password string) (*model.User, string, error) {
	if email == "" || password == "" {
		return nil, "", ErrInvalidInput
	}

	user, err := s.repo.GetUserByEmail(email)
	if err != nil {
		return nil, "", err
	}
	if user == nil {
		return nil, "", ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, "", ErrInvalidCredentials
	}

	token, err := s.generateToken(user.ID)
	if err != nil {
		return nil, "", err
	}
	user.PasswordHash = ""
	return user, token, nil
}

func (s *AuthService) generateToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}
