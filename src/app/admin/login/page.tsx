import { Monogram } from "@/components/ui/Monogram";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-bg-elevated p-8">
        <Monogram className="mb-6 size-10" />
        <h1 className="mb-6 font-display text-2xl font-semibold">Panel privado</h1>
        <LoginForm />
      </div>
    </main>
  );
}
