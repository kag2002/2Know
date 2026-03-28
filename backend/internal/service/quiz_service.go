package service

import (
	"time"

	"backend/internal/model"
	"backend/internal/repository"
)

type QuizService interface {
	CreateQuiz(teacherID string, quiz *model.Quiz) error
	GetQuizzes(teacherID string) ([]model.Quiz, error)
	GetQuizByID(id, teacherID string) (*model.Quiz, error)
	GetPublicQuizByID(id string) (*model.Quiz, error)
	UpdateQuiz(id string, teacherID string, params map[string]interface{}) error
	DeleteQuiz(id, teacherID string) error
}

type quizService struct {
	repo repository.QuizRepository
}

func NewQuizService(repo repository.QuizRepository) QuizService {
	return &quizService{repo: repo}
}

func (s *quizService) CreateQuiz(teacherID string, quiz *model.Quiz) error {
	quiz.TeacherID = teacherID
	return s.repo.CreateQuiz(quiz)
}

func (s *quizService) GetQuizzes(teacherID string) ([]model.Quiz, error) {
	return s.repo.GetQuizzes(teacherID)
}

func (s *quizService) GetQuizByID(id, teacherID string) (*model.Quiz, error) {
	return s.repo.GetQuizByID(id, teacherID)
}

func (s *quizService) GetPublicQuizByID(id string) (*model.Quiz, error) {
	quiz, err := s.repo.GetPublicQuizByID(id)
	if err != nil {
		return nil, err
	}

	// SECURITY: Pre-fetch exploit prevention
	// If the quiz hasn't started yet, or has already closed, hide the questions.
	now := time.Now()
	if (quiz.OpenTime != nil && now.Before(*quiz.OpenTime)) || (quiz.CloseTime != nil && now.After(*quiz.CloseTime)) {
		quiz.Questions = nil
		return quiz, nil
	}

	// SECURITY: Strip the IsCorrect flags from options so students can't inspect network payload to cheat
	for i := range quiz.Questions {
		for j := range quiz.Questions[i].Options {
			quiz.Questions[i].Options[j].IsCorrect = false
		}
	}

	return quiz, nil
}

func (s *quizService) DeleteQuiz(id, teacherID string) error {
	return s.repo.DeleteQuiz(id, teacherID)
}

func (s *quizService) UpdateQuiz(id string, teacherID string, params map[string]interface{}) error {
	return s.repo.UpdateQuiz(id, teacherID, params)
}
