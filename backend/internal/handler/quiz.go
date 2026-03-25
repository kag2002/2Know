package handler

import (
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"

	"backend/internal/config"
	"backend/internal/model"
)

// Get user ID from JWT token payload
func getUserIdFromToken(c fiber.Ctx) string {
	user := c.Locals("user")
	if user == nil {
		return ""
	}
	token := user.(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	return claims["sub"].(string)
}

func CreateQuiz(c fiber.Ctx) error {
	var quiz model.Quiz
	if err := c.Bind().JSON(&quiz); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	quiz.TeacherID = userId

	// Use transaction to ensure full creation
	tx := config.DB.Begin()
	if err := tx.Create(&quiz).Error; err != nil {
		tx.Rollback()
		log.Printf("Error creating quiz: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create quiz"})
	}
	tx.Commit()

	return c.Status(fiber.StatusCreated).JSON(quiz)
}

func GetQuizzes(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var quizzes []model.Quiz
	// Fetch quizzes mapped to the teacher, preloading limited relationships if necessary
	if err := config.DB.Where("teacher_id = ?", userId).Order("created_at desc").Find(&quizzes).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch quizzes"})
	}

	return c.JSON(quizzes)
}

func GetQuizByID(c fiber.Ctx) error {
	id := c.Params("id")
	userId := getUserIdFromToken(c)

	var quiz model.Quiz
	if err := config.DB.Preload("Questions.Options").Where("id = ? AND teacher_id = ?", id, userId).First(&quiz).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Quiz not found or unauthorized"})
	}

	return c.JSON(quiz)
}
