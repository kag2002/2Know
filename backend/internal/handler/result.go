package handler

import (
	"log"

	"github.com/gofiber/fiber/v3"

	"backend/internal/model"
	"backend/internal/service"
)

type ResultHandler struct {
	svc service.ResultService
}

func NewResultHandler(svc service.ResultService) *ResultHandler {
	return &ResultHandler{svc: svc}
}

func (h *ResultHandler) SubmitTest(c fiber.Ctx) error {
	var result model.TestResult
	if err := c.Bind().JSON(&result); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := h.svc.SubmitTest(&result); err != nil {
		log.Printf("Error submitting test: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to submit test or quiz not found"})
	}

	return c.Status(fiber.StatusCreated).JSON(result)
}

func (h *ResultHandler) GetQuizResults(c fiber.Ctx) error {
	quizId := c.Params("quizId")
	userId := getUserIdFromToken(c)

	results, err := h.svc.GetQuizResults(userId, quizId)
	if err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized to view these results or quiz not found"})
	}

	return c.JSON(results)
}
