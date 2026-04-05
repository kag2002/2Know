package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type OmrBatch struct {
	ID            string         `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	UserID        string         `gorm:"type:uuid;not null;index" json:"-"`
	QuizID        string         `gorm:"type:uuid" json:"quiz_id"` // Link to the Answer Key
	Title         string         `gorm:"type:varchar(255);not null" json:"title" validate:"required,max=255"`
	Template      string         `gorm:"type:varchar(100);default:'Mẫu 50 câu (A4)'" json:"template"`
	SheetsScanned int            `gorm:"default:0" json:"sheets_scanned"`
	TotalSheets   int            `gorm:"default:0" json:"total_sheets"`
	Status        string         `gorm:"type:varchar(20);default:'ready'" json:"status"` // ready, scanning, completed
	Versions      datatypes.JSON `gorm:"type:jsonb" json:"versions,omitempty"`           // Mapping for generated AnswerKeys per Exam Code
	CreatedAt     time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

func (o *OmrBatch) BeforeCreate(tx *gorm.DB) (err error) {
	if o.ID == "" {
		o.ID = uuid.NewString()
	}
	return
}

type Rubric struct {
	ID            string         `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	UserID        string         `gorm:"type:uuid;not null;index" json:"-"`
	Title         string         `gorm:"type:varchar(255);not null" json:"title" validate:"required,max=255"`
	Subject       string         `gorm:"type:varchar(100)" json:"subject"`
	Target        string         `gorm:"type:varchar(100)" json:"target"`
	CriteriaCount int            `gorm:"default:0" json:"criteria_count"`
	UsageCount    int            `gorm:"default:0" json:"usage_count"`
	Active        bool           `gorm:"default:true" json:"active"`
	CreatedAt     time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

func (r *Rubric) BeforeCreate(tx *gorm.DB) (err error) {
	if r.ID == "" {
		r.ID = uuid.NewString()
	}
	return
}

type ShareLink struct {
	ID          string         `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	UserID      string         `gorm:"type:uuid;not null;index" json:"-"`
	QuizID      string         `gorm:"type:uuid;not null;index" json:"quiz_id"`
	Title       string         `gorm:"type:varchar(255)" json:"title" validate:"max=255"`
	ShareCode   string         `gorm:"type:varchar(50);uniqueIndex" json:"share_code"`
	URL         string         `gorm:"type:varchar(500)" json:"url"`
	AccessCount int            `gorm:"default:0" json:"access_count"`
	Status      string         `gorm:"type:varchar(20);default:'active'" json:"status"` // active, expired
	Type        string         `gorm:"type:varchar(20);default:'public'" json:"type"`   // public, class
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (s *ShareLink) BeforeCreate(tx *gorm.DB) (err error) {
	if s.ID == "" {
		s.ID = uuid.NewString()
	}
	return
}
