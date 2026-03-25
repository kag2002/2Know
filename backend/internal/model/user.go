package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID            uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Email         string    `gorm:"type:varchar(255);uniqueIndex;not null"`
	PasswordHash  string    `gorm:"type:varchar(255);not null"`
	FullName      string    `gorm:"type:varchar(255);not null"`
	AvatarURL     *string   `gorm:"type:varchar(500)"`
	Role          string    `gorm:"type:varchar(20);default:'teacher'"`
	PlanTier      string    `gorm:"type:varchar(20);default:'free'"`
	Preferences   *string   `gorm:"type:jsonb;default:'{}'"`
	IsActive      bool      `gorm:"default:true"`
	EmailVerified bool      `gorm:"default:false"`
	LastLoginAt   *time.Time
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     gorm.DeletedAt `gorm:"index"`
}
