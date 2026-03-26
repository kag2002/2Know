package repository

import (
	"gorm.io/gorm"

	"backend/internal/model"
)

type DashboardStats struct {
	TotalQuizzes     int64
	ActiveQuizzes    int64
	TotalSubmissions int64
	WeekSubmissions  int64
	AvgScore         float64
	TotalClasses     int64
	TotalStudents    int64
	TotalQuestions   int64
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

	r.db.Model(&model.Question{}).
		Joins("JOIN quizzes ON quizzes.id = questions.quiz_id").
		Where("quizzes.teacher_id = ?", teacherID).
		Count(&stats.TotalQuestions)

	return stats, nil
}
