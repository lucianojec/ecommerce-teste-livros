import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-14 sm:py-20">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">Faça parte</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Crie sua conta</h1>
        <p className="mt-2 text-sm text-ink/55">Cadastro seguro com Supabase Auth.</p>
        <div className="mt-7"><Suspense fallback={<p>Carregando formulário...</p>}><AuthForm mode="register" /></Suspense></div>
      </div>
    </section>
  );
}
