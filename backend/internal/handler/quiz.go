package handler

import (
	"log"

	"github.com/gofiber/fiber/v3"

	"backend/internal/model"
	"backend/internal/service"
	"backend/internal/utils"
)

type QuizHandler struct {
	svc service.QuizService
}

func NewQuizHandler(svc service.QuizService) *QuizHandler {
	return &QuizHandler{svc: svc}
}

func (h *QuizHandler) CreateQuiz(c fiber.Ctx) error {
	var quiz model.Quiz
	if err := c.Bind().JSON(&quiz); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}
	
	if err := utils.ValidateStruct(&quiz); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Validation failed: " + err.Error()})
	}

	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	if err := h.svc.CreateQuiz(userId, &quiz); err != nil {
		log.Printf("Error creating quiz: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create quiz"})
	}

	return c.Status(fiber.StatusCreated).JSON(quiz)
}

func (h *QuizHandler) GetQuizzes(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	quizzes, err := h.svc.GetQuizzes(userId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch quizzes"})
	}

	return c.JSON(quizzes)
}

func (h *QuizHandler) GetQuizByID(c fiber.Ctx) error {
	id := c.Params("id")
	userId := getUserIdFromToken(c)

	quiz, err := h.svc.GetQuizByID(id, userId)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Quiz not found or unauthorized"})
	}

	return c.JSON(quiz)
}

func (h *QuizHandler) GetPublicQuizByID(c fiber.Ctx) error {
	id := c.Params("id")

	quiz, err := h.svc.GetPublicQuizByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Quiz not found or not published"})
	}

	return c.JSON(quiz)
}

func (h *QuizHandler) DeleteQuiz(c fiber.Ctx) error {
	id := c.Params("id")
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	if err := h.svc.DeleteQuiz(id, userId); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete quiz"})
	}

	return c.JSON(fiber.Map{"message": "Quiz successfully deleted"})
}

func (h *QuizHandler) UpdateQuiz(c fiber.Ctx) error {
	id := c.Params("id")
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var params map[string]interface{}
	if err := c.Bind().JSON(&params); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// SECURITY: Prevent Mass Assignment Vulnerability (Entity Relocation)
	// Never allow the user to modify primary keys or ownership links
	delete(params, "id")
	delete(params, "teacher_id")
	delete(params, "created_at")

	if err := h.svc.UpdateQuiz(id, userId, params); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update quiz"})
	}

	// Just return success message, the frontend reloads the list anyway
	return c.JSON(fiber.Map{"message": "Quiz updated successfully"})
}
