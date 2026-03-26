package handler

import (
	"github.com/gofiber/fiber/v3"

	"backend/internal/config"
	"backend/internal/model"
)

// GetDashboardStats returns aggregate stats for the teacher dashboard
func GetDashboardStats(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var quizCount int64
	config.DB.Model(&model.Quiz{}).Where("teacher_id = ?", userId).Count(&quizCount)

	var publishedCount int64
	config.DB.Model(&model.Quiz{}).Where("teacher_id = ? AND status = ?", userId, "published").Count(&publishedCount)

	var resultCount int64
	config.DB.Model(&model.TestResult{}).
		Joins("JOIN quizzes ON quizzes.id = test_results.quiz_id").
		Where("quizzes.teacher_id = ?", userId).
		Count(&resultCount)

	var last7dayResults int64
	config.DB.Model(&model.TestResult{}).
		Joins("JOIN quizzes ON quizzes.id = test_results.quiz_id").
		Where("quizzes.teacher_id = ? AND test_results.created_at >= NOW() - INTERVAL '7 days'", userId).
		Count(&last7dayResults)

	var avgScore float64
	config.DB.Model(&model.TestResult{}).
		Joins("JOIN quizzes ON quizzes.id = test_results.quiz_id").
		Where("quizzes.teacher_id = ?", userId).
		Select("COALESCE(AVG(score), 0)").
		Scan(&avgScore)

	var classCount int64
	config.DB.Model(&model.Class{}).Where("teacher_id = ?", userId).Count(&classCount)

	var studentCount int64
	config.DB.Model(&model.Student{}).
		Joins("JOIN classes ON classes.id = students.class_id").
		Where("classes.teacher_id = ?", userId).
		Count(&studentCount)

	var questionCount int64
	config.DB.Model(&model.Question{}).
		Joins("JOIN quizzes ON quizzes.id = questions.quiz_id").
		Where("quizzes.teacher_id = ?", userId).
		Count(&questionCount)

	return c.JSON(fiber.Map{
		"total_quizzes":     quizCount,
		"active_quizzes":    publishedCount,
		"total_submissions": resultCount,
		"week_submissions":  last7dayResults,
		"avg_score":         avgScore,
		"total_classes":     classCount,
		"total_students":    studentCount,
		"total_questions":   questionCount,
	})
}
