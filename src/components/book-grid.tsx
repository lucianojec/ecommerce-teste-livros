"use client";

import { useEffect, useState } from "react";
import { BookItem, BookCard } from "@/components/book-card";
import { BookOpen } from "lucide-react";

type CatalogResponse = {
  data: BookItem[];
  pagination: { page: number; total_pages: number; total: number };
};

export function BookGrid({ query = "", category = "" }: { query?: string; category?: string }) {
  const [result, setResult] = useState<CatalogResponse | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/v1/books?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&page=${page}&limit=12`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível carregar os livros.");
        return body as CatalogResponse;
      })
      .then(setResult)
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Não foi possível carregar os livros.");
      });
      return () => controller.abort();
  }, [query, category, page]);

  if (error) {
    return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}</div>;
  }
  if (!result) {
    return <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-xl bg-ink/10" />)}</div>;
  }
  if (!result.data.length) {
    return <div className="rounded-2xl bg-white px-6 py-16 text-center"><BookOpen className="mx-auto text-leaf" size={36} /><p className="mt-4 font-display text-xl font-bold">Nenhum livro encontrado</p><p className="mt-2 text-sm text-ink/55">Tente pesquisar por outro título ou assunto.</p></div>;
  }

  return (
    <>
      <p className="mb-5 text-sm text-ink/55">{result.pagination.total} livros encontrados</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
        {result.data.map((book) => <BookCard key={book.id} book={book} />)}
      </div>
      {result.pagination.total_pages > 1 ? (
        <div className="mt-10 flex items-center justify-center gap-5">
          <button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-full border border-ink/20 px-4 py-2 text-sm disabled:opacity-40">Anterior</button>
          <span className="text-sm text-ink/65">Página {page} de {result.pagination.total_pages}</span>
          <button disabled={page === result.pagination.total_pages} onClick={() => setPage((value) => value + 1)} className="rounded-full border border-ink/20 px-4 py-2 text-sm disabled:opacity-40">Próxima</button>
        </div>
      ) : null}
    </>
  );
}
