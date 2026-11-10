import type { Metadata } from "next";
import Link from "next/link";
import { OrdersList } from "@/components/orders-list";

export const metadata: Metadata = { title: "Meus pedidos" };

export default function OrdersPage() {
  return <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><Link href="/minha-conta" className="text-sm text-forest hover:underline">← Minha conta</Link><h1 className="mb-7 mt-3 font-display text-4xl font-bold">Meus pedidos</h1><OrdersList /></section>;
}
