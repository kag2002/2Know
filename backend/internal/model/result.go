package model

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type TestResult struct {
	ID               string           `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	QuizID           string           `gorm:"type:uuid;not null;index" json:"quiz_id"`
	StudentID        string           `gorm:"type:uuid;index" json:"student_id"` // Can be nullable if guest
	StudentName      string           `gorm:"type:varchar(255);not null" json:"student_name"`
	StudentIdentifier string          `gorm:"type:varchar(100);not null" json:"student_identifier"` // E.g: SBD
	
	// Scores
	Score            float64          `gorm:"default:0" json:"score"`
	TotalCorrect     int              `gorm:"default:0" json:"total_correct"`
	TotalIncorrect   int              `gorm:"default:0" json:"total_incorrect"`
	TimeTakenSeconds int              `gorm:"default:0" json:"time_taken_seconds"`
	
	// JSON payload mapping Question ID to Option ID selected
	Answers          pq.StringArray   `gorm:"type:text[]" json:"answers"` 
	
	Status           string           `gorm:"type:varchar(50);default:'completed'" json:"status"` // completed, abandoned, cheating_flagged

	CreatedAt        time.Time        `autoCreateTime json:"created_at"`
	UpdatedAt        time.Time        `autoUpdateTime json:"updated_at"`
	DeletedAt        gorm.DeletedAt   `gorm:"index" json:"-"`
}
