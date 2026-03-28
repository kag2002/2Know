package service

import (
	"errors"
	"log"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"backend/internal/model"
	"backend/internal/repository"
)

var (
	ErrUserExists   = errors.New("email already exists")
	ErrInvalidCreds = errors.New("invalid email or password")
	ErrHashFailed   = errors.New("failed to hash password")
	ErrTokenFailed  = errors.New("failed to generate token")
)

type AuthService interface {
	Register(email, password, fullName string) (*model.User, error)
	Login(email, password string) (*model.User, string, error)
}

type authService struct {
	repo      repository.UserRepository
	jwtSecret string
}

func NewAuthService(repo repository.UserRepository, secret string) AuthService {
	// SECURITY: Server MUST NOT start without a proper JWT secret
	if secret == "" {
		log.Fatal("FATAL: JWT_SECRET environment variable is required. Server cannot start without it.")
	}
	return &authService{
		repo:      repo,
		jwtSecret: secret,
	}
}

func (s *authService) Register(email, password, fullName string) (*model.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, ErrHashFailed
	}

	user := &model.User{
		Email:        email,
		PasswordHash: string(hashedPassword),
		FullName:     fullName,
		Role:         "teacher", // Default role
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, ErrUserExists
	}

	return user, nil
}

func (s *authService) Login(email, password string) (*model.User, string, error) {
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return nil, "", ErrInvalidCreds
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, "", ErrInvalidCreds
	}

	// Create JWT (24h expiry for security/UX balance)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  user.ID,
		"role": user.Role,
		"exp":  time.Now().Add(24 * time.Hour).Unix(),
	})

	t, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return nil, "", ErrTokenFailed
	}

	// Update last login
	now := time.Now()
	user.LastLoginAt = &now
	s.repo.UpdateUser(user)

	return user, t, nil
}
