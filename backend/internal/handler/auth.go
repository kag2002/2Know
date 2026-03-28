package handler

import (
	"strings"

	"github.com/gofiber/fiber/v3"

	"backend/internal/service"
	"backend/internal/utils"
)

type AuthHandler struct {
	svc service.AuthService
}

func NewAuthHandler(svc service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6,max=72"`
	FullName string `json:"full_name" validate:"required,min=2,max=255"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,max=72"`
}

func (h *AuthHandler) Register(c fiber.Ctx) error {
	var req RegisterRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := utils.ValidateStruct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Validation failed: " + err.Error()})
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	user, err := h.svc.Register(req.Email, req.Password, req.FullName)
	if err != nil {
		if err == service.ErrUserExists {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Email already exists"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Registration failed"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "User successfully registered",
		"user": fiber.Map{
			"id":        user.ID,
			"email":     user.Email,
			"full_name": user.FullName,
		},
	})
}

func (h *AuthHandler) Login(c fiber.Ctx) error {
	var req LoginRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := utils.ValidateStruct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Validation failed: " + err.Error()})
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	user, token, err := h.svc.Login(req.Email, req.Password)
	if err != nil {
		if err == service.ErrInvalidCreds {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid email or password"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Login failed"})
	}

	return c.JSON(fiber.Map{
		"token": token,
		"user": fiber.Map{
			"id":        user.ID,
			"email":     user.Email,
			"full_name": user.FullName,
			"role":      user.Role,
			"avatar":    user.AvatarURL,
		},
	})
}
