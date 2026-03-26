package repository

import (
	"gorm.io/gorm"

	"backend/internal/model"
)

type TagRepository interface {
	GetTags(userID string) ([]model.Tag, error)
	CreateTag(tag *model.Tag) error
	DeleteTag(id, userID string) error
}

type tagRepository struct {
	db *gorm.DB
}

func NewTagRepository(db *gorm.DB) TagRepository {
	return &tagRepository{db: db}
}

func (r *tagRepository) GetTags(userID string) ([]model.Tag, error) {
	var tags []model.Tag
	err := r.db.Where("user_id = ?", userID).Order("created_at desc").Find(&tags).Error
	return tags, err
}

func (r *tagRepository) CreateTag(tag *model.Tag) error {
	return r.db.Create(tag).Error
}

func (r *tagRepository) DeleteTag(id, userID string) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&model.Tag{}).Error
}
