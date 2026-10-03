"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionClient } from "@/lib/supabase/server";
import { createHash } from "node:crypto";

export interface LoginState {
  error?: string;
}

const credentials = z.object({
  email: z.email().max(160),
  password: z.string().min(8).max(200),
});

async function loginAllowed() {
  const admin = createAdminClient();
  if (!admin) return true;
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const key = `login:${createHash("sha256").update(`${process.env.ANALYTICS_SALT ?? ""}:${ip}`).digest("hex").slice(0, 32)}`;
  // 5 attempts per IP every 15 minutes
  const { data } = await admin.rpc("check_rate_limit", { p_key: key, p_limit: 5, p_window_seconds: 900 });
  return data === true;
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Credenciales inválidas." };

  if (!(await loginAllowed())) return { error: "Demasiados intentos. Espera unos minutos." };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Credenciales inválidas." };

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

const leadStatus = z.object({
  id: z.uuid(),
  status: z.enum(["new", "contacted", "won", "lost", "spam"]),
});

export async function updateLeadStatus(formData: FormData) {
  const parsed = leadStatus.safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;
  const supabase = await createSessionClient();
  // RLS only lets admins update, and only the status column is granted
  await supabase.from("leads").update({ status: parsed.data.status }).eq("id", parsed.data.id);
}
