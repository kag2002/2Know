package handler

import (
	"fmt"

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
		"total_quizzes":      stats.TotalQuizzes,
		"active_quizzes":     stats.ActiveQuizzes,
		"total_submissions":  stats.TotalSubmissions,
		"week_submissions":   stats.WeekSubmissions,
		"avg_score":          stats.AvgScore,
		"total_classes":      stats.TotalClasses,
		"total_students":     stats.TotalStudents,
		"total_questions":    stats.TotalQuestions,
		"score_distribution": stats.ScoreDistribution,
		"recent_activity":    stats.RecentActivity,
	})
}

// ExportCSV triggers a download of basic usage metrics in a generic CSV format
func (h *StatsHandler) ExportCSV(c fiber.Ctx) error {
	userId := getUserIdFromToken(c)
	if userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	stats, err := h.svc.GetDashboardOverview(userId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load dashboard stats"})
	}

	c.Set("Content-Type", "text/csv; charset=utf-8")
	c.Set("Content-Disposition", "attachment; filename=\"2know_report.csv\"")

	// Use Sprintf for easy CSV concatenation
	csvOutput := "Metrics,Value\n"
	csvOutput += fmt.Sprintf("Total Students,%d\n", stats.TotalStudents)
	csvOutput += fmt.Sprintf("Total Classes,%d\n", stats.TotalClasses)
	csvOutput += fmt.Sprintf("Total Quizzes,%d\n", stats.TotalQuizzes)
	csvOutput += fmt.Sprintf("Active Quizzes,%d\n", stats.ActiveQuizzes)
	csvOutput += fmt.Sprintf("Total Questions,%d\n", stats.TotalQuestions)
	csvOutput += fmt.Sprintf("Total Submissions,%d\n", stats.TotalSubmissions)
	csvOutput += fmt.Sprintf("Average Score,%.2f\n", stats.AvgScore)

	return c.SendString(csvOutput)
}
