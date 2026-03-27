package service

import (
	"errors"
	"strings"

	"backend/internal/model"
	"backend/internal/repository"
)

type ResultService interface {
	SubmitTest(result *model.TestResult) error
	GetQuizResults(teacherID, quizID string) ([]model.TestResult, error)
	GetPendingGradings(teacherID string) ([]PendingGradingResponse, error)
	GradeSubmission(teacherID, compositeID string, score float64) error
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
	hasEssay := false

	for _, q := range quiz.Questions {
		if q.Type == "essay" {
			hasEssay = true
		}
		for _, opt := range q.Options {
			if opt.IsCorrect {
				correctOptionMap[opt.ID] = true
			}
		}
	}

	totalCorrect := 0
	for _, answerValue := range result.Answers {
		// answerValue is either an OptionUUID or raw essay text
		if correctOptionMap[answerValue] {
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
	} else if hasEssay {
		result.Status = "pending"
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

// PendingGradingResponse maps directly to the React UI pendingSubmissions array
type PendingGradingResponse struct {
	ID          string  `json:"id"`
	Student     string  `json:"student"`
	Quiz        string  `json:"quiz"`
	Question    string  `json:"question"`
	Answer      string  `json:"answer"`
	SubmittedAt string  `json:"submittedAt"`
	MaxScore    float64 `json:"maxScore"`
}

func (s *resultService) GetPendingGradings(teacherID string) ([]PendingGradingResponse, error) {
	var responses []PendingGradingResponse
	
	// Fast lookup of all pending results belonging to the teacher's quizzes
	results, err := s.repo.GetPendingResults(teacherID)
	if err != nil {
		return nil, err
	}

	for _, res := range results {
		quiz, err := s.quizRepo.GetPublicQuizByID(res.QuizID)
		if err != nil {
			continue
		}

		for _, q := range quiz.Questions {
			if q.Type == "essay" {
				// Check if the student answered this specific essay question
				if answerText, exists := res.Answers[q.ID]; exists && answerText != "" {
					// Check if it's ALREADY graded
					if _, graded := res.GradedAnswers[q.ID]; !graded {
						responses = append(responses, PendingGradingResponse{
							ID:          res.ID + "_" + q.ID, // Composite ID for the UI
							Student:     res.StudentName,
							Quiz:        quiz.Title,
							Question:    q.Content,
							Answer:      answerText,
							SubmittedAt: res.CreatedAt.Format("02/01/2006 15:04"),
							MaxScore:    q.Points,
						})
					}
				}
			}
		}
	}

	return responses, nil
}

// GradeSubmission processes an individual essay grade
func (s *resultService) GradeSubmission(teacherID, compositeID string, score float64) error {
	parts := strings.Split(compositeID, "_")
	if len(parts) != 2 {
		return errors.New("invalid grading ID")
	}
	resultID := parts[0]
	questionID := parts[1]

	res, err := s.repo.GetResultByID(resultID)
	if err != nil {
		return err
	}

	quiz, err := s.quizRepo.GetPublicQuizByID(res.QuizID)
	if err != nil {
		return err
	}

	if err := s.repo.VerifyQuizOwnership(res.QuizID, teacherID); err != nil {
		return errors.New("unauthorized")
	}

	var essayQ *model.Question
	for _, q := range quiz.Questions {
		if q.ID == questionID && q.Type == "essay" {
			essayQ = &q
			break
		}
	}
	if essayQ == nil {
		return errors.New("question not found or not an essay")
	}

	if score > essayQ.Points {
		return errors.New("score exceeds max points")
	}

	if res.GradedAnswers == nil {
		res.GradedAnswers = make(map[string]float64)
	}

	if oldScore, exists := res.GradedAnswers[questionID]; exists {
		res.Score -= oldScore
	}
	res.GradedAnswers[questionID] = score
	res.Score += score

	// Check if all essays are graded
	essayCount := 0
	for _, q := range quiz.Questions {
		if q.Type == "essay" {
			essayCount++
		}
	}
	if len(res.GradedAnswers) >= essayCount {
		res.Status = "completed"
	}

	return s.repo.UpdateResult(res)
}
