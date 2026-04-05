package repository

import (
	"gorm.io/gorm"

	"backend/internal/model"
)

type QuestionRepository interface {
	GetQuestions(teacherID string) ([]model.Question, error)
	GetQuizQuestions(quizID string) ([]model.Question, error)
	GetQuestionByID(id string) (*model.Question, error)
	CreateQuestion(question *model.Question) error
	CreateBatchQuestions(questions []model.Question) error
	UpdateQuestion(id string, params map[string]interface{}) error
	DeleteQuestion(question *model.Question) error
	VerifyQuizOwnership(quizID, teacherID string) error
}

type questionRepository struct {
	db *gorm.DB
}

func NewQuestionRepository(db *gorm.DB) QuestionRepository {
	return &questionRepository{db: db}
}

func (r *questionRepository) GetQuestions(teacherID string) ([]model.Question, error) {
	var questions []model.Question
	// SECURITY: Scope questions to teacher's ownership (via teacher_id on question itself)
	err := r.db.
		Where("teacher_id = ?", teacherID).
		Order("created_at desc").
		Limit(200).
		Find(&questions).Error
	return questions, err
}

func (r *questionRepository) GetQuizQuestions(quizID string) ([]model.Question, error) {
	var questions []model.Question
	// M2M: Use quiz_questions join table to find questions belonging to a quiz
	err := r.db.
		Joins("JOIN quiz_questions ON quiz_questions.question_id = questions.id").
		Where("quiz_questions.quiz_id = ?", quizID).
		Order("quiz_questions.order_index asc").
		Find(&questions).Error
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

func (r *questionRepository) CreateBatchQuestions(questions []model.Question) error {
	return r.db.CreateInBatches(questions, 100).Error
}

func (r *questionRepository) DeleteQuestion(question *model.Question) error {
	return r.db.Delete(question).Error
}

func (r *questionRepository) UpdateQuestion(id string, params map[string]interface{}) error {
	return r.db.Model(&model.Question{}).Where("id = ?", id).Updates(params).Error
}

func (r *questionRepository) VerifyQuizOwnership(quizID, teacherID string) error {
	var quiz model.Quiz
	return r.db.Where("id = ? AND teacher_id = ?", quizID, teacherID).First(&quiz).Error
}
