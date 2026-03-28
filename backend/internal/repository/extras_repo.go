package repository

import (
	"gorm.io/gorm"

	"backend/internal/model"
)

// --- OmrBatch Repository ---

type OmrBatchRepository interface {
	FindByUserID(userID string) ([]model.OmrBatch, error)
	Create(batch *model.OmrBatch) error
	Update(id, userID string, batch *model.OmrBatch) error
	Delete(id, userID string) error
}

type omrBatchRepository struct{ db *gorm.DB }

func NewOmrBatchRepository(db *gorm.DB) OmrBatchRepository {
	return &omrBatchRepository{db: db}
}

func (r *omrBatchRepository) FindByUserID(userID string) ([]model.OmrBatch, error) {
	var items []model.OmrBatch
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Limit(200).Find(&items).Error
	return items, err
}

func (r *omrBatchRepository) Create(batch *model.OmrBatch) error {
	return r.db.Create(batch).Error
}

func (r *omrBatchRepository) Delete(id, userID string) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&model.OmrBatch{}).Error
}

func (r *omrBatchRepository) Update(id, userID string, batch *model.OmrBatch) error {
	return r.db.Model(&model.OmrBatch{}).Where("id = ? AND user_id = ?", id, userID).Updates(batch).Error
}

// --- Rubric Repository ---

type RubricRepository interface {
	FindByUserID(userID string) ([]model.Rubric, error)
	Create(rubric *model.Rubric) error
	Update(id, userID string, rubric *model.Rubric) error
	Delete(id, userID string) error
}

type rubricRepository struct{ db *gorm.DB }

func NewRubricRepository(db *gorm.DB) RubricRepository {
	return &rubricRepository{db: db}
}

func (r *rubricRepository) FindByUserID(userID string) ([]model.Rubric, error) {
	var items []model.Rubric
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Limit(200).Find(&items).Error
	return items, err
}

func (r *rubricRepository) Create(rubric *model.Rubric) error {
	return r.db.Create(rubric).Error
}

func (r *rubricRepository) Delete(id, userID string) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&model.Rubric{}).Error
}

func (r *rubricRepository) Update(id, userID string, rubric *model.Rubric) error {
	return r.db.Model(&model.Rubric{}).Where("id = ? AND user_id = ?", id, userID).Updates(rubric).Error
}

// --- ShareLink Repository ---

type ShareLinkRepository interface {
	FindByUserID(userID string) ([]model.ShareLink, error)
	Create(link *model.ShareLink) error
	Update(id, userID string, link *model.ShareLink) error
	Delete(id, userID string) error
}

type shareLinkRepository struct{ db *gorm.DB }

func NewShareLinkRepository(db *gorm.DB) ShareLinkRepository {
	return &shareLinkRepository{db: db}
}

func (r *shareLinkRepository) FindByUserID(userID string) ([]model.ShareLink, error) {
	var items []model.ShareLink
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Limit(200).Find(&items).Error
	return items, err
}

func (r *shareLinkRepository) Create(link *model.ShareLink) error {
	return r.db.Create(link).Error
}

func (r *shareLinkRepository) Delete(id, userID string) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&model.ShareLink{}).Error
}

func (r *shareLinkRepository) Update(id, userID string, link *model.ShareLink) error {
	return r.db.Model(&model.ShareLink{}).Where("id = ? AND user_id = ?", id, userID).Updates(link).Error
}
