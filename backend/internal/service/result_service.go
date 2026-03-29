package service

import (
	"errors"
	"strings"
	"sync"
	"time"

	"backend/internal/model"
	"backend/internal/repository"
)

type ResultService interface {
	SubmitTest(result *model.TestResult) error
	GetQuizResults(teacherID, quizID string) ([]model.TestResult, error)
	GetPendingGradings(teacherID string) ([]PendingGradingResponse, error)
	GradeSubmission(teacherID, compositeID string, score float64) error
	GetClassGradebook(teacherID, classID string) (map[string]interface{}, error)
	GetStudentHistory(studentID string, teacherID string) ([]struct{
		ID string `json:"id"`
		QuizTitle string `json:"quiz_title"`
		Score float64 `json:"score"`
		Status string `json:"status"`
		CreatedAt string `json:"created_at"`
		TimeTakenSeconds int `json:"time_taken_seconds"`
	}, error)
}

type resultService struct {
	repo      repository.ResultRepository
	quizRepo  repository.QuizRepository
	classRepo repository.ClassRepository
	// In-memory locks mapped by quizID_studentIdentifier to prevent TOCTOU race conditions
	locks     sync.Map
}

func NewResultService(repo repository.ResultRepository, quizRepo repository.QuizRepository, classRepo repository.ClassRepository) ResultService {
	return &resultService{
		repo:      repo, 
		quizRepo:  quizRepo, 
		classRepo: classRepo,
	}
}

// getLock retrieves an existing Mutex for the composite key, or allocates a new one thread-safely
func (s *resultService) getLock(key string) *sync.Mutex {
	lock, _ := s.locks.LoadOrStore(key, &sync.Mutex{})
	return lock.(*sync.Mutex)
}

func (s *resultService) SubmitTest(result *model.TestResult) error {
	// First verify quiz exists and get all questions with options
	quiz, err := s.quizRepo.GetPublicQuizByID(result.QuizID)
	if err != nil {
		return err
	}

	// SECURITY: Time Logic validation
	now := time.Now()
	if quiz.OpenTime != nil && now.Before(*quiz.OpenTime) {
		return errors.New("quiz has not started yet")
	}
	if quiz.CloseTime != nil && now.After(*quiz.CloseTime) {
		return errors.New("quiz has already closed")
	}

	// SECURITY: Enforce assigned class access control
	if quiz.AccessType == "assigned" && len(quiz.AssignedClasses) > 0 {
		allowed := false
		if result.StudentIdentifier != "" {
			found, err := s.classRepo.IsStudentInClasses(result.StudentIdentifier, quiz.AssignedClasses)
			if err == nil && found {
				allowed = true
			}
		}
		if !allowed {
			return errors.New("you are not authorized to submit this quiz")
		}
	}

	// SECURITY: Max Attempts Validation & TOCTOU Race Condition Prevention
	if quiz.MaxAttempts > 0 && result.StudentIdentifier != "" {
		// Create a purely deterministic lock key based on who is taking what quiz
		lockKey := result.QuizID + "_" + result.StudentIdentifier
		mu := s.getLock(lockKey)
		
		// Wait forcefully if another identical request is currently grading/saving
		mu.Lock()
		// Ensure the lock remains strictly held until CreateResult is safely committed to the Postgres DB at the bottom of the handler
		defer func() {
			mu.Unlock()
			// PERFORMANCE: Evict lock from memory after 5 minutes to prevent unbounded sync.Map growth
			time.AfterFunc(5*time.Minute, func() {
				s.locks.Delete(lockKey)
			})
		}()

		attempts, err := s.repo.GetAttemptCount(quiz.ID, result.StudentIdentifier)
		if err == nil && attempts >= int64(quiz.MaxAttempts) {
			return errors.New("maximum attempts reached for this student")
		}
	}

	// SECURITY: Time Taken Sanity Check (Allow 5 minutes slack for lag)
	if quiz.TimeLimitMinutes > 0 {
		maxAllowedSeconds := (quiz.TimeLimitMinutes * 60) + 300
		if result.TimeTakenSeconds > maxAllowedSeconds {
			result.Status = "cheating_flagged"
		}
	}

	// Calculate Score securely on the server
	correctOptionMap := make(map[string]bool)
	hasEssay := false

	// Map correctly answered questions to their point values
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
	totalIncorrect := 0
	earnedPoints := 0.0

	// We evaluate answer entries against the Quiz's official structural data
	for _, q := range quiz.Questions {
		if q.Type == "essay" {
			continue // Automated scoring completely ignores Essays
		}

		studentAnswerValue := result.Answers[q.ID]

		// If student provided an answer and it's flagged as correct
		if studentAnswerValue != "" && correctOptionMap[studentAnswerValue] {
			totalCorrect++
			earnedPoints += q.Points
		} else if studentAnswerValue != "" {
			totalIncorrect++
		} else {
			// Unanswered counts as incorrect
			totalIncorrect++
		}
	}

	result.TotalCorrect = totalCorrect
	result.TotalIncorrect = totalIncorrect
	result.Score = earnedPoints

	if result.TabSwitchCount >= 3 {
		result.Status = "cheating_flagged"
	} else if hasEssay {
		result.Status = "pending"
	} else {
		result.Status = "completed"
	}

	// SECURITY & PERFORMANCE: Map Student UUID to enable the Global Analytics Database hook (Preventing Data Vacuum)
	studentUUID := ""
	if quiz.AccessType == "assigned" && len(quiz.AssignedClasses) > 0 {
		uuidStr, err := s.classRepo.GetStudentUUID(result.StudentIdentifier, quiz.AssignedClasses)
		if err == nil {
			studentUUID = uuidStr
		}
	} else if quiz.TeacherID != "" {
		uuidStr, err := s.classRepo.GetStudentUUIDByTeacher(result.StudentIdentifier, quiz.TeacherID)
		if err == nil {
			studentUUID = uuidStr
		}
	}
	if studentUUID != "" {
		result.StudentID = studentUUID
	}

	return s.repo.CreateResult(result)
}

