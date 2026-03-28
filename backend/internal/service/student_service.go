package service

import (
	"errors"

	"backend/internal/model"
	"backend/internal/repository"
)

type StudentService interface {
	GetStudentsByTeacherID(teacherID string) ([]repository.StudentWithMetrics, error)
	GetStudentByID(id string, teacherID string) (*model.Student, error)
	CreateStudent(teacherID string, student *model.Student) error
	UpdateStudent(id string, teacherID string, student *model.Student) error
	DeleteStudent(id string, teacherID string) error
}

type studentService struct {
	repo      repository.StudentRepository
	classRepo repository.ClassRepository
}

func NewStudentService(repo repository.StudentRepository, classRepo repository.ClassRepository) StudentService {
	return &studentService{repo: repo, classRepo: classRepo}
}

func (s *studentService) GetStudentsByTeacherID(teacherID string) ([]repository.StudentWithMetrics, error) {
	students, err := s.repo.GetStudentsByTeacherID(teacherID)
	if err != nil {
		return nil, err
	}

	// Compute Academic Status Status based on AvgScore
	for i, st := range students {
		var status string
		if st.AvgScore >= 8.0 {
			status = "excellent"
		} else if st.AvgScore >= 6.5 {
			status = "good"
		} else if st.AvgScore >= 5.0 {
			status = "average"
		} else if st.AvgScore >= 4.0 {
			status = "warning"
		} else {
			status = "danger"
		}
		
		// If they haven't taken any tests, mark as "average" or "unknown"
		if st.Tests == 0 {
			status = "average"
		}

		students[i].Status = status
	}

	return students, nil
}

func (s *studentService) GetStudentByID(id string, teacherID string) (*model.Student, error) {
	return s.repo.GetStudentByID(id, teacherID)
}

func (s *studentService) CreateStudent(teacherID string, student *model.Student) error {
	// SECURITY: Verify the teacher owns the class before allowing student insertion
	if student.ClassID != "" {
		if err := s.classRepo.VerifyOwnership(student.ClassID, teacherID); err != nil {
			return errors.New("unauthorized: class does not belong to you")
		}
	}
	return s.repo.CreateStudent(student)
}

func (s *studentService) DeleteStudent(id string, teacherID string) error {
	return s.repo.DeleteStudent(id, teacherID)
}

func (s *studentService) UpdateStudent(id string, teacherID string, student *model.Student) error {
	return s.repo.UpdateStudent(id, teacherID, student)
}
