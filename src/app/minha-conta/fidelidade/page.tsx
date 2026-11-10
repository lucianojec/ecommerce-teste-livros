import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Programa de fidelidade" };

export default function LoyaltyPage() {
  return <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6"><Link href="/minha-conta" className="text-sm text-forest hover:underline">← Minha conta</Link><h1 className="mt-3 font-display text-4xl font-bold">Fidelidade</h1><p className="mt-4 rounded-xl bg-white p-6 text-sm leading-6 text-ink/65">O programa de fidelidade está planejado, mas ainda não está ativo nesta versão. Nenhum ponto ou benefício é contabilizado.</p></section>;
}