func (s *resultService) GetStudentHistory(studentID string, teacherID string) ([]struct{
	ID string `json:"id"`
	QuizTitle string `json:"quiz_title"`
	Score float64 `json:"score"`
	Status string `json:"status"`
	CreatedAt string `json:"created_at"`
	TimeTakenSeconds int `json:"time_taken_seconds"`
}, error) {
	return s.repo.GetStudentHistory(studentID, teacherID)
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

	// PERFORMANCE: Local quiz cache to prevent N+1 DB calls when multiple results share the same Quiz
	quizCache := make(map[string]*model.Quiz)

	for _, res := range results {
		quiz, cached := quizCache[res.QuizID]
		if !cached {
			var err error
			quiz, err = s.quizRepo.GetPublicQuizByID(res.QuizID)
			if err != nil {
				continue
			}
			quizCache[res.QuizID] = quiz
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
	if score < 0 {
		return errors.New("score cannot be negative")
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

func (s *resultService) GetClassGradebook(teacherID, classID string) (map[string]interface{}, error) {
	// 1. Verify class ownership and get students
	cls, err := s.classRepo.GetClassByID(classID, teacherID)
	if err != nil {
		return nil, errors.New("unauthorized or class not found")
	}

	// 2. Extract student IDs
	var studentIDs []string
	for _, st := range cls.Students {
		studentIDs = append(studentIDs, st.ID)
	}

	// 3. Get results for these students
	results, err := s.repo.GetResultsByStudentIDs(studentIDs)
	if err != nil {
		return nil, err
	}

	// 4. Extract unique QuizIDs
	quizIDMap := make(map[string]bool)
	for _, res := range results {
		quizIDMap[res.QuizID] = true
	}

	// 5. Get Quiz details (PERFORMANCE: Batch query instead of toxic N+1 loops)
	quizIDs := make([]string, 0, len(quizIDMap))
	for qID := range quizIDMap {
		quizIDs = append(quizIDs, qID)
	}

	quizzes, _ := s.quizRepo.GetQuizzesByIDs(quizIDs)
	var quizList []map[string]interface{}
	for _, q := range quizzes {
		quizList = append(quizList, map[string]interface{}{
			"id":    q.ID,
			"title": q.Title,
		})
	}

	return map[string]interface{}{
		"students": cls.Students,
		"quizzes":  quizList,
		"results":  results,
	}, nil
}
