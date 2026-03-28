package repository

import (
	"gorm.io/gorm"

	"backend/internal/model"
)

type ResultRepository interface {
	CreateResult(result *model.TestResult) error
	GetResultByID(id string) (*model.TestResult, error)
	UpdateResult(result *model.TestResult) error
	GetQuizResults(quizID string) ([]model.TestResult, error)
	VerifyQuizOwnership(quizID, teacherID string) error
	VerifyQuizExists(quizID string) error
	GetPendingResults(teacherID string) ([]model.TestResult, error)
	GetResultsByStudentIDs(studentIDs []string) ([]model.TestResult, error)
	GetStudentHistory(studentID string, teacherID string) ([]struct{
		ID string `json:"id"`
		QuizTitle string `json:"quiz_title"`
		Score float64 `json:"score"`
		Status string `json:"status"`
		CreatedAt string `json:"created_at"`
		TimeTakenSeconds int `json:"time_taken_seconds"`
	}, error)
	GetAttemptCount(quizID string, studentIdentifier string) (int64, error)
}

type resultRepository struct {
	db *gorm.DB
}

func NewResultRepository(db *gorm.DB) ResultRepository {
	return &resultRepository{db: db}
}

func (r *resultRepository) CreateResult(result *model.TestResult) error {
	return r.db.Create(result).Error
}

func (r *resultRepository) GetResultByID(id string) (*model.TestResult, error) {
	var result model.TestResult
	err := r.db.First(&result, "id = ?", id).Error
	return &result, err
}

func (r *resultRepository) UpdateResult(result *model.TestResult) error {
	return r.db.Save(result).Error
}

func (r *resultRepository) GetQuizResults(quizID string) ([]model.TestResult, error) {
	var results []model.TestResult
	err := r.db.Where("quiz_id = ?", quizID).Order("score desc").Limit(500).Find(&results).Error
	return results, err
}

func (r *resultRepository) VerifyQuizOwnership(quizID, teacherID string) error {
	var quiz model.Quiz
	return r.db.Where("id = ? AND teacher_id = ?", quizID, teacherID).First(&quiz).Error
}

func (r *resultRepository) VerifyQuizExists(quizID string) error {
	var quiz model.Quiz
	return r.db.Where("id = ?", quizID).First(&quiz).Error
}

func (r *resultRepository) GetPendingResults(teacherID string) ([]model.TestResult, error) {
	var results []model.TestResult
	err := r.db.
		Joins("JOIN quizzes ON quizzes.id = test_results.quiz_id").
		Where("quizzes.teacher_id = ? AND test_results.status = ?", teacherID, "pending").
		Limit(500).
		Find(&results).Error
	return results, err
}

func (r *resultRepository) GetResultsByStudentIDs(studentIDs []string) ([]model.TestResult, error) {
	var results []model.TestResult
	if len(studentIDs) == 0 {
		return results, nil
	}
	err := r.db.Select("id", "quiz_id", "student_id", "score", "total_correct", "total_incorrect", "status", "created_at").
		Where("student_id IN ?", studentIDs).Find(&results).Error
	return results, err
}

func (r *resultRepository) GetStudentHistory(studentID string, teacherID string) ([]struct{
	ID string `json:"id"`
	QuizTitle string `json:"quiz_title"`
	Score float64 `json:"score"`
	Status string `json:"status"`
	CreatedAt string `json:"created_at"`
	TimeTakenSeconds int `json:"time_taken_seconds"`
}, error) {
	var history []struct{
		ID string `json:"id"`
		QuizTitle string `json:"quiz_title"`
		Score float64 `json:"score"`
		Status string `json:"status"`
		CreatedAt string `json:"created_at"`
		TimeTakenSeconds int `json:"time_taken_seconds"`
	}

	err := r.db.Table("test_results").
		Select("test_results.id, quizzes.title as quiz_title, test_results.score, test_results.status, test_results.created_at, test_results.time_taken_seconds").
		Joins("JOIN quizzes ON quizzes.id = test_results.quiz_id").
		Where("test_results.student_id = ? AND quizzes.teacher_id = ?", studentID, teacherID).
		Order("test_results.created_at DESC").
		Limit(100).
		Scan(&history).Error

	return history, err
}

func (r *resultRepository) GetAttemptCount(quizID string, studentIdentifier string) (int64, error) {
	var count int64
	err := r.db.Model(&model.TestResult{}).
		Where("quiz_id = ? AND student_identifier = ?", quizID, studentIdentifier).
		Count(&count).Error
	return count, err
}
