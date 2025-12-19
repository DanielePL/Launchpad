import axios, { type AxiosInstance, type AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/admin`,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  // Request interceptor - add auth token
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      // Support both Bearer token and legacy password param
      config.headers.Authorization = `Bearer ${token}`;
      // Also add as query param for backward compatibility with existing backend
      config.params = {
        ...config.params,
        password: token,
      };
    }
    return config;
  });

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("admin_token");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export const adminApi = createApiClient();
export { API_BASE_URL };
