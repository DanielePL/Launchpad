// Contract status lifecycle
export type ContractStatus = "draft" | "pending_signature" | "signed" | "expired";

// Creator Contract interface for the unified creator system
export interface CreatorContract {
  id: string;
  creator_id: string;
  creator_name?: string;
  creator_email?: string;

  // PDF storage in Supabase
  pdf_url?: string; // Original contract PDF URL
  signed_pdf_url?: string; // Signed contract PDF URL

  // Signature data
  signature_data?: string; // Base64 encoded signature image
  signed_at?: string;
  signed_by_ip?: string;

  // Status
  status: ContractStatus;

  // Metadata
  template_name?: string;
  version?: string;
  notes?: string;

  // Timestamps
  created_at: string;
  updated_at?: string;
  expires_at?: string;
}

// Input for creating a new contract
export interface CreateContractInput {
  creator_id: string;
  template_name?: string;
  pdf_url?: string;
  notes?: string;
  expires_at?: string;
}

// Input for signing a contract
export interface SignContractInput {
  contract_id: string;
  signature_data: string; // Base64 encoded signature
}

// Contract template for admin use
export interface ContractTemplate {
  id: string;
  name: string;
  description?: string;
  pdf_url: string;
  is_active: boolean;
  created_at: string;
}

// Summary stats for contracts
export interface ContractStats {
  total: number;
  pending_signature: number;
  signed: number;
  expired: number;
}
