package repository

import (
	"gorm.io/gorm"

	"backend/internal/model"
)

type ResultRepository interface {
	CreateResult(result *model.TestResult) error
	GetQuizResults(quizID string) ([]model.TestResult, error)
	VerifyQuizOwnership(quizID, teacherID string) error
	VerifyQuizExists(quizID string) error
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
