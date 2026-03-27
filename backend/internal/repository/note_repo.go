package repository

import (
	"gorm.io/gorm"

	"backend/internal/model"
)

type NoteRepository interface {
	GetNotes(userID string) ([]model.Note, error)
	CreateNote(note *model.Note) error
	UpdateNote(note *model.Note) error
	UpdateNoteContent(id, userID string, params map[string]interface{}) error
	DeleteNote(id, userID string) error
	GetNoteByID(id, userID string) (*model.Note, error)
}

type noteRepository struct {
	db *gorm.DB
}

func NewNoteRepository(db *gorm.DB) NoteRepository {
	return &noteRepository{db: db}
}

func (r *noteRepository) GetNotes(userID string) ([]model.Note, error) {
	var notes []model.Note
	err := r.db.Where("user_id = ?", userID).Order("pinned desc, created_at desc").Find(&notes).Error
	return notes, err
}

func (r *noteRepository) CreateNote(note *model.Note) error {
	return r.db.Create(note).Error
}

func (r *noteRepository) UpdateNote(note *model.Note) error {
	return r.db.Save(note).Error
}

func (r *noteRepository) UpdateNoteContent(id, userID string, params map[string]interface{}) error {
	return r.db.Model(&model.Note{}).Where("id = ? AND user_id = ?", id, userID).Updates(params).Error
}

func (r *noteRepository) DeleteNote(id, userID string) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&model.Note{}).Error
}

func (r *noteRepository) GetNoteByID(id, userID string) (*model.Note, error) {
	var note model.Note
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&note).Error
	return &note, err
}
