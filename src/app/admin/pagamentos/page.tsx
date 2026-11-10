import type { Metadata } from "next";
import Link from "next/link";
import { AdminPayments } from "@/components/admin-payments";

export const metadata: Metadata = { title: "Pagamentos simulados" };

export default function AdminPaymentsPage() {
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><Link href="/admin" className="text-sm text-forest hover:underline">← Painel</Link><h1 className="mb-2 mt-3 font-display text-4xl font-bold">Pagamentos</h1><p className="mb-7 text-sm text-ink/55">Ações abaixo alteram estados de pagamento e pedido, sem cobrança real.</p><AdminPayments /></section>;
}
