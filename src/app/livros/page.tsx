import type { Metadata } from "next";
import { BookGrid } from "@/components/book-grid";

export const metadata: Metadata = { title: "Todos os livros" };

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">Explore a coleção</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Todos os livros</h1>
      {q ? <p className="mt-2 text-sm text-ink/60">Resultados para “{q}”</p> : <p className="mt-2 text-sm text-ink/60">Ideias, histórias e descobertas para sua próxima leitura.</p>}
      <div className="mt-8"><BookGrid key={q} query={q} /></div>
    </section>
  );
}
