package repository

import (
	"time"

	"gorm.io/gorm"

	"backend/internal/model"
)

type ActivityItem struct {
	Name        string `json:"name"`
	Action      string `json:"action"`
	Time        string `json:"time"`
	Date        string `json:"date"`
	DateISO     string `json:"dateIso"`
	Status      string `json:"status"`
	StatusColor string `json:"statusColor"`
}

type ScoreDist struct {
	Excellent int `json:"excellent"` // >= 8
	Good      int `json:"good"`      // >= 6.5 < 8
	Average   int `json:"average"`   // >= 5 < 6.5
	Poor      int `json:"poor"`      // < 5
}

type DashboardStats struct {
	TotalQuizzes      int64
	ActiveQuizzes     int64
	TotalSubmissions  int64
	WeekSubmissions   int64
	AvgScore          float64
	TotalClasses      int64
	TotalStudents     int64
	TotalQuestions    int64
	ScoreDistribution ScoreDist
	RecentActivity    []ActivityItem
}

type StatsRepository interface {
	GetDashboardStats(teacherID string) (*DashboardStats, error)
}

type statsRepository struct {
	db *gorm.DB
}

func NewStatsRepository(db *gorm.DB) StatsRepository {
	return &statsRepository{db: db}
}

func (r *statsRepository) GetDashboardStats(teacherID string) (*DashboardStats, error) {
	stats := &DashboardStats{}

	r.db.Model(&model.Quiz{}).Where("teacher_id = ?", teacherID).Count(&stats.TotalQuizzes)
	r.db.Model(&model.Quiz{}).Where("teacher_id = ? AND status = ?", teacherID, "published").Count(&stats.ActiveQuizzes)

	r.db.Model(&model.TestResult{}).
		Joins("JOIN quizzes ON quizzes.id = test_results.quiz_id").
		Where("quizzes.teacher_id = ?", teacherID).
		Count(&stats.TotalSubmissions)

	r.db.Model(&model.TestResult{}).
		Joins("JOIN quizzes ON quizzes.id = test_results.quiz_id").
		Where("quizzes.teacher_id = ? AND test_results.created_at >= NOW() - INTERVAL '7 days'", teacherID).
		Count(&stats.WeekSubmissions)

	r.db.Model(&model.TestResult{}).
		Joins("JOIN quizzes ON quizzes.id = test_results.quiz_id").
		Where("quizzes.teacher_id = ?", teacherID).
		Select("COALESCE(AVG(score), 0)").
		Scan(&stats.AvgScore)

	r.db.Model(&model.Class{}).Where("teacher_id = ?", teacherID).Count(&stats.TotalClasses)

	r.db.Model(&model.Student{}).
		Joins("JOIN classes ON classes.id = students.class_id").
		Where("classes.teacher_id = ?", teacherID).
		Count(&stats.TotalStudents)

	// M2M: Count questions via join table, not direct quiz_id on questions
	r.db.Model(&model.QuizQuestion{}).
		Joins("JOIN quizzes ON quizzes.id = quiz_questions.quiz_id").
		Where("quizzes.teacher_id = ?", teacherID).
		Count(&stats.TotalQuestions)

	// Recent Activity
	var recentResults []struct {
		StudentName string
		QuizTitle   string
		Score       float64
		CreatedAt   time.Time
		Status      string
	}
	r.db.Table("test_results").
		Select("test_results.student_name, quizzes.title as quiz_title, test_results.score, test_results.created_at, test_results.status").
		Joins("JOIN quizzes ON quizzes.id = test_results.quiz_id").
		Where("quizzes.teacher_id = ?", teacherID).
		Order("test_results.created_at DESC").
		Limit(5).
		Scan(&recentResults)

	for _, res := range recentResults {
		statusStr := "Hoàn tất"
		statusColor := "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400"
		if res.Status == "pending" {
			statusStr = "Chờ chấm"
			statusColor = "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400"
		} else if res.Status == "cheating_flagged" {
			statusStr = "Vi phạm"
			statusColor = "text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400"
		}

		stats.RecentActivity = append(stats.RecentActivity, ActivityItem{
			Name:        res.StudentName,
			Action:      "nộp bài " + res.QuizTitle,
			Time:        res.CreatedAt.Format("15:04"),
			Date:        res.CreatedAt.Format("02/01"),
			DateISO:     res.CreatedAt.Format(time.RFC3339),
			Status:      statusStr,
			StatusColor: statusColor,
		})
	}

	// Score Distribution
	var scores []float64
	r.db.Table("test_results").
		Joins("JOIN quizzes ON quizzes.id = test_results.quiz_id").
		Where("quizzes.teacher_id = ? AND test_results.status = 'completed'", teacherID).
		Pluck("score", &scores)

	for _, s := range scores {
		if s >= 8.0 {
			stats.ScoreDistribution.Excellent++
		} else if s >= 6.5 {
			stats.ScoreDistribution.Good++
		} else if s >= 5.0 {
			stats.ScoreDistribution.Average++
		} else {
			stats.ScoreDistribution.Poor++
		}
	}

	return stats, nil
}
