package service

import (
	"backend/internal/model"
	"backend/internal/repository"
)

type ResultService interface {
	SubmitTest(result *model.TestResult) error
	GetQuizResults(teacherID, quizID string) ([]model.TestResult, error)
}

type resultService struct {
	repo repository.ResultRepository
}

func NewResultService(repo repository.ResultRepository) ResultService {
	return &resultService{repo: repo}
}

func (s *resultService) SubmitTest(result *model.TestResult) error {
	if err := s.repo.VerifyQuizExists(result.QuizID); err != nil {
		return err
	}
	return s.repo.CreateResult(result)
}

func (s *resultService) GetQuizResults(teacherID, quizID string) ([]model.TestResult, error) {
	if err := s.repo.VerifyQuizOwnership(quizID, teacherID); err != nil {
		return nil, err
	}
	return s.repo.GetQuizResults(quizID)
}
