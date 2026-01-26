import { supabase, isSupabaseConfigured } from "./supabaseClient";
import type {
  Ambassador,
  AmbassadorCreate,
  AmbassadorUpdate,
  AmbassadorFilters,
  AmbassadorStats,
  AmbassadorDeliverable,
  DeliverableCreate,
  DeliverableUpdate,
} from "./types";

// Helper to check if Supabase is available
function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env");
  }
  return supabase;
}

// =====================================================
// Ambassadors API
// =====================================================

export async function getAmbassadors(filters?: AmbassadorFilters): Promise<Ambassador[]> {
  if (!isSupabaseConfigured) return [];

  const client = requireSupabase();
  let query = client
    .from("ambassadors")
    .select("*");

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.sport) {
    query = query.eq("sport", filters.sport);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  const sortBy = filters?.sort_by || "created_at";
  const sortOrder = filters?.sort_order === "asc";
  query = query.order(sortBy, { ascending: sortOrder });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getAmbassadorById(id: string): Promise<Ambassador | null> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("ambassadors")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createAmbassador(ambassador: AmbassadorCreate): Promise<Ambassador> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("ambassadors")
    .insert(ambassador)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAmbassador(id: string, update: AmbassadorUpdate): Promise<Ambassador> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("ambassadors")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAmbassador(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client
    .from("ambassadors")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// =====================================================
// Deliverables API
// =====================================================

export async function getDeliverables(ambassadorId: string): Promise<AmbassadorDeliverable[]> {
  if (!isSupabaseConfigured) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("ambassador_deliverables")
    .select("*")
    .eq("ambassador_id", ambassadorId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createDeliverable(deliverable: DeliverableCreate): Promise<AmbassadorDeliverable> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("ambassador_deliverables")
    .insert(deliverable)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDeliverable(id: string, update: DeliverableUpdate): Promise<AmbassadorDeliverable> {
  const client = requireSupabase();
  const updateData: Record<string, unknown> = { ...update };

  if (update.status === "delivered") {
    updateData.delivered_at = new Date().toISOString();
  }

  const { data, error } = await client
    .from("ambassador_deliverables")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDeliverable(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client
    .from("ambassador_deliverables")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// =====================================================
// Stats
// =====================================================

export async function getAmbassadorStats(): Promise<AmbassadorStats> {
  if (!isSupabaseConfigured) {
    return { total: 0, active: 0, delivered_this_month: 0, pending: 0 };
  }

  const client = requireSupabase();
  const { data, error } = await client.rpc("get_ambassador_stats");

  if (error) {
    // Fallback: manually calculate if RPC doesn't exist
    const ambassadors = await getAmbassadors();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    let deliveredThisMonth = 0;
    let pendingDeliverables = 0;

    // Fetch deliverables for all ambassadors to compute stats
    for (const amb of ambassadors) {
      const deliverables = await getDeliverables(amb.id);
      for (const d of deliverables) {
        if (d.status === "delivered" && d.delivered_at && d.delivered_at >= monthStart) {
          deliveredThisMonth++;
        }
        if (d.status === "assigned" || d.status === "in_progress") {
          pendingDeliverables++;
        }
      }
    }

    return {
      total: ambassadors.length,
      active: ambassadors.filter((a) => a.status === "active").length,
      delivered_this_month: deliveredThisMonth,
      pending: pendingDeliverables,
    };
  }

  // RPC returns a single row
  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  }
  return data || { total: 0, active: 0, delivered_this_month: 0, pending: 0 };
}
