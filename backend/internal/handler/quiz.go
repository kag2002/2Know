package handler

import (
	"log"

	"github.com/gofiber/fiber/v3"

	"backend/internal/model"
	"backend/internal/service"
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
