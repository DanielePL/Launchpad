import { adminApi } from "../client";
import type { CreateEmployeeInput, EmployeeSummary } from "../types/employees";

export const employeesApi = {
  getAll: async (): Promise<EmployeeSummary> => {
    const response = await adminApi.get("/employees");
    return response.data;
  },

  create: async (data: CreateEmployeeInput): Promise<{ success: boolean; id: string }> => {
    const response = await adminApi.post("/employees", data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateEmployeeInput>
  ): Promise<{ success: boolean }> => {
    const response = await adminApi.put(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await adminApi.delete(`/employees/${id}`);
    return response.data;
  },

  calculateMonth: async (data: {
    month_year: string;
    save_to_history?: boolean;
  }): Promise<EmployeeSummary & { success: boolean }> => {
    const response = await adminApi.post("/employees/calculate-month", data);
    return response.data;
  },
};
