package repository

import (
	"gorm.io/gorm"

	"backend/internal/model"
)

type ClassRepository interface {
	CreateClass(class *model.Class) error
	GetClasses(teacherID string) ([]model.Class, error)
	GetClassByID(id, teacherID string) (*model.Class, error)
	VerifyOwnership(id, teacherID string) error
	UpdateClass(class *model.Class, teacherID string) error
	CreateStudent(student *model.Student) error
	DeleteClass(id, teacherID string) error
	IsStudentInClasses(studentIdentifier string, classIDs []string) (bool, error)
	GetStudentUUID(studentIdentifier string, classIDs []string) (string, error)
	GetStudentUUIDByTeacher(studentIdentifier string, teacherID string) (string, error)
}

type classRepository struct {
	db *gorm.DB
}

func NewClassRepository(db *gorm.DB) ClassRepository {
	return &classRepository{db: db}
}

func (r *classRepository) CreateClass(class *model.Class) error {
	return r.db.Create(class).Error
}

func (r *classRepository) GetClasses(teacherID string) ([]model.Class, error) {
	var classes []model.Class
	err := r.db.Preload("Students").
		Where("teacher_id = ?", teacherID).
		Order("created_at desc").
		Limit(200).
		Find(&classes).Error
	return classes, err
}

func (r *classRepository) GetClassByID(id, teacherID string) (*model.Class, error) {
	var class model.Class
	err := r.db.Preload("Students").
		Where("id = ? AND teacher_id = ?", id, teacherID).
		First(&class).Error
	if err != nil {
		return nil, err
	}
	return &class, nil
}

func (r *classRepository) VerifyOwnership(id, teacherID string) error {
	var class model.Class
	return r.db.Where("id = ? AND teacher_id = ?", id, teacherID).First(&class).Error
}

func (r *classRepository) CreateStudent(student *model.Student) error {
	return r.db.Create(student).Error
}

func (r *classRepository) DeleteClass(id, teacherID string) error {
	return r.db.Where("id = ? AND teacher_id = ?", id, teacherID).Delete(&model.Class{}).Error
}

func (r *classRepository) UpdateClass(class *model.Class, teacherID string) error {
	return r.db.Where("id = ? AND teacher_id = ?", class.ID, teacherID).Updates(class).Error
}

// IsStudentInClasses checks if a student_id (SBD/MSSV) belongs to any of the given classes
func (r *classRepository) IsStudentInClasses(studentIdentifier string, classIDs []string) (bool, error) {
	var count int64
	err := r.db.Model(&model.Student{}).
		Where("student_id = ? AND class_id IN ?", studentIdentifier, classIDs).
		Count(&count).Error
	return count > 0, err
}

func (r *classRepository) GetStudentUUID(studentIdentifier string, classIDs []string) (string, error) {
	var student model.Student
	err := r.db.Where("student_id = ? AND class_id IN ?", studentIdentifier, classIDs).First(&student).Error
	if err != nil {
		return "", err
	}
	return student.ID, nil
}

func (r *classRepository) GetStudentUUIDByTeacher(studentIdentifier string, teacherID string) (string, error) {
	var student model.Student
	err := r.db.Joins("JOIN classes ON classes.id = students.class_id AND classes.deleted_at IS NULL").
		Where("students.student_id = ? AND classes.teacher_id = ?", studentIdentifier, teacherID).
		First(&student).Error
	if err != nil {
		return "", err
	}
	return student.ID, nil
}
