import { useAuthStore } from "@/store/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

let refreshPromise: Promise<string> | null = null;

async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  
  const authStorage = localStorage.getItem("auth-storage");
  if (!authStorage) return null;
  
  try {
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  
  refreshPromise = (async () => {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) throw new Error("No refresh token");
    
    try {
      const parsed = JSON.parse(authStorage);
      const refreshToken = parsed?.state?.refreshToken;
      
      if (!refreshToken) throw new Error("No refresh token");
      
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401 || errorData.message?.includes('token')) {
          useAuthStore.getState().logout();
        }
        throw new Error(errorData.message || "Failed to refresh token");
      }
      
      const data = await response.json();
      const newToken = data.accessToken;
      
      const store = useAuthStore.getState();
      store.login(store.user!, newToken, refreshToken);
      
      return newToken;
    } catch (error: any) {
      if (error.message === "No refresh token" || error.message?.includes('token')) {
        useAuthStore.getState().logout();
      }
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();
  
  return refreshPromise;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = await getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && token) {
    try {
      token = await refreshAccessToken();
      const newHeaders: HeadersInit = {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: newHeaders,
      });
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { message: errorText || "An error occurred" };
    }
    console.error(`[API Error] ${response.status}:`, error);
    throw new ApiError(response.status, error.message);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: { params?: Record<string, any> }) => {
    let url = endpoint;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (typeof value === "number") {
            searchParams.append(key, value.toString());
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return fetchApi<T>(url);
  },
  post: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: "DELETE" }),
};
