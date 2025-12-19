import { adminApi } from "../client";
import type { LoginRequest, LoginResponse } from "../types/auth";

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await adminApi.post("/auth/login", data);
    return response.data;
  },

  logout: async (sessionToken: string): Promise<{ success: boolean }> => {
    const response = await adminApi.post("/auth/logout", {
      session_token: sessionToken,
    });
    return response.data;
  },
};
