/**
 * Generated from the Supabase schema (project: sebastian-arias-portfolio).
 * Regenerate after schema changes: `npx supabase gen types typescript --project-id pklpmenxykyzpwcnbxmm`
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      events: {
        Row: {
          browser: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          device: string | null;
          id: number;
          locale: string | null;
          meta: Json | null;
          os: string | null;
          path: string;
          ref: string | null;
          referrer_host: string | null;
          type: string;
          visitor_hash: string;
        };
        Insert: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          device?: string | null;
          id?: never;
          locale?: string | null;
          meta?: Json | null;
          os?: string | null;
          path: string;
          ref?: string | null;
          referrer_host?: string | null;
          type: string;
          visitor_hash: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
      leads: {
        Row: {
          contact: string | null;
          created_at: string;
          details: Json | null;
          id: string;
          locale: string | null;
          message: string | null;
          name: string | null;
          source: string;
          status: string;
          visitor_hash: string | null;
        };
        Insert: {
          contact?: string | null;
          created_at?: string;
          details?: Json | null;
          id?: string;
          locale?: string | null;
          message?: string | null;
          name?: string | null;
          source: string;
          status?: string;
          visitor_hash?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      admin_analytics: { Args: { p_days?: number }; Returns: Json };
      check_rate_limit: { Args: { p_key: string; p_limit: number; p_window_seconds: number }; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
