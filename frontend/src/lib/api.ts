export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

type ApiOptions = RequestInit & {
  requireAuth?: boolean;
};

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  const { requireAuth = true, ...fetchOptions } = options;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Add Auth Token securely
  if (requireAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem("2know_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const maxRetries = fetchOptions.method === 'GET' ? 2 : 0; // Only safe to auto-retry GET requests or if strictly configured
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401 && requireAuth && typeof window !== 'undefined') {
          localStorage.removeItem("2know_token");
          document.cookie = "2know_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
          window.location.href = "/login";
        }
        
        // If it's a 5xx error, throw so it can be caught and retried
        if (response.status >= 500 && attempt < maxRetries) {
          throw new Error(`Server Error ${response.status}`);
        }

        const errorData = await response.json().catch(() => ({}));
        let rawError = errorData.error || `HTTP Error ${response.status}`;
        
        // Auto-translate backend errors gracefully based on stored language context
        if (typeof window !== 'undefined') {
          const lang = localStorage.getItem("2know-lang") || "vi";
          if (lang === "vi") {
             const viMap: Record<string, string> = {
                "Too many requests. Please try again later.": "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
                "Too many auth attempts. Please try again in 1 minute.": "Quá nhiều thao tác xác thực. Vui lòng thử lại sau 1 phút.",
                "AI quota exceeded. Please wait 1 minute before generating again.": "AI đang quá tải thao tác từ bạn. Vui lòng đợi 1 phút.",
                "Too many submissions. Please wait 1 minute before trying again.": "Bạn đã nộp bài quá nhiều lần. Vui lòng đợi 1 phút.",
                "Failed to create material. Please try again later.": "Không thể tạo tài liệu. Vui lòng thử lại sau.",
                "Failed to fetch materials. Please try again later.": "Không thể tải danh sách tài liệu.",
                "Failed to delete material. Please try again later.": "Không thể xoá tài liệu.",
                "System could not process submission. Please try again later.": "Hệ thống không thể xử lý bài nộp. Vui lòng thử lại.",
                "Failed to grade submission. Please try again later.": "Không thể chấm bài. Vui lòng thử lại sau.",
                "Failed to fetch gradebook. Please try again later.": "Không thể tải bảng điểm. Vui lòng thử lại sau.",
                "AI service is currently unavailable. Please try again later.": "Dịch vụ AI đang bận. Vui lòng thử lại sau.",
                "Unauthorized": "Không có quyền truy cập",
                "Invalid email or password": "Email hoặc mật khẩu không chính xác",
                "Email already registered": "Email đã được sử dụng"
             };
             // Simple contains mapping to handle "Validation failed:..." or exact matches
             for (const [enKey, viVal] of Object.entries(viMap)) {
               if (rawError.includes(enKey) || enKey.includes(rawError)) {
                 rawError = viVal;
                 break;
               }
             }
          }
        }
        
        throw new Error(rawError);
      }

      if (response.status === 204) return null;
      return await response.json();
      
    } catch (error: any) {
      lastError = error;
      // Exponential backoff for retries: 500ms, 1000ms
      if (attempt < maxRetries && (error.message.includes('Server Error') || error.message.includes('Failed to fetch'))) {
        await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 500));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
