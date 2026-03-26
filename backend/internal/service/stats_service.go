package service

import (
	"sync"
	"time"

	"backend/internal/repository"
)

type StatsService interface {
	GetDashboardOverview(teacherID string) (*repository.DashboardStats, error)
}

type cacheEntry struct {
	data      *repository.DashboardStats
	expiresAt time.Time
}

type statsService struct {
	repo  repository.StatsRepository
	cache map[string]cacheEntry
	mu    sync.RWMutex
}

func NewStatsService(repo repository.StatsRepository) StatsService {
	return &statsService{
		repo:  repo,
		cache: make(map[string]cacheEntry),
	}
}

func (s *statsService) GetDashboardOverview(teacherID string) (*repository.DashboardStats, error) {
	s.mu.RLock()
	entry, exists := s.cache[teacherID]
	s.mu.RUnlock()

	// Cache TTL of 60 seconds
	if exists && time.Now().Before(entry.expiresAt) {
		return entry.data, nil
	}

	stats, err := s.repo.GetDashboardStats(teacherID)
	if err != nil {
		return nil, err
	}

	// Update Cache safely
	s.mu.Lock()
	s.cache[teacherID] = cacheEntry{
		data:      stats,
		expiresAt: time.Now().Add(60 * time.Second),
	}
	s.mu.Unlock()

	return stats, nil
}
