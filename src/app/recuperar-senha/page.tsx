import type { Metadata } from "next";
import { Suspense } from "react";
import { RecoveryForm } from "@/components/recovery-form";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function RecoverPasswordPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-14 sm:py-20">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">Acesso à conta</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Recuperar senha</h1>
        <p className="mt-2 text-sm text-ink/55">Use o link seguro enviado pelo Supabase para definir uma nova senha.</p>
        <div className="mt-7"><Suspense fallback={<p>Carregando...</p>}><RecoveryForm /></Suspense></div>
      </div>
    </section>
  );
}
