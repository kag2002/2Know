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
	repo     repository.ResultRepository
	quizRepo repository.QuizRepository
}

func NewResultService(repo repository.ResultRepository, quizRepo repository.QuizRepository) ResultService {
	return &resultService{repo: repo, quizRepo: quizRepo}
}

func (s *resultService) SubmitTest(result *model.TestResult) error {
	// First verify quiz exists and get all questions with options
	quiz, err := s.quizRepo.GetPublicQuizByID(result.QuizID)
	if err != nil {
		return err
	}

	// Calculate Score securely on the server
	correctOptionMap := make(map[string]bool)
	for _, q := range quiz.Questions {
		for _, opt := range q.Options {
			if opt.IsCorrect {
				correctOptionMap[opt.ID] = true
			}
		}
	}

	totalCorrect := 0
	for _, answerID := range result.Answers {
		if correctOptionMap[answerID] {
			totalCorrect++
		}
	}

	totalQuestions := len(quiz.Questions)
	totalIncorrect := totalQuestions - totalCorrect

	score := 0.0
	if totalQuestions > 0 {
		score = (float64(totalCorrect) / float64(totalQuestions)) * 10.0
	}

	result.TotalCorrect = totalCorrect
	result.TotalIncorrect = totalIncorrect
	result.Score = score

	if result.TabSwitchCount >= 3 {
		result.Status = "cheating_flagged"
	} else {
		result.Status = "completed"
	}

	return s.repo.CreateResult(result)
}

func (s *resultService) GetQuizResults(teacherID, quizID string) ([]model.TestResult, error) {
	if err := s.repo.VerifyQuizOwnership(quizID, teacherID); err != nil {
		return nil, err
	}
	return s.repo.GetQuizResults(quizID)
}
