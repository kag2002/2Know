package repository

import (
	"gorm.io/gorm"

	"backend/internal/model"
)

type QuizRepository interface {
	CreateQuiz(quiz *model.Quiz) error
	GetQuizzes(teacherID string) ([]model.Quiz, error)
	GetQuizByID(id, teacherID string) (*model.Quiz, error)
	GetPublicQuizByID(id string) (*model.Quiz, error)
	UpdateQuiz(id string, teacherID string, params map[string]interface{}) error
	DeleteQuiz(id, teacherID string) error
	GetQuizzesByIDs(ids []string) ([]model.Quiz, error)
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
	err := r.db.Model(&model.Quiz{}).
		Select("quizzes.*, COUNT(test_results.id) as submissions, COALESCE(AVG(test_results.score), 0) as avg_score").
		Joins("LEFT JOIN test_results ON test_results.quiz_id = quizzes.id AND test_results.deleted_at IS NULL").
		Where("quizzes.teacher_id = ?", teacherID).
		Group("quizzes.id").
		Order("quizzes.created_at desc").
		Limit(200).
		Find(&quizzes).Error
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

func (r *quizRepository) GetPublicQuizByID(id string) (*model.Quiz, error) {
	var quiz model.Quiz
	// Only load published quizzes for guests
	err := r.db.Preload("Questions.Options").
		Where("id = ? AND status = 'published'", id).
		First(&quiz).Error
	if err != nil {
		return nil, err
	}
	return &quiz, nil
}

func (r *quizRepository) DeleteQuiz(id, teacherID string) error {
	return r.db.Where("id = ? AND teacher_id = ?", id, teacherID).Delete(&model.Quiz{}).Error
}

func (r *quizRepository) UpdateQuiz(id string, teacherID string, params map[string]interface{}) error {
	return r.db.Model(&model.Quiz{}).Where("id = ? AND teacher_id = ?", id, teacherID).Updates(params).Error
}

func (r *quizRepository) GetQuizzesByIDs(ids []string) ([]model.Quiz, error) {
	var quizzes []model.Quiz
	if len(ids) == 0 {
		return quizzes, nil
	}
	err := r.db.Select("id", "title").Where("id IN ?", ids).Find(&quizzes).Error
	return quizzes, err
}
