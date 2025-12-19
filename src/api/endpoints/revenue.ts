import { adminApi } from "../client";
import type {
  Revenue,
  CreateRevenueInput,
  BreakEvenAnalysis,
} from "../types/revenue";

export const revenueApi = {
  getAll: async (month?: string): Promise<Revenue[]> => {
    const response = await adminApi.get("/revenue", {
      params: month ? { month } : undefined,
    });
    return response.data;
  },

  create: async (data: CreateRevenueInput): Promise<{ success: boolean; id: string }> => {
    const response = await adminApi.post("/revenue", data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateRevenueInput>
  ): Promise<{ success: boolean }> => {
    const response = await adminApi.put(`/revenue/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await adminApi.delete(`/revenue/${id}`);
    return response.data;
  },

  getBreakEven: async (): Promise<BreakEvenAnalysis> => {
    const response = await adminApi.get("/break-even");
    return response.data;
  },
};
