import type { Metadata } from "next";
import { BookGrid } from "@/components/book-grid";

export const metadata: Metadata = { title: "Buscar livros" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">Busca</p><h1 className="mb-7 mt-2 font-display text-4xl font-bold">{q ? `Resultados para “${q}”` : "Buscar livros"}</h1><BookGrid key={q} query={q} /></section>;
}
