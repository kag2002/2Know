package repository

import (
	"gorm.io/gorm"

	"backend/internal/model"
)

type QuestionRepository interface {
	GetQuestions() ([]model.Question, error)
	GetQuizQuestions(quizID string) ([]model.Question, error)
	GetQuestionByID(id string) (*model.Question, error)
	CreateQuestion(question *model.Question) error
	DeleteQuestion(question *model.Question) error
	VerifyQuizOwnership(quizID, teacherID string) error
}

type questionRepository struct {
	db *gorm.DB
}

func NewQuestionRepository(db *gorm.DB) QuestionRepository {
	return &questionRepository{db: db}
}

func (r *questionRepository) GetQuestions() ([]model.Question, error) {
	var questions []model.Question
	err := r.db.Preload("Options").Order("created_at desc").Find(&questions).Error
	return questions, err
}

func (r *questionRepository) GetQuizQuestions(quizID string) ([]model.Question, error) {
	var questions []model.Question
	err := r.db.Preload("Options").Where("quiz_id = ?", quizID).Order("order_index asc").Find(&questions).Error
	return questions, err
}

func (r *questionRepository) GetQuestionByID(id string) (*model.Question, error) {
	var question model.Question
	err := r.db.First(&question, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &question, nil
}

func (r *questionRepository) CreateQuestion(question *model.Question) error {
	return r.db.Create(question).Error
}

func (r *questionRepository) DeleteQuestion(question *model.Question) error {
	return r.db.Delete(question).Error
}

func (r *questionRepository) VerifyQuizOwnership(quizID, teacherID string) error {
	var quiz model.Quiz
	return r.db.Where("id = ? AND teacher_id = ?", quizID, teacherID).First(&quiz).Error
}
