package service

import (
	"backend/internal/model"
	"backend/internal/repository"
)

type ClassService interface {
	CreateClass(teacherID string, class *model.Class) error
	GetClasses(teacherID string) ([]model.Class, error)
	GetClassByID(id, teacherID string) (*model.Class, error)
	AddStudent(classID, teacherID string, student *model.Student) error
	DeleteClass(id, teacherID string) error
}

type classService struct {
	repo repository.ClassRepository
}

func NewClassService(repo repository.ClassRepository) ClassService {
	return &classService{repo: repo}
}

func (s *classService) CreateClass(teacherID string, class *model.Class) error {
	class.TeacherID = teacherID
	return s.repo.CreateClass(class)
}

func (s *classService) GetClasses(teacherID string) ([]model.Class, error) {
	return s.repo.GetClasses(teacherID)
}

func (s *classService) GetClassByID(id, teacherID string) (*model.Class, error) {
	return s.repo.GetClassByID(id, teacherID)
}

func (s *classService) AddStudent(classID, teacherID string, student *model.Student) error {
	// Verify business logic: teacher must own this class
	if err := s.repo.VerifyOwnership(classID, teacherID); err != nil {
		return err
	}
	student.ClassID = classID
	return s.repo.CreateStudent(student)
}

func (s *classService) DeleteClass(id, teacherID string) error {
	return s.repo.DeleteClass(id, teacherID)
}
