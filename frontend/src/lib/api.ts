export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
    const token = localStorage.getItem("quizlm_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      // Force logout on invalid token
      localStorage.removeItem("quizlm_token");
      window.location.href = "/login";
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP Error ${response.status}`);
  }

  // Handle No Content
  if (response.status === 204) return null;

  return response.json();
}
