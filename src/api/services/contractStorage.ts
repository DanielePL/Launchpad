import { supabase, isSupabaseConfigured } from "../supabaseClient";

const CONTRACTS_BUCKET = "contracts";

export interface ContractUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a contract PDF to Supabase Storage
 */
export async function uploadContractPdf(
  creatorId: string,
  contractId: string,
  creatorName: string,
  pdfBlob: Blob
): Promise<ContractUploadResult> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn("Supabase not configured - skipping cloud upload");
    return {
      success: false,
      error: "Supabase not configured. Contract was downloaded locally only.",
    };
  }

  try {
    // File path: contracts/{creator_id}/{contract_id}.pdf
    const fileName = `${creatorName.replace(/\s+/g, "_")}_${contractId}.pdf`;
    const filePath = `${creatorId}/${fileName}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(CONTRACTS_BUCKET)
      .upload(filePath, pdfBlob, {
        contentType: "application/pdf",
        upsert: true, // Overwrite if exists
      });

    if (error) {
      // Check if bucket doesn't exist
      if (error.message.includes("not found") || error.message.includes("Bucket")) {
        console.error("Contracts bucket not found. Please create it in Supabase Dashboard.");
        return {
          success: false,
          error: "Storage bucket 'contracts' not found. Please create it in Supabase.",
        };
      }
      console.error("Failed to upload contract:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(CONTRACTS_BUCKET)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("Contract upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get contract download URL for a creator
 */
export async function getContractUrl(
  creatorId: string,
  fileName: string
): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const filePath = `${creatorId}/${fileName}`;

  // Get signed URL (valid for 1 hour)
  const { data, error } = await supabase.storage
    .from(CONTRACTS_BUCKET)
    .createSignedUrl(filePath, 3600);

  if (error) {
    console.error("Failed to get contract URL:", error);
    return null;
  }

  return data.signedUrl;
}

/**
 * List all contracts for a creator
 */
export async function listCreatorContracts(
  creatorId: string
): Promise<{ name: string; created_at: string }[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase.storage
    .from(CONTRACTS_BUCKET)
    .list(creatorId);

  if (error) {
    console.error("Failed to list contracts:", error);
    return [];
  }

  return data.map((file) => ({
    name: file.name,
    created_at: file.created_at,
  }));
}

/**
 * Delete a contract from storage
 */
export async function deleteContract(
  creatorId: string,
  fileName: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false;
  }

  const filePath = `${creatorId}/${fileName}`;

  const { error } = await supabase.storage
    .from(CONTRACTS_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error("Failed to delete contract:", error);
    return false;
  }

  return true;
}
