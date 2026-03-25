package model

import (
	"time"

	"gorm.io/gorm"
)

type Class struct {
	ID          string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	TeacherID   string         `gorm:"type:uuid;not null;index" json:"teacher_id"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Grade       string         `gorm:"type:varchar(50)" json:"grade"`
	Subject     string         `gorm:"type:varchar(100)" json:"subject"`
	Description string         `gorm:"type:text" json:"description"`
	SchoolYear  string         `gorm:"type:varchar(20)" json:"school_year"`
	CreatedAt   time.Time      `autoCreateTime json:"created_at"`
	UpdatedAt   time.Time      `autoUpdateTime json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Students    []Student      `gorm:"foreignKey:ClassID" json:"students,omitempty"`
}

type Student struct {
	ID          string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ClassID     string         `gorm:"type:uuid;not null;index" json:"class_id"`
	FullName    string         `gorm:"type:varchar(255);not null" json:"full_name"`
	StudentID   string         `gorm:"type:varchar(50);not null;index" json:"student_id"` // E.g: SBD, MSSV
	Email       string         `gorm:"type:varchar(255)" json:"email"`
	Phone       string         `gorm:"type:varchar(20)" json:"phone"`
	DateOfBirth *time.Time     `json:"date_of_birth"`
	CreatedAt   time.Time      `autoCreateTime json:"created_at"`
	UpdatedAt   time.Time      `autoUpdateTime json:"updated_at"`
}
