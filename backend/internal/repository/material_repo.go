package repository

import (
	"backend/internal/model"

	"gorm.io/gorm"
)

type MaterialRepository interface {
	Create(material *model.Material) error
	GetByClass(classID string) ([]*model.Material, error)
	Delete(id string, classID string) error
}

type materialRepository struct {
	db *gorm.DB
}

func NewMaterialRepository(db *gorm.DB) MaterialRepository {
	return &materialRepository{db: db}
}

func (r *materialRepository) Create(material *model.Material) error {
	return r.db.Create(material).Error
}

func (r *materialRepository) GetByClass(classID string) ([]*model.Material, error) {
	var materials []*model.Material
	err := r.db.Where("class_id = ?", classID).Order("created_at desc").Find(&materials).Error
	return materials, err
}

func (r *materialRepository) Delete(id string, classID string) error {
	return r.db.Where("id = ? AND class_id = ?", id, classID).Delete(&model.Material{}).Error
}
