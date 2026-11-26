import "server-only";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || "placeholder-key";
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Trusted server-side client (prefers secret/service-role key, falls back to publishable)
export const supabaseServer: SupabaseClient = createClient(
  supabaseUrl,
  supabaseSecretKey || supabasePublishableKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

// Backward compatibility export
export const supabase = supabaseServer;

export function getTrustedServerClient(): SupabaseClient {
  return supabaseServer;
}
