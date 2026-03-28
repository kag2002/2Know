package service

import (
	"backend/internal/model"
	"backend/internal/repository"
	"errors"
)

type MaterialService interface {
	CreateMaterial(classID, userID string, material *model.Material) error
	GetMaterialsByClass(classID, userID string) ([]*model.Material, error)
	DeleteMaterial(id, classID, userID string) error
}

type materialService struct {
	materialRepo repository.MaterialRepository
	classRepo    repository.ClassRepository
}

func NewMaterialService(mRepo repository.MaterialRepository, cRepo repository.ClassRepository) MaterialService {
	return &materialService{materialRepo: mRepo, classRepo: cRepo}
}

func (s *materialService) CreateMaterial(classID, userID string, material *model.Material) error {
	if err := s.classRepo.VerifyOwnership(classID, userID); err != nil {
		return errors.New("unauthorized")
	}
	material.ClassID = classID
	return s.materialRepo.Create(material)
}

func (s *materialService) GetMaterialsByClass(classID, userID string) ([]*model.Material, error) {
	if err := s.classRepo.VerifyOwnership(classID, userID); err != nil {
		return nil, errors.New("unauthorized")
	}
	return s.materialRepo.GetByClass(classID)
}

func (s *materialService) DeleteMaterial(id, classID, userID string) error {
	if err := s.classRepo.VerifyOwnership(classID, userID); err != nil {
		return errors.New("unauthorized")
	}
	return s.materialRepo.Delete(id, classID)
}
