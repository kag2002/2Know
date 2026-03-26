package repository

import (
	"gorm.io/gorm"

	"backend/internal/model"
)

type QuizRepository interface {
	CreateQuiz(quiz *model.Quiz) error
	GetQuizzes(teacherID string) ([]model.Quiz, error)
	GetQuizByID(id, teacherID string) (*model.Quiz, error)
}

type quizRepository struct {
	db *gorm.DB
}

func NewQuizRepository(db *gorm.DB) QuizRepository {
	return &quizRepository{db: db}
}

func (r *quizRepository) CreateQuiz(quiz *model.Quiz) error {
	tx := r.db.Begin()
	if err := tx.Create(quiz).Error; err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit().Error
}

func (r *quizRepository) GetQuizzes(teacherID string) ([]model.Quiz, error) {
	var quizzes []model.Quiz
	err := r.db.Where("teacher_id = ?", teacherID).Order("created_at desc").Find(&quizzes).Error
	return quizzes, err
}

func (r *quizRepository) GetQuizByID(id, teacherID string) (*model.Quiz, error) {
	var quiz model.Quiz
	err := r.db.Preload("Questions.Options").
		Where("id = ? AND teacher_id = ?", id, teacherID).
		First(&quiz).Error
	if err != nil {
		return nil, err
	}
	return &quiz, nil
}
