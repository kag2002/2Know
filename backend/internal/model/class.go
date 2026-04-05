package model

import (
	"time"

	"gorm.io/gorm"
)

type Class struct {
	ID          string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	TeacherID   string         `gorm:"type:uuid;not null;index" json:"teacher_id"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name" validate:"required,min=2,max=255"`
	Grade       string         `gorm:"type:varchar(50)" json:"grade" validate:"max=50"`
	Subject     string         `gorm:"type:varchar(100)" json:"subject" validate:"max=100"`
	Description string         `gorm:"type:text" json:"description"`
	SchoolYear  string         `gorm:"type:varchar(20)" json:"school_year"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Students  []Student  `gorm:"foreignKey:ClassID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"students,omitempty"`
	Materials []Material `gorm:"foreignKey:ClassID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"materials,omitempty"`
}

type Student struct {
	ID          string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ClassID     string         `gorm:"type:uuid;not null;index;uniqueIndex:idx_class_student,priority:1" json:"class_id"`
	FullName    string         `gorm:"type:varchar(255);not null" json:"full_name" validate:"required,max=255"`
	StudentID   string         `gorm:"type:varchar(50);not null;index;uniqueIndex:idx_class_student,priority:2" json:"student_id" validate:"required,max=50"` // E.g: SBD, MSSV
	Email       string         `gorm:"type:varchar(255)" json:"email" validate:"omitempty,email"`
	Phone       string         `gorm:"type:varchar(20)" json:"phone" validate:"max=20"`
	DateOfBirth *time.Time     `json:"date_of_birth"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
