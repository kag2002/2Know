package handler

import (
	"github.com/gofiber/fiber/v3"

	"backend/internal/service"
)

type StatsHandler struct {
	svc service.StatsService
}

func NewStatsHandler(svc service.StatsService) *StatsHandler {
	return &StatsHandler{svc: svc}
}

// GetDashboardStats returns aggregate stats for the teacher dashboard
func (h *StatsHandler) GetDashboardStats(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	stats, err := h.svc.GetDashboardOverview(userId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load dashboard stats"})
	}

	return c.JSON(fiber.Map{
		"total_quizzes":     stats.TotalQuizzes,
		"active_quizzes":    stats.ActiveQuizzes,
		"total_submissions": stats.TotalSubmissions,
		"week_submissions":  stats.WeekSubmissions,
		"avg_score":         stats.AvgScore,
		"total_classes":     stats.TotalClasses,
		"total_students":    stats.TotalStudents,
		"total_questions":   stats.TotalQuestions,
	})
}
