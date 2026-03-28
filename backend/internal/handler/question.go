package handler

import (
	"log"

	"github.com/gofiber/fiber/v3"

	"backend/internal/model"
	"backend/internal/service"
	"backend/internal/utils"
)

type QuestionHandler struct {
	svc service.QuestionService
}

func NewQuestionHandler(svc service.QuestionService) *QuestionHandler {
	return &QuestionHandler{svc: svc}
}

func (h *QuestionHandler) GetQuestions(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	questions, err := h.svc.GetQuestions(userId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch questions"})
	}
	return c.JSON(questions)
}

func (h *QuestionHandler) CreateQuestion(c fiber.Ctx) error {
	var question model.Question
	if err := c.Bind().JSON(&question); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := utils.ValidateStruct(&question); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Validation failed: " + err.Error()})
	}

	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	if err := h.svc.CreateQuestion(userId, &question); err != nil {
		log.Printf("Error creating question: %v", err)
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Not authorized to add to this quiz or failed to create"})
	}

	return c.Status(fiber.StatusCreated).JSON(question)
}

func (h *QuestionHandler) GetQuizQuestions(c fiber.Ctx) error {
	quizId := c.Params("quizId")
	userId := getUserIdFromToken(c)

	questions, err := h.svc.GetQuizQuestions(userId, quizId)
	if err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Quiz not found or unauthorized"})
	}

	return c.JSON(questions)
}

func (h *QuestionHandler) DeleteQuestion(c fiber.Ctx) error {
	questionId := c.Params("id")
	userId := getUserIdFromToken(c)

	if err := h.svc.DeleteQuestion(userId, questionId); err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized to delete this question or not found"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *QuestionHandler) UpdateQuestion(c fiber.Ctx) error {
	questionId := c.Params("id")
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var params map[string]interface{}
	if err := c.Bind().JSON(&params); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// SECURITY: Prevent Mass Assignment Vulnerability (Object Hijacking & Relocation)
	delete(params, "id")
	delete(params, "quiz_id")
	delete(params, "created_at")

	if err := h.svc.UpdateQuestion(userId, questionId, params); err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Failed to update question or unauthorized"})
	}

	return c.JSON(fiber.Map{"message": "Question updated successfully"})
}
