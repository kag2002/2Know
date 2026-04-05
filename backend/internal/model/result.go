package model

import (
	"time"

	"gorm.io/gorm"
)

type TestResult struct {
	ID                string `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	QuizID            string `gorm:"type:uuid;not null;index;index:idx_quiz_deleted,priority:1;index:idx_quiz_student,priority:1" json:"quiz_id"`
	StudentID         string `gorm:"type:uuid;index" json:"student_id"` // Can be nullable if guest
	StudentName       string `gorm:"type:varchar(255);not null" json:"student_name" validate:"required,max=255"`
	StudentIdentifier string `gorm:"type:varchar(100);not null;index:idx_quiz_student,priority:2" json:"student_identifier" validate:"required,max=100"` // E.g: SBD

	// Scores
	Score            float64 `gorm:"default:0" json:"score"`
	TotalCorrect     int     `gorm:"default:0" json:"total_correct"`
	TotalIncorrect   int     `gorm:"default:0" json:"total_incorrect"`
	TimeTakenSeconds int     `gorm:"default:0" json:"time_taken_seconds" validate:"min=0"`

	// JSON payload mapping Question ID to their dynamic answer format
	Answers map[string]interface{} `gorm:"type:jsonb;serializer:json" json:"answers" validate:"max=200"`

	// JSON payload mapping Question ID to points awarded by teacher
	GradedAnswers map[string]float64 `gorm:"type:jsonb;serializer:json" json:"graded_answers,omitempty"`

	// JSON payload mapping Question ID to seconds spent viewing
	QuestionTimes map[string]int `gorm:"type:jsonb;serializer:json" json:"question_times,omitempty"`

	// PERFORMANCE: Add Index to Status and CreatedAt to enable hyper-fast B-Tree lookup & sorting for heavy analytics / grading endpoints
	Status         string `gorm:"type:varchar(50);default:'completed';index" json:"status"` // completed, abandoned, cheating_flagged
	TabSwitchCount int    `gorm:"default:0" json:"tab_switch_count"`

	CreatedAt time.Time `gorm:"autoCreateTime;index" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	// PERFORMANCE: Composite Index for LEFT JOIN quiz listing queries
	DeletedAt gorm.DeletedAt `gorm:"index;index:idx_quiz_deleted,priority:2" json:"-"`
}
