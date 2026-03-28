package handler

import (
	"log"

	"github.com/gofiber/fiber/v3"

	"backend/internal/model"
	"backend/internal/service"
	"backend/internal/utils"
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

	if err := utils.ValidateStruct(&result); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Validation failed: " + err.Error()})
	}

	if err := h.svc.SubmitTest(&result); err != nil {
		log.Printf("Error submitting test: %v", err)

		// SECURITY: Classify Business Logic errors (safe to expose) vs System errors (hide details)
		errMsg := err.Error()
		if errMsg == "quiz has not started yet" ||
			errMsg == "quiz has already closed" ||
			errMsg == "maximum attempts reached for this student" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": errMsg})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Hệ thống không thể xử lý bài nộp. Vui lòng thử lại sau."})
	}

	// SECURITY: Minimize response — only return essential fields, not full model with answers
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id":     result.ID,
		"score":  result.Score,
		"status": result.Status,
	})
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

func (h *ResultHandler) GetPendingGradings(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	gradings, err := h.svc.GetPendingGradings(userId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch pending gradings"})
	}

	return c.JSON(gradings)
}

func (h *ResultHandler) GradeSubmission(c fiber.Ctx) error {
	id := c.Params("id")
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req struct {
		Score float64 `json:"score"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := h.svc.GradeSubmission(userId, id, req.Score); err != nil {
		log.Printf("Error grading submission: %v", err)

		// SECURITY: Classify Business Logic errors vs System errors
		errMsg := err.Error()
		if errMsg == "score exceeds max points" ||
			errMsg == "score cannot be negative" ||
			errMsg == "essay question not found" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": errMsg})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Không thể chấm bài. Vui lòng thử lại sau."})
	}

	return c.JSON(fiber.Map{"message": "Graded successfully"})
}

func (h *ResultHandler) GetClassGradebook(c fiber.Ctx) error {
	classId := c.Params("id")
	userId := getUserIdFromToken(c)

	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	gradebook, err := h.svc.GetClassGradebook(userId, classId)
	if err != nil {
		log.Printf("Error fetching gradebook: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Không thể tải bảng điểm. Vui lòng thử lại sau."})
	}

	return c.JSON(gradebook)
}

func (h *ResultHandler) GetStudentHistory(c fiber.Ctx) error {
	studentId := c.Params("id")
	teacherID := getUserIdFromToken(c)

	if teacherID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	history, err := h.svc.GetStudentHistory(studentId, teacherID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch student history"})
	}

	return c.JSON(history)
}
