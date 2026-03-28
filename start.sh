#!/bin/bash

# Define absolute or relative paths
PROJECT_ROOT=$(pwd)

# Function to handle graceful shutdown (Ctrl+C)
cleanup() {
    echo -e "\n🛑 Đang tắt các máy chủ 2Know..."
    
    # Kill the Go Backend
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Tắt Go Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
    fi
    
    # Kill the Next.js Frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Tắt Next.js Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    echo "✅ Đã tắt hoàn tất. Hẹn gặp lại!"
    exit
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

echo "🚀 BẮT ĐẦU KHỞI CHẠY HỆ THỐNG 2KNOW..."
echo "=========================================="

# 1. Start Docker Database
echo "📦 1. Đang bật Cơ sở dữ liệu (PostgreSQL & Redis)..."
cd "$PROJECT_ROOT/backend/docker"
docker-compose -p 2know up -d
cd "$PROJECT_ROOT"

# Wait a couple of seconds for the DB to be ready
sleep 2

# 2. Start Go Backend
echo "⚙️ 2. Đang bật Máy chủ API Backend (Cổng 8080)..."
cd "$PROJECT_ROOT/backend"
go run ./cmd/server &
BACKEND_PID=$!
cd "$PROJECT_ROOT"

# 3. Start Next.js Frontend
echo "🌐 3. Đang bật Giao diện Website (Cổng 3000)..."
cd "$PROJECT_ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo "=========================================="
echo "✅ HỆ THỐNG ĐÃ SẴN SÀNG!"
echo "👉 Truy cập: http://localhost:3000"
echo "👉 (Nhấn Ctrl + C ở cửa sổ này để Tắt toàn bộ máy chủ)"
echo "=========================================="

# Keep the script running and wait for the frontend process so we can view logs
wait $FRONTEND_PID
