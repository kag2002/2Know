package service

import (
	"backend/internal/repository"
)

type StatsService interface {
	GetDashboardOverview(teacherID string) (*repository.DashboardStats, error)
}

type statsService struct {
	repo repository.StatsRepository
}

func NewStatsService(repo repository.StatsRepository) StatsService {
	return &statsService{repo: repo}
}

func (s *statsService) GetDashboardOverview(teacherID string) (*repository.DashboardStats, error) {
	// In the future, Redis caching layer checks would go here.
	return s.repo.GetDashboardStats(teacherID)
}
