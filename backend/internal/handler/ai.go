package handler

import (
	"log"

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
		// SECURITY: Never expose internal AI provider errors to the client (may contain API key fragments or billing details)
		log.Printf("AI GenerateQuestions error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Hệ thống AI không thể tạo câu hỏi lúc này. Vui lòng thử lại sau."})
	}

	// SECURITY: AI Reflection XSS Protection. 
	// Strip any malicious HTML payloads embedded by the LLM (Prompt Injection defense).
	for i := range questions {
		questions[i].Question = utils.SanitizeString(questions[i].Question)
		questions[i].Explanation = utils.SanitizeString(questions[i].Explanation)
		for j := range questions[i].Options {
			questions[i].Options[j] = utils.SanitizeString(questions[i].Options[j])
		}
	}

	return c.JSON(fiber.Map{
		"questions": questions,
	})
}
