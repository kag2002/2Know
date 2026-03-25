package handler

import (
	"log"

	"github.com/gofiber/fiber/v3"

	"backend/internal/config"
	"backend/internal/model"
)

// In a real application, Question Bank questions might not have a QuizID initially,
// or QuizID could be nullable. Since our model mapped QuizID as strongly tied,
// a generic question bank might use a special nullable QuizID or a separate BankQuestion model.
// For now, we will handle creating generic questions related to the teacher.
// We'll update the GORM query to reflect "IsBank" if needed, but for now we'll do standard CRUD.

func CreateQuestion(c fiber.Ctx) error {
	var question model.Question
	if err := c.Bind().JSON(&question); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	// For standard quiz questions, QuizID must be provided in the body.
	// We verify the teacher owns the quiz if QuizID is present.
	if question.QuizID != "" {
		var quiz model.Quiz
		if err := config.DB.Where("id = ? AND teacher_id = ?", question.QuizID, userId).First(&quiz).Error; err != nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Not authorized to add to this quiz"})
		}
	}

	if err := config.DB.Create(&question).Error; err != nil {
		log.Printf("Error creating question: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create question"})
	}

	return c.Status(fiber.StatusCreated).JSON(question)
}

func GetQuizQuestions(c fiber.Ctx) error {
	quizId := c.Params("quizId")
	userId := getUserIdFromToken(c)

	// Verify ownership
	var quiz model.Quiz
	if err := config.DB.Where("id = ? AND teacher_id = ?", quizId, userId).First(&quiz).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Quiz not found or unauthorized"})
	}

	var questions []model.Question
	if err := config.DB.Preload("Options").Where("quiz_id = ?", quizId).Order("order_index asc").Find(&questions).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch questions"})
	}

	return c.JSON(questions)
}

func DeleteQuestion(c fiber.Ctx) error {
	questionId := c.Params("id")
	
	// Complex authorization: check if the teacher owns the quiz the question belongs to
	userId := getUserIdFromToken(c)

	var question model.Question
	if err := config.DB.First(&question, "id = ?", questionId).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Question not found"})
	}

	var quiz model.Quiz
	if err := config.DB.Where("id = ? AND teacher_id = ?", question.QuizID, userId).First(&quiz).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized to delete this question"})
	}

	if err := config.DB.Delete(&question).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete question"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
