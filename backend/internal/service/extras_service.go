package service

import (
	"backend/internal/model"
	"backend/internal/repository"
)

// --- OmrBatch Service ---

type OmrBatchService interface {
	GetBatches(userID string) ([]model.OmrBatch, error)
	CreateBatch(batch *model.OmrBatch) error
	UpdateBatch(id, userID string, batch *model.OmrBatch) error
	DeleteBatch(id, userID string) error
}

type omrBatchService struct{ repo repository.OmrBatchRepository }

func NewOmrBatchService(repo repository.OmrBatchRepository) OmrBatchService {
	return &omrBatchService{repo: repo}
}

func (s *omrBatchService) GetBatches(userID string) ([]model.OmrBatch, error) {
	return s.repo.FindByUserID(userID)
}
func (s *omrBatchService) CreateBatch(batch *model.OmrBatch) error {
	return s.repo.Create(batch)
}
func (s *omrBatchService) UpdateBatch(id, userID string, batch *model.OmrBatch) error {
	return s.repo.Update(id, userID, batch)
}
func (s *omrBatchService) DeleteBatch(id, userID string) error {
	return s.repo.Delete(id, userID)
}

// --- Rubric Service ---

type RubricService interface {
	GetRubrics(userID string) ([]model.Rubric, error)
	CreateRubric(rubric *model.Rubric) error
	UpdateRubric(id, userID string, rubric *model.Rubric) error
	DeleteRubric(id, userID string) error
}

type rubricService struct{ repo repository.RubricRepository }

func NewRubricService(repo repository.RubricRepository) RubricService {
	return &rubricService{repo: repo}
}

func (s *rubricService) GetRubrics(userID string) ([]model.Rubric, error) {
	return s.repo.FindByUserID(userID)
}
func (s *rubricService) CreateRubric(rubric *model.Rubric) error {
	return s.repo.Create(rubric)
}
func (s *rubricService) UpdateRubric(id, userID string, rubric *model.Rubric) error {
	return s.repo.Update(id, userID, rubric)
}
func (s *rubricService) DeleteRubric(id, userID string) error {
	return s.repo.Delete(id, userID)
}

// --- ShareLink Service ---

type ShareLinkService interface {
	GetLinks(userID string) ([]model.ShareLink, error)
	CreateLink(link *model.ShareLink) error
	UpdateLink(id, userID string, link *model.ShareLink) error
	DeleteLink(id, userID string) error
}

type shareLinkService struct {
	repo repository.ShareLinkRepository
}

func NewShareLinkService(repo repository.ShareLinkRepository) ShareLinkService {
	return &shareLinkService{repo: repo}
}

func (s *shareLinkService) GetLinks(userID string) ([]model.ShareLink, error) {
	return s.repo.FindByUserID(userID)
}
func (s *shareLinkService) CreateLink(link *model.ShareLink) error {
	return s.repo.Create(link)
}
func (s *shareLinkService) UpdateLink(id, userID string, link *model.ShareLink) error {
	return s.repo.Update(id, userID, link)
}
func (s *shareLinkService) DeleteLink(id, userID string) error {
	return s.repo.Delete(id, userID)
}
