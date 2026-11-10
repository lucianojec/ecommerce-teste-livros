import type { Metadata } from "next";
import { OrderDetail } from "@/components/order-detail";

export const metadata: Metadata = { title: "Detalhes do pedido" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><OrderDetail id={id} /></section>;
}
