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
	err := r.db.Where("quiz_id = ?", quizID).Order("score desc").Find(&results).Error
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
		Find(&results).Error
	return results, err
}
