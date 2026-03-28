package handler

import (
	"github.com/gofiber/fiber/v3"

	"backend/internal/service"
	"backend/internal/utils"
)

type AIHandler struct {
	svc service.AIService
}

func NewAIHandler(svc service.AIService) *AIHandler {
	return &AIHandler{svc: svc}
}

func (h *AIHandler) GenerateQuiz(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req struct {
		Prompt string `json:"prompt" validate:"required,max=1000"`
	}

	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := utils.ValidateStruct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Prompt must be less than 1000 characters"})
	}

	if req.Prompt == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Prompt cannot be empty"})
	}

	questions, err := h.svc.GenerateQuestions(req.Prompt)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"questions": questions,
	})
}
