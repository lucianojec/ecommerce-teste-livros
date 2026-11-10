import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout-view";

export const metadata: Metadata = { title: "Finalizar compra" };

export default function CheckoutPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">Última etapa</p>
      <h1 className="mb-7 mt-2 font-display text-4xl font-bold">Finalizar pedido</h1>
      <CheckoutView />
    </section>
  );
}
