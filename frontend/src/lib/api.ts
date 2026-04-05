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
        throw new Error(errorData.error || `HTTP Error ${response.status}`);
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
