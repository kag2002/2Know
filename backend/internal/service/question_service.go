package service

import (
	"backend/internal/model"
	"backend/internal/repository"
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
	// Verify the teacher owns the quiz if QuizID is present.
	if question.QuizID != "" {
		if err := s.repo.VerifyQuizOwnership(question.QuizID, teacherID); err != nil {
			return err
		}
	}
	return s.repo.CreateQuestion(question)
}

func (s *questionService) CreateBatchQuestions(teacherID string, questions []model.Question) error {
	if len(questions) == 0 {
		return nil
	}
	
	// If the batch belongs to a quiz, verify ownership logic
	// But in the AI generate context, they usually go straight to Question Bank (QuizID = "")
	// We'll trust the caller to enforce ownership if QuizID is present.
	for _, q := range questions {
		if q.QuizID != "" {
			if err := s.repo.VerifyQuizOwnership(q.QuizID, teacherID); err != nil {
				return err
			}
		}
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

	if question.QuizID != "" {
		if err := s.repo.VerifyQuizOwnership(question.QuizID, teacherID); err != nil {
			return err
		}
	}

	return s.repo.DeleteQuestion(question)
}

func (s *questionService) UpdateQuestion(teacherID, questionID string, params map[string]interface{}) error {
	question, err := s.repo.GetQuestionByID(questionID)
	if err != nil {
		return err
	}

	if question.QuizID != "" {
		if err := s.repo.VerifyQuizOwnership(question.QuizID, teacherID); err != nil {
			return err
		}
	}

	return s.repo.UpdateQuestion(questionID, params)
}
