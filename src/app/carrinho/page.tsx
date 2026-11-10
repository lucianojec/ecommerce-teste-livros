import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Carrinho" };

export default function CartPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">Sua seleção</p>
      <h1 className="mb-7 mt-2 font-display text-4xl font-bold">Carrinho</h1>
      <CartView />
    </section>
  );
}
