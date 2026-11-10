import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-14 sm:py-20">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">Que bom ter você de volta</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Entrar na sua conta</h1>
        <p className="mt-2 text-sm text-ink/55">Acesse seus pedidos e continue de onde parou.</p>
        <div className="mt-7"><Suspense fallback={<p>Carregando formulário...</p>}><AuthForm mode="login" /></Suspense></div>
      </div>
    </section>
  );
}
