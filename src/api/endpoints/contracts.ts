import { adminApi } from "../client";
import type {
  CreatorContract,
  CreateContractInput,
  SignContractInput,
  ContractStats,
} from "../types/contracts";

export const contractsApi = {
  // Get all contracts
  getAll: async (): Promise<CreatorContract[]> => {
    const response = await adminApi.get("/contracts");
    return response.data || [];
  },

  // Get contract by ID
  getById: async (id: string): Promise<CreatorContract> => {
    const response = await adminApi.get(`/contracts/${id}`);
    return response.data;
  },

  // Get contracts for a specific creator
  getByCreatorId: async (creatorId: string): Promise<CreatorContract[]> => {
    const response = await adminApi.get("/contracts", {
      params: { creator_id: creatorId },
    });
    return response.data || [];
  },

  // Create a new contract
  create: async (
    data: CreateContractInput
  ): Promise<{ success: boolean; contract: CreatorContract }> => {
    const response = await adminApi.post("/contracts", data);
    return response.data;
  },

  // Upload contract PDF
  uploadPdf: async (
    contractId: string,
    file: File
  ): Promise<{ success: boolean; pdf_url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await adminApi.post(`/contracts/${contractId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Sign a contract (from creator portal)
  sign: async (
    data: SignContractInput
  ): Promise<{ success: boolean; contract: CreatorContract; signed_pdf_url: string }> => {
    const response = await adminApi.post(`/contracts/${data.contract_id}/sign`, {
      signature_data: data.signature_data,
    });
    return response.data;
  },

  // Send contract to creator for signing
  sendForSignature: async (
    contractId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await adminApi.post(`/contracts/${contractId}/send`);
    return response.data;
  },

  // Mark contract as expired
  expire: async (
    contractId: string
  ): Promise<{ success: boolean; contract: CreatorContract }> => {
    const response = await adminApi.post(`/contracts/${contractId}/expire`);
    return response.data;
  },

  // Delete a contract (only drafts)
  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await adminApi.delete(`/contracts/${id}`);
    return response.data;
  },

  // Get contract statistics
  getStats: async (): Promise<ContractStats> => {
    const response = await adminApi.get("/contracts/stats");
    return response.data;
  },
};
