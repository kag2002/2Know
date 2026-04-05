# Phân Tích Chức Năng: Trợ Lý AI Tích Hợp (Chatbot)

## 1. Mô tả tổng quan
(Dựa trên ảnh 4: Giao diện Trợ lý thông minh "Bé Quýt" BETA)
Giao diện trò chuyện 1-1 với LLM (Large Language Model) ngay bên trong nền tảng thay vì phải ra cửa sổ ChatGPT. Trợ lý này kết nối trực tiếp với bối cảnh dữ liệu (Workspace Context) và Quota Usage tracking cho từng tài khoản.

## 2. Góc nhìn Frontend (FE)
- **UI Components**:
  - Main Chat Container: Giữ toàn bộ lịch sử Conversation. Phân biệt khung User (Bạn) và Assistant (Quýt, màu hồng phấn nhận diện thương hiệu). Rendering Markdown.
  - Sidebar: Thanh hiển thị "Hạn ngạch AI" (Progression Bar max 100%) giúp user dễ theo dõi Subscription.
  - Action / Skill Bar: Box gợi ý kĩ năng phía trên ô nhập liệu (e.g. "Điều phối Workspace", "FAQ..."). 
  - Giao thức Input: Nút ghim "Thêm ảnh" (Multi-modal upload). Nút Gửi. TextBox auto-resize h styple TextArea.
- **State Flow & Streaming**:
  - Frontend gọi Call tới Chat Stream, cần một `EventSource` (SSE) hoặc hook `useChat` custom để hứng từng chữ (Token) từ AI nhả về và gõ (Typewriter effect) liên tục trên màn hình.
  - Global State lưu lịch sử Cuộc trò chuyện theo Thread (Session ID).

## 3. Góc nhìn Backend (BE)
- **API Endpoint Mẫu**: 
  - `POST /api/v1/ai/chat/completions` (Standard LLM Stream)
  - `POST /api/v1/ai/upload_vision` (Handle Image Upload)
- **Luồng Pipeline LLM Core (RAG & Tools)**:
  - Framework: Dùng thư viện Go như `langchaingo` hoặc gọi trực tiếp tới OpenAI Go SDK / Gemini API.
  - Function Calling / Tools: Để AI có thể "Điều phối Workspace", phần code khai báo Prompt System phải nhồi các Schema Functions (như `get_quiz_list`, `search_student_score`) để AI quyết định trigger API nội bộ lấy Context thay cho user.
  - Tracking Hóa đơn AI: Quan trọng nhất! LLM Tokens tốn chi phí lớn. Cần Middleware Interceptor tính toán lại số lượng Inbound/Outbound Tokens sau mỗi lượt Request. Trừ Quota trong `Database.Users_Subscriptions` theo realtime (khi Token đạt 100%, chặn Request bằng status `429 Too Many Requests`).
- **Websocket / Server-Sent Events (SSE)**: Go Fiber (BE) cần thiết lập Response kiểu SSE `Content-Type: text/event-stream` flush các token về Frontend sớm nhất để giảm Latency chờ đợi.
