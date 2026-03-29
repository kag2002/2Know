package repository

import (
	"backend/internal/model"

	"gorm.io/gorm"
)

type StudentRepository interface {
	GetStudentsByTeacherID(teacherID string) ([]StudentWithMetrics, error)
	GetStudentByID(id string, teacherID string) (*model.Student, error)
	CreateStudent(student *model.Student) error
	UpdateStudent(id string, teacherID string, student *model.Student) error
	DeleteStudent(id string, teacherID string) error
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
			COALESCE(tr.avg_score, 0) as avg_score,
			COALESCE(tr.tests, 0) as tests
		`).
		Joins("JOIN classes ON students.class_id = classes.id AND classes.deleted_at IS NULL").
		Joins("LEFT JOIN (SELECT student_id, AVG(score) as avg_score, COUNT(id) as tests FROM test_results GROUP BY student_id) tr ON tr.student_id = students.id").
		Where("classes.teacher_id = ?", teacherID).
		Limit(500).
		Scan(&results).Error

	return results, err
}

func (r *studentRepository) GetStudentByID(id string, teacherID string) (*model.Student, error) {
	var student model.Student
	err := r.db.
		Joins("JOIN classes ON classes.id = students.class_id AND classes.deleted_at IS NULL").
		Where("students.id = ? AND classes.teacher_id = ?", id, teacherID).
		First(&student).Error
	if err != nil {
		return nil, err
	}
	return &student, nil
}

func (r *studentRepository) CreateStudent(student *model.Student) error {
	return r.db.Create(student).Error
}

func (r *studentRepository) DeleteStudent(id string, teacherID string) error {
	return r.db.Where("id = ? AND class_id IN (SELECT id FROM classes WHERE teacher_id = ?)", id, teacherID).
		Delete(&model.Student{}).Error
}

func (r *studentRepository) UpdateStudent(id string, teacherID string, student *model.Student) error {
	return r.db.Model(&model.Student{}).
		Where("id = ? AND class_id IN (SELECT id FROM classes WHERE teacher_id = ?)", id, teacherID).
		Updates(student).Error
}
