import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabaseUrl } from "./env";

/**
 * Privileged client (bypasses RLS). Server-only: never import from client code.
 * Used exclusively by API route handlers after validation + rate limiting.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) return null;
  return createClient<Database>(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
