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
	GetPublicQuizMetadata(id string) (*model.Quiz, int64, error)
	UpdateQuiz(teacherID string, quiz *model.Quiz) error
	DeleteQuiz(id, teacherID string) error
	GetQuizzesByIDs(ids []string) ([]model.Quiz, error)
	GetQuizStats(teacherID string) (*model.QuizStatsDTO, error)
}

type quizRepository struct {
	db *gorm.DB
}

func NewQuizRepository(db *gorm.DB) QuizRepository {
	return &quizRepository{db: db}
}

func (r *quizRepository) CreateQuiz(quiz *model.Quiz) error {
	tx := r.db.Begin()

	// Capture incoming questions to prevent GORM M2M auto-duplication bugs
	incomingQuestions := quiz.Questions
	quiz.Questions = nil // Clear nested association to handle manually

	if err := tx.Create(quiz).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Manually construct M2M and Questions
	for i, q := range incomingQuestions {
		// Enforce global ownership
		q.TeacherID = quiz.TeacherID

		if q.ID == "" || len(q.ID) < 10 || q.ID[:4] == "temp" {
			// Brand new question created by user inline
			q.ID = "" // Ensure clean UUID generation
			if err := tx.Create(&q).Error; err != nil {
				tx.Rollback()
				return err
			}
		} else {
			// Verify it exists AND belongs to the teacher to prevent IDOR
			var count int64
			tx.Model(&model.Question{}).Where("id = ? AND teacher_id = ?", q.ID, quiz.TeacherID).Count(&count)
			if count == 0 {
				continue // Skip unauthorized or deleted questions
			}
		}

		// Manually map to M2M to enforce order_index and default points
		quizQuestion := model.QuizQuestion{
			QuizID:     quiz.ID,
			QuestionID: q.ID,
			OrderIndex: i,
			Points:     q.Points, // the points the teacher designated for this test
		}

		if err := tx.Create(&quizQuestion).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func (r *quizRepository) GetQuizzes(teacherID string) ([]model.Quiz, error) {
	var quizzes []model.Quiz
	err := r.db.Model(&model.Quiz{}).
		Select("quizzes.id, quizzes.title, quizzes.subject, quizzes.grade_level, quizzes.quiz_type, quizzes.status, quizzes.access_type, quizzes.time_limit_minutes, quizzes.created_at, COALESCE(tr.submissions, 0) as submissions, COALESCE(tr.avg_score, 0) as avg_score").
		Joins("LEFT JOIN (SELECT quiz_id, COUNT(id) as submissions, AVG(score) as avg_score FROM test_results WHERE deleted_at IS NULL GROUP BY quiz_id) tr ON tr.quiz_id = quizzes.id").
		Where("quizzes.teacher_id = ?", teacherID).
		Order("quizzes.created_at desc").
		Limit(200).
		Find(&quizzes).Error
	return quizzes, err
}

func (r *quizRepository) GetQuizByID(id, teacherID string) (*model.Quiz, error) {
	var quiz model.Quiz
	err := r.db.Preload("Questions", func(db *gorm.DB) *gorm.DB {
		return db.Order("quiz_questions.order_index ASC")
	}).
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
	err := r.db.Preload("Questions", func(db *gorm.DB) *gorm.DB {
		return db.Order("quiz_questions.order_index ASC")
	}).
		Where("id = ? AND status = 'published'", id).
		First(&quiz).Error
	if err != nil {
		return nil, err
	}
	return &quiz, nil
}

func (r *quizRepository) GetPublicQuizMetadata(id string) (*model.Quiz, int64, error) {
	var quiz model.Quiz
	// PERFORMANCE: Do NOT Preload heavy Question and Option relationships for the Metadata endpoint.
	// This prevents crashing the Go Garbage Collector when a Viral Test gets hit by 10k users simultaneously.
	err := r.db.Where("id = ? AND status = 'published'", id).First(&quiz).Error
	if err != nil {
		return nil, 0, err
	}

	var count int64
	// M2M: Count questions via join table, not a direct quiz_id column on questions
	r.db.Model(&model.QuizQuestion{}).Where("quiz_id = ?", id).Count(&count)

	return &quiz, count, nil
}

func (r *quizRepository) DeleteQuiz(id, teacherID string) error {
	return r.db.Where("id = ? AND teacher_id = ?", id, teacherID).Delete(&model.Quiz{}).Error
}

func (r *quizRepository) UpdateQuiz(teacherID string, quiz *model.Quiz) error {
	tx := r.db.Begin()

	// Capture incoming questions
	incomingQuestions := quiz.Questions
	quiz.Questions = nil // Clear so Updates doesn't get confused

	// Update scalar fields of Quiz
	if err := tx.Model(&model.Quiz{}).Where("id = ? AND teacher_id = ?", quiz.ID, teacherID).Updates(quiz).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Purge existing M2M linkages
	if err := tx.Where("quiz_id = ?", quiz.ID).Delete(&model.QuizQuestion{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Apply new linkages
	for i, q := range incomingQuestions {
		q.TeacherID = teacherID

		if q.ID == "" || len(q.ID) < 10 || q.ID[:4] == "temp" {
			q.ID = ""
			if err := tx.Create(&q).Error; err != nil {
				tx.Rollback()
				return err
			}
		} else {
			var count int64
			tx.Model(&model.Question{}).Where("id = ? AND teacher_id = ?", q.ID, teacherID).Count(&count)
			if count == 0 {
				continue
			}
		}

		quizQuestion := model.QuizQuestion{
			QuizID:     quiz.ID,
			QuestionID: q.ID,
			OrderIndex: i,
			Points:     q.Points,
		}

		if err := tx.Create(&quizQuestion).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func (r *quizRepository) GetQuizzesByIDs(ids []string) ([]model.Quiz, error) {
	var quizzes []model.Quiz
	if len(ids) == 0 {
		return quizzes, nil
	}
	err := r.db.Select("id", "title").Where("id IN ?", ids).Find(&quizzes).Error
	return quizzes, err
}

func (r *quizRepository) GetQuizStats(teacherID string) (*model.QuizStatsDTO, error) {
	var dto model.QuizStatsDTO

	// Count total quizzes
	r.db.Model(&model.Quiz{}).Where("teacher_id = ? AND deleted_at IS NULL", teacherID).Count(&dto.Total)

	// Count active (published) quizzes
	r.db.Model(&model.Quiz{}).Where("teacher_id = ? AND status = 'published' AND deleted_at IS NULL", teacherID).Count(&dto.Active)

	// Count total questions across all quizzes owned by teacher (via M2M join table)
	r.db.Model(&model.QuizQuestion{}).
		Joins("JOIN quizzes ON quizzes.id = quiz_questions.quiz_id AND quizzes.deleted_at IS NULL").
		Where("quizzes.teacher_id = ?", teacherID).
		Count(&dto.TotalQuestions)

	// Count total submissions
	r.db.Model(&model.TestResult{}).
		Joins("JOIN quizzes ON quizzes.id = test_results.quiz_id AND quizzes.deleted_at IS NULL").
		Where("quizzes.teacher_id = ? AND test_results.deleted_at IS NULL", teacherID).
		Count(&dto.TotalSubmissions)

	return &dto, nil
}
