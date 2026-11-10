import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Atendimento" };

export default function SupportPage() {
  return <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6"><Link href="/minha-conta" className="text-sm text-forest hover:underline">← Minha conta</Link><h1 className="mt-3 font-display text-4xl font-bold">Atendimento</h1><p className="mt-4 rounded-xl bg-white p-6 text-sm leading-6 text-ink/65">A abertura e o acompanhamento de chamados ainda não estão disponíveis. Não há atendimento real conectado.</p></section>;
}
