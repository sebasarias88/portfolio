/**
 * Supabase settings. Read on the server only: the public site never talks to
 * Supabase from the browser, so these do not need the NEXT_PUBLIC_ prefix.
 */
export const supabaseUrl = process.env.SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);
