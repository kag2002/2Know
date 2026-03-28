package repository

import (
	"backend/internal/model"

	"gorm.io/gorm"
)

type StudentRepository interface {
	GetStudentsByTeacherID(teacherID string) ([]StudentWithMetrics, error)
	GetStudentByID(id string) (*model.Student, error)
	CreateStudent(student *model.Student) error
	UpdateStudent(id string, student *model.Student) error
	DeleteStudent(id string) error
}

type studentRepository struct {
	db *gorm.DB
}

func NewStudentRepository(db *gorm.DB) StudentRepository {
	return &studentRepository{db}
}

// StudentWithMetrics represents the aggregated data needed by the frontend Global Student Directory UI
type StudentWithMetrics struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"` // Mapped from FullName
	StudentID string  `json:"studentId"` // Mapped from StudentID
	Email     string  `json:"email"`
	Class     string  `json:"class"` // Mapped from Class Name
	AvgScore  float64 `json:"avgScore"`
	Tests     int     `json:"tests"`
	Status    string  `json:"status"` // Computed in Service
}

func (r *studentRepository) GetStudentsByTeacherID(teacherID string) ([]StudentWithMetrics, error) {
	var results []StudentWithMetrics
	
	// Complex JOIN to retrieve students, their class names, and aggregated test scores
	err := r.db.Table("students").
		Select(`
			students.id as id,
			students.full_name as name,
			students.student_id as student_id,
			students.email as email,
			classes.name as class,
			COALESCE(AVG(test_results.score), 0) as avg_score,
			COUNT(test_results.id) as tests
		`).
		Joins("JOIN classes ON students.class_id = classes.id").
		Joins("LEFT JOIN test_results ON test_results.student_id = students.id").
		Where("classes.teacher_id = ?", teacherID).
		Group("students.id, students.full_name, students.student_id, students.email, classes.name").
		Limit(500).
		Scan(&results).Error

	return results, err
}

func (r *studentRepository) GetStudentByID(id string) (*model.Student, error) {
	var student model.Student
	if err := r.db.First(&student, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &student, nil
}

func (r *studentRepository) CreateStudent(student *model.Student) error {
	return r.db.Create(student).Error
}

func (r *studentRepository) DeleteStudent(id string) error {
	return r.db.Delete(&model.Student{}, "id = ?", id).Error
}

func (r *studentRepository) UpdateStudent(id string, student *model.Student) error {
	return r.db.Model(&model.Student{}).Where("id = ?", id).Updates(student).Error
}
