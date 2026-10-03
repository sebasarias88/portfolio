"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-2 text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-accent"
        />
      </label>
      <label className="grid gap-2 text-sm">
        Contraseña
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          className="rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-accent"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-accent px-6 py-3 font-medium text-accent-fg disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
