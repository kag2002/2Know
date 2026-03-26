package service

import (
	"backend/internal/model"
	"backend/internal/repository"
)

type StudentService interface {
	GetStudentsByTeacherID(teacherID string) ([]repository.StudentWithMetrics, error)
	CreateStudent(student *model.Student) error
	DeleteStudent(id string) error
}

type studentService struct {
	repo repository.StudentRepository
}

func NewStudentService(repo repository.StudentRepository) StudentService {
	return &studentService{repo}
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

func (s *studentService) CreateStudent(student *model.Student) error {
	return s.repo.CreateStudent(student)
}

func (s *studentService) DeleteStudent(id string) error {
	return s.repo.DeleteStudent(id)
}
