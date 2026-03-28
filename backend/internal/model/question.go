package model

import (
	"time"

	"gorm.io/gorm"
)

type Question struct {
	ID          string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	QuizID      string         `gorm:"type:uuid;not null;index" json:"quiz_id"`
	Type        string         `gorm:"type:varchar(50);not null" json:"type" validate:"required,oneof=multiple_choice true_false essay"` // multiple_choice, true_false, essay
	Points      float64        `gorm:"default:10.0" json:"points" validate:"min=0,max=100"`
	Content     string         `gorm:"type:text;not null" json:"content" validate:"required,max=5000"`
	Explanation string         `gorm:"type:text" json:"explanation"`
	OrderIndex  int            `gorm:"default:0" json:"order_index"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Options []Option `gorm:"foreignKey:QuestionID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"options,omitempty"`
}

type Option struct {
	ID         string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	QuestionID string    `gorm:"type:uuid;not null;index" json:"question_id"`
	Label      string    `gorm:"type:varchar(5)" json:"label" validate:"max=5"` // A, B, C, D
	Content    string    `gorm:"type:text;not null" json:"content" validate:"required,max=2000"`
	IsCorrect  bool      `gorm:"default:false" json:"is_correct"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
}
