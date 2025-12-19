import { adminApi } from "../client";
import type { AppUser, UserListResponse, UserFilters } from "../types/users";

export const usersApi = {
  getAll: async (filters?: UserFilters): Promise<UserListResponse> => {
    const response = await adminApi.get("/users", { params: filters });
    return response.data;
  },

  getById: async (userId: string): Promise<AppUser> => {
    const response = await adminApi.get(`/users/${userId}`);
    return response.data;
  },

  getCostDetails: async (userId: string): Promise<{
    user_id: string;
    daily_costs: Array<{
      date: string;
      ai_coach_cost: number;
      photo_analysis_cost: number;
      vbt_cost: number;
      storage_cost: number;
      total: number;
    }>;
    total_cost: number;
  }> => {
    const response = await adminApi.get(`/users/${userId}/costs`);
    return response.data;
  },
};
