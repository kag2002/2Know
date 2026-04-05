package model

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Question struct {
	ID          string   `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	TeacherID   string   `gorm:"type:uuid;index" json:"teacher_id"`                               // Global Bank Ownership
	Type        string   `gorm:"type:varchar(50);not null;index" json:"type" validate:"required"` // multiple_choice, essay, match_column, fill_blank
	Points      float64  `gorm:"default:10.0" json:"points" validate:"min=0,max=100"`
	Content     string   `gorm:"type:text;not null" json:"content" validate:"required,max=5000"`
	Explanation string   `gorm:"type:text" json:"explanation"`
	Difficulty  string   `gorm:"type:varchar(20);default:'medium'" json:"difficulty" validate:"omitempty,oneof=easy medium hard"`
	Folder      string   `gorm:"type:varchar(255);index" json:"folder"`
	Tags        []string `gorm:"type:jsonb;serializer:json" json:"tags,omitempty"`

	// Complex data (options, correct pairs, blanks etc)
	Metadata datatypes.JSON `gorm:"type:jsonb" json:"metadata,omitempty"`

	CreatedAt time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type QuizQuestion struct {
	QuizID     string    `gorm:"type:uuid;primaryKey" json:"quiz_id"`
	QuestionID string    `gorm:"type:uuid;primaryKey" json:"question_id"`
	OrderIndex int       `gorm:"default:0" json:"order_index"`
	Points     float64   `gorm:"default:10.0" json:"points"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
}
