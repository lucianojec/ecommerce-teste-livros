import type { Metadata } from "next";
import Link from "next/link";
import { AdminOrders } from "@/components/admin-orders";

export const metadata: Metadata = { title: "Pedidos administrativos" };

export default function AdminOrdersPage() {
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><Link href="/admin" className="text-sm text-forest hover:underline">← Painel</Link><h1 className="mb-7 mt-3 font-display text-4xl font-bold">Gestão de pedidos</h1><AdminOrders /></section>;
}
