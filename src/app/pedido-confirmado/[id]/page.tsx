import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/order-confirmation";

export const metadata: Metadata = { title: "Pedido confirmado" };

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6"><OrderConfirmation id={id} /></section>;
}
