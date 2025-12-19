import { adminApi } from "../client";
import type {
  CostSummary,
  DailyCost,
  UserCost,
  EventCost,
  ServiceCosts,
  ComprehensiveSummary,
  FixedCost,
  CreateFixedCostInput,
} from "../types/costs";

export const costsApi = {
  getSummary: async (): Promise<CostSummary> => {
    const response = await adminApi.get("/summary");
    return response.data;
  },

  getDaily: async (days: number = 30): Promise<DailyCost[]> => {
    const response = await adminApi.get("/daily", { params: { days } });
    return response.data;
  },

  getUsers: async (limit: number = 50): Promise<UserCost[]> => {
    const response = await adminApi.get("/users", { params: { limit } });
    return response.data;
  },

  getEvents: async (): Promise<EventCost[]> => {
    const response = await adminApi.get("/events");
    return response.data;
  },

  getServiceCosts: async (): Promise<ServiceCosts> => {
    const response = await adminApi.get("/service-costs");
    return response.data;
  },

  getComprehensive: async (): Promise<ComprehensiveSummary> => {
    const response = await adminApi.get("/comprehensive");
    return response.data;
  },
};

export const fixedCostsApi = {
  getAll: async (): Promise<FixedCost[]> => {
    const response = await adminApi.get("/fixed-costs");
    return response.data;
  },

  create: async (data: CreateFixedCostInput): Promise<{ success: boolean; id: string }> => {
    const response = await adminApi.post("/fixed-costs", data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateFixedCostInput>
  ): Promise<{ success: boolean }> => {
    const response = await adminApi.put(`/fixed-costs/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await adminApi.delete(`/fixed-costs/${id}`);
    return response.data;
  },
};
