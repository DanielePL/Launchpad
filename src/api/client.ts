import axios, { type AxiosInstance, type AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Debug: Log the API URL being used
console.log("🔥 API_BASE_URL:", API_BASE_URL);

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/admin`,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  // Request interceptor - add admin password
  client.interceptors.request.use((config) => {
    // Auth disabled - always use hardcoded admin password
    const password = "prometheus_admin_2024";
    config.params = {
      ...config.params,
      password: password,
    };
    return config;
  });

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  return client;
}

export const adminApi = createApiClient();
export { API_BASE_URL };
