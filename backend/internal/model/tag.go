package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Tag struct {
	ID        string    `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	UserID    string    `gorm:"type:uuid;not null;index" json:"-"`
	Name      string    `gorm:"type:varchar(100);not null" json:"name" validate:"required,max=100"`
	Color     string    `gorm:"type:varchar(100);default:'bg-indigo-100 text-indigo-700'" json:"color" validate:"max=100"`
	Count     int       `gorm:"default:0" json:"count"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (t *Tag) BeforeCreate(tx *gorm.DB) (err error) {
	if t.ID == "" {
		t.ID = uuid.NewString()
	}
	return
}
