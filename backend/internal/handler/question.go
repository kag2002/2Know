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

	if err := validateQuestionLogic(&question); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Logic validation failed: " + err.Error()})
	}

	// SECURITY: Strip Stored XSS payloads from Rich Text Content
	utils.SanitizeQuestion(&question)

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

func (h *QuestionHandler) BatchCreateQuestions(c fiber.Ctx) error {
	var body struct {
		Questions []model.Question `json:"questions"`
	}

	if err := c.Bind().JSON(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body format"})
	}

	if len(body.Questions) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Questions array cannot be empty"})
	}

	for i := range body.Questions {
		if err := utils.ValidateStruct(&body.Questions[i]); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Validation failed on a question: " + err.Error()})
		}

		if err := validateQuestionLogic(&body.Questions[i]); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Logic validation failed on a question: " + err.Error()})
		}

		// SECURITY: Strip Stored XSS payloads from every question in the batch
		utils.SanitizeQuestion(&body.Questions[i])
	}

	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	if err := h.svc.CreateBatchQuestions(userId, body.Questions); err != nil {
		log.Printf("Error creating batch questions: %v", err)
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Not authorized or failed to create batch"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Successfully created batch questions",
		"count":   len(body.Questions),
	})
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
	delete(params, "teacher_id") // Prevent ownership takeover
	// Note: quiz_id is no longer part of question, it's M2M now.
	delete(params, "created_at")

	// SECURITY: Strip Stored XSS payloads from arbitrary map fields
	utils.SanitizeMap(params)

	if err := h.svc.UpdateQuestion(userId, questionId, params); err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Failed to update question or unauthorized"})
	}

	return c.JSON(fiber.Map{"message": "Question updated successfully"})
}

// SECURITY: Structural Integrity bounds to prevent Next.js UI mapping failures
func validateQuestionLogic(q *model.Question) error {
	// TODO: Add robust datatypes.JSON validation for Multiple Choice Metadata formats
	return nil
}
