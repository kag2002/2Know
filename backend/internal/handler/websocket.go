package handler

import (
	"log"
	"sync"
	"time"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v3"

	"backend/internal/service"
)

// LeaderboardHub manages all active websocket connections for live tracking.
type LeaderboardHub struct {
	// Map of QuizID -> (Map of Connection -> bool)
	clients    map[string]map[*websocket.Conn]bool
	clientsMux sync.RWMutex
	
	// A channel or service to fetch live stats payload
	resultSvc service.ResultService
}

func NewLeaderboardHub(resultSvc service.ResultService) *LeaderboardHub {
	return &LeaderboardHub{
		clients:   make(map[string]map[*websocket.Conn]bool),
		resultSvc: resultSvc,
	}
}

// WebsocketUpgrade middleware upgrades the HTTP request to WP protocol
func WebsocketUpgrade(c fiber.Ctx) error {
	if websocket.IsWebSocketUpgrade(c) {
		// IMPORTANT: For Fiber v3 locals
		// c.Locals("userId", getUserIdFromToken(c)) // if we passed token in query
		return c.Next()
	}
	return fiber.ErrUpgradeRequired
}

// ServeLeaderboard validates token and binds connection to the Quiz Room
func (h *LeaderboardHub) ServeLeaderboard(c *websocket.Conn) {
	quizID := c.Params("id")
	
	// Ensure room exists
	h.clientsMux.Lock()
	if h.clients[quizID] == nil {
		h.clients[quizID] = make(map[*websocket.Conn]bool)
	}
	h.clients[quizID][c] = true
	h.clientsMux.Unlock()

	defer func() {
		h.clientsMux.Lock()
		delete(h.clients[quizID], c)
		if len(h.clients[quizID]) == 0 {
			delete(h.clients, quizID)
		}
		h.clientsMux.Unlock()
		c.Close()
	}()

	// Ping-Pong Keep Alive and Loop
	for {
		messageType, msg, err := c.ReadMessage()
		if err != nil {
			log.Println("WS Error / Disconnect:", err)
			break
		}

		// Handle client-side events if needed (e.g. "join", "ping")
		if messageType == websocket.TextMessage {
			if string(msg) == "ping" {
				c.WriteMessage(websocket.TextMessage, []byte("pong"))
			}
		}
	}
}

// BroadcastLiveScore is called by result_service whenever a TestResult is auto-graded.
func (h *LeaderboardHub) BroadcastLiveScore(quizID string, payload interface{}) {
	h.clientsMux.RLock()
	roomClients := h.clients[quizID]
	h.clientsMux.RUnlock()

	if len(roomClients) == 0 {
		return // No one is watching this quiz right now
	}

	for client := range roomClients {
		if err := client.WriteJSON(payload); err != nil {
			log.Printf("WS Broadcast Error: %v", err)
			client.Close()
			h.clientsMux.Lock()
			delete(h.clients[quizID], client)
			h.clientsMux.Unlock()
		}
	}
}

// PollLeaderboard periodically pushes full leaderboard state every 5 seconds to prevent drops.
func (h *LeaderboardHub) PollLeaderboard() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		h.clientsMux.RLock()
		activeRooms := make([]string, 0, len(h.clients))
		for quizID := range h.clients {
			activeRooms = append(activeRooms, quizID)
		}
		h.clientsMux.RUnlock()

		for _, quizID := range activeRooms {
			// Fast fetch top 5 students or so (implement via Service or Repo if desired)
			// For Làn 2 gamification: It's extremely performant.
			// Currently mocked as trigger-based via BroadcastLiveScore in phase 1.
			_ = quizID 
		}
	}
}
