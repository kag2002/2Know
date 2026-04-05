# Kế Hoạch Áp Dụng Phase 4: Nền Tảng Chatbot AI Độc Lập

*Mục tiêu: Cung cấp tính năng trợ lý ảo bên trong Workspace và cơ chế tính Bill Token (Mức độ xung đột: Cực Yếu - Rất An Toàn)*

## Lỗ Hổng Hiện Tại (Đã Fix trong Plan)
Widgets Chat AI ở trạng thái Toàn cầu (Global Layout) vô tình trao "Quyền Trợ Giúp / Tự Giải Đáp" vào tay học sinh đúng lúc các em ấy đang làm Bài Thi Trực Tuyến. Đây là lỗ hổng Cheating tối kị!

## 1. Thiết kế trình tự áp dụng
- **Bước 1 (Base Core Model AI)**: Khai báo Tracker `Ai_Token_Limit`. Khai báo `AiChatSessions` để ghim History đoạn hội thoại AI.
- **Bước 2 (Backend - Stream Handler)**: Xây dựng Endpoint Server-Sent Events (SSE) `/api/v1/ai/chat/stream`. 
- **Bước 3 (Frontend - Layout Scoping Tách Biệt)**: 
  - Khai báo `<AIAssistantSidebar>` **chỉ duy nhất và độc quyền** ở bên trong mảng file của cấu trúc `/app/(dashboard)/layout.tsx` (Tức là giao diện chỉ dành cho việc quản lý của Giáo Viên).
  - Vùng không gian hiển thị bài thi `/app/(exam)/layout.tsx` bị phong tỏa hoàn toàn tuyệt đối.
- **Bước 4 (Thương Mại Hoá)**: Kịch bản tính tiền và ngắt SSE Steam Token Request.

## 2. Quản trị Rủi ro
- Tool này không động gì tới Data thi cử. Rất an toàn. Chỉ cần chú ý bảo vệ API Endpoint AI chống DDoS.
