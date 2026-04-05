package service

import (
	"backend/internal/model"
	"backend/internal/repository"
)

type TagService interface {
	GetTags(userID string) ([]model.Tag, error)
	CreateTag(tag *model.Tag) error
	UpdateTag(tag *model.Tag) error
	DeleteTag(id, userID string) error
}

type tagService struct {
	repo repository.TagRepository
}

func NewTagService(repo repository.TagRepository) TagService {
	return &tagService{repo: repo}
}

func (s *tagService) GetTags(userID string) ([]model.Tag, error) {
	return s.repo.GetTags(userID)
}

func (s *tagService) CreateTag(tag *model.Tag) error {
	return s.repo.CreateTag(tag)
}

func (s *tagService) UpdateTag(tag *model.Tag) error {
	return s.repo.UpdateTag(tag)
}

func (s *tagService) DeleteTag(id, userID string) error {
	return s.repo.DeleteTag(id, userID)
}
