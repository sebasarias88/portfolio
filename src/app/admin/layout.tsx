import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin — Sebastián Arias",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-dvh bg-bg text-fg antialiased">{children}</body>
    </html>
  );
}
