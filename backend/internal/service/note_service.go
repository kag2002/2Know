package service

import "backend/internal/model"
import "backend/internal/repository"

type NoteService interface {
	GetNotes(userID string) ([]model.Note, error)
	CreateNote(note *model.Note) error
	UpdateNote(note *model.Note) error
	UpdateNoteContent(id, userID string, params map[string]interface{}) error
	DeleteNote(id, userID string) error
	TogglePin(id, userID string) error
}

type noteService struct {
	repo repository.NoteRepository
}

func NewNoteService(repo repository.NoteRepository) NoteService {
	return &noteService{repo: repo}
}

func (s *noteService) GetNotes(userID string) ([]model.Note, error) {
	return s.repo.GetNotes(userID)
}

func (s *noteService) CreateNote(note *model.Note) error {
	return s.repo.CreateNote(note)
}

func (s *noteService) UpdateNote(note *model.Note) error {
	return s.repo.UpdateNote(note)
}

func (s *noteService) UpdateNoteContent(id, userID string, params map[string]interface{}) error {
	return s.repo.UpdateNoteContent(id, userID, params)
}

func (s *noteService) DeleteNote(id, userID string) error {
	return s.repo.DeleteNote(id, userID)
}

func (s *noteService) TogglePin(id, userID string) error {
	note, err := s.repo.GetNoteByID(id, userID)
	if err != nil {
		return err
	}
	note.Pinned = !note.Pinned
	return s.repo.UpdateNote(note)
}
