package service

import (
	"backend/internal/model"
	"backend/internal/repository"
	"errors"
)

type QuestionService interface {
	GetQuestions(teacherID string) ([]model.Question, error)
	CreateQuestion(teacherID string, question *model.Question) error
	CreateBatchQuestions(teacherID string, questions []model.Question) error
	GetQuizQuestions(teacherID, quizID string) ([]model.Question, error)
	UpdateQuestion(teacherID, questionID string, params map[string]interface{}) error
	DeleteQuestion(teacherID, questionID string) error
}

type questionService struct {
	repo repository.QuestionRepository
}

func NewQuestionService(repo repository.QuestionRepository) QuestionService {
	return &questionService{repo: repo}
}

func (s *questionService) GetQuestions(teacherID string) ([]model.Question, error) {
	return s.repo.GetQuestions(teacherID)
}

func (s *questionService) CreateQuestion(teacherID string, question *model.Question) error {
	// Automatically enforce global ownership
	question.TeacherID = teacherID
	return s.repo.CreateQuestion(question)
}

func (s *questionService) CreateBatchQuestions(teacherID string, questions []model.Question) error {
	if len(questions) == 0 {
		return nil
	}

	// Automatically enforce global ownership
	for i := range questions {
		questions[i].TeacherID = teacherID
	}

	return s.repo.CreateBatchQuestions(questions)
}

func (s *questionService) GetQuizQuestions(teacherID, quizID string) ([]model.Question, error) {
	if err := s.repo.VerifyQuizOwnership(quizID, teacherID); err != nil {
		return nil, err
	}
	return s.repo.GetQuizQuestions(quizID)
}

func (s *questionService) DeleteQuestion(teacherID, questionID string) error {
	question, err := s.repo.GetQuestionByID(questionID)
	if err != nil {
		return err
	}

	if question.TeacherID != teacherID {
		// Attempted to delete another teacher's question
		return errors.New("unauthorized")
	}

	return s.repo.DeleteQuestion(question)
}

func (s *questionService) UpdateQuestion(teacherID, questionID string, params map[string]interface{}) error {
	question, err := s.repo.GetQuestionByID(questionID)
	if err != nil {
		return err
	}

	if question.TeacherID != teacherID {
		return errors.New("unauthorized")
	}

	return s.repo.UpdateQuestion(questionID, params)
}
