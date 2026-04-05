package model

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Quiz struct {
	ID          string `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	TeacherID   string `gorm:"type:uuid;not null;index;index:idx_teacher_status,priority:1" json:"teacher_id"`
	Title       string `gorm:"type:varchar(255);not null" json:"title" validate:"required,min=3,max=255"`
	Description string `gorm:"type:text" json:"description" validate:"max=2000"`
	Subject     string `gorm:"type:varchar(100)" json:"subject" validate:"max=100"`
	GradeLevel  string `gorm:"type:varchar(50)" json:"grade_level" validate:"max=50"`

	// Settings
	TimeLimitMinutes int        `json:"time_limit_minutes" validate:"min=0"`
	MaxAttempts      int        `gorm:"default:1" json:"max_attempts" validate:"min=1"`
	OpenTime         *time.Time `json:"open_time"`
	CloseTime        *time.Time `json:"close_time"`
	ShowAnswersAfter bool       `gorm:"default:true" json:"show_answers_after"`
	PenaltyOnWrong   bool       `gorm:"default:false" json:"penalty_on_wrong"`

	// OMR / Format specific
	QuizType    string `gorm:"type:varchar(50);default:'online'" json:"quiz_type" validate:"oneof=online omr"` // online, omr
	OMRTemplate string `gorm:"type:varchar(50)" json:"omr_template"`

	// Security
	RequireFullscreen bool `gorm:"default:false" json:"require_fullscreen"`
	DisableCopyPaste  bool `gorm:"default:false" json:"disable_copy_paste"`

	// Access
	AccessType      string         `gorm:"type:varchar(20);default:'public'" json:"access_type"` // public, assigned
	AssignedClasses pq.StringArray `gorm:"type:text[]" json:"assigned_classes"`

	// PERFORMANCE: Add Index to Status to prevent slow Seq Scans on Dashboard / Published filters
	Status    string         `gorm:"type:varchar(20);default:'draft';index;index:idx_teacher_status,priority:2" json:"status"` // draft, published, archived
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Questions   []Question   `gorm:"many2many:quiz_questions;" json:"questions,omitempty"`
	TestResults []TestResult `gorm:"foreignKey:QuizID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"test_results,omitempty"`

	// Contextual Stats (Not stored directly in DB)
	Submissions int64   `gorm:"-" json:"submissions"`
	AvgScore    float64 `gorm:"-" json:"avg_score"`
}
