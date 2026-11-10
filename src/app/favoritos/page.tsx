import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist-view";

export const metadata: Metadata = { title: "Favoritos" };

export default function WishlistPage() {
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">Sua lista pessoal</p><h1 className="mb-7 mt-2 font-display text-4xl font-bold">Favoritos</h1><WishlistView /></section>;
}
