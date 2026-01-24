import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isConfigured) {
  console.warn("⚠️ Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env");
}

// Create client only if configured, otherwise create a dummy that will fail gracefully
export const supabase: SupabaseClient | null = isConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  : null;

export { isConfigured as isSupabaseConfigured };
