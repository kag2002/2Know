package model

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Quiz struct {
	ID                 string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	TeacherID          string         `gorm:"type:uuid;not null;index" json:"teacher_id"`
	Title              string         `gorm:"type:varchar(255);not null" json:"title"`
	Description        string         `gorm:"type:text" json:"description"`
	Subject            string         `gorm:"type:varchar(100)" json:"subject"`
	GradeLevel         string         `gorm:"type:varchar(50)" json:"grade_level"`
	
	// Settings
	TimeLimitMinutes   int            `json:"time_limit_minutes"`
	MaxAttempts        int            `gorm:"default:1" json:"max_attempts"`
	OpenTime           *time.Time     `json:"open_time"`
	CloseTime          *time.Time     `json:"close_time"`
	ShowAnswersAfter   bool           `gorm:"default:true" json:"show_answers_after"`
	PenaltyOnWrong     bool           `gorm:"default:false" json:"penalty_on_wrong"`
	
	// OMR / Format specific
	QuizType           string         `gorm:"type:varchar(50);default:'online'" json:"quiz_type"` // online, omr
	OMRTemplate        string         `gorm:"type:varchar(50)" json:"omr_template"`
	
	// Security
	RequireFullscreen  bool           `gorm:"default:false" json:"require_fullscreen"`
	DisableCopyPaste   bool           `gorm:"default:false" json:"disable_copy_paste"`
	
	// Access
	AccessType         string         `gorm:"type:varchar(20);default:'public'" json:"access_type"` // public, assigned
	AssignedClasses    pq.StringArray `gorm:"type:text[]" json:"assigned_classes"`
	
	Status             string         `gorm:"type:varchar(20);default:'draft'" json:"status"` // draft, published, archived
	CreatedAt          time.Time      `autoCreateTime json:"created_at"`
	UpdatedAt          time.Time      `autoUpdateTime json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Questions          []Question     `gorm:"foreignKey:QuizID" json:"questions,omitempty"`
}
