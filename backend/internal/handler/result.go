package handler

import (
	"log"

	"github.com/gofiber/fiber/v3"

	"backend/internal/config"
	"backend/internal/model"
)

// SubmitTest Endpoint (Public/Guest accessible if they have the link)
func SubmitTest(c fiber.Ctx) error {
	var result model.TestResult
	if err := c.Bind().JSON(&result); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Verify Quiz Exists
	var quiz model.Quiz
	if err := config.DB.Where("id = ?", result.QuizID).First(&quiz).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Quiz not found"})
	}

	// In a real application, score calculation happens on the backend here 
	// based on the answers array mapping to the actual Question Models.
	// For simulation, we trust the incoming object's scores or mock them.

	if err := config.DB.Create(&result).Error; err != nil {
		log.Printf("Error submitting test: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to submit test"})
	}

	return c.Status(fiber.StatusCreated).JSON(result)
}

// GetQuizResults for the Teacher Dashboard
func GetQuizResults(c fiber.Ctx) error {
	quizId := c.Params("quizId")
	userId := getUserIdFromToken(c)

	// Verify teacher owns the quiz
	var quiz model.Quiz
	if err := config.DB.Where("id = ? AND teacher_id = ?", quizId, userId).First(&quiz).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized to view these results"})
	}

	var results []model.TestResult
	if err := config.DB.Where("quiz_id = ?", quizId).Order("score desc").Find(&results).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch results"})
	}

	// Calculate aggregations (average score, highest, lowest) could be done
	// via SQL AVG() query or in Go. We'll send raw data.
	return c.JSON(results)
}
