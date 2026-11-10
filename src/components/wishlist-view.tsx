"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookItem, BookCard } from "@/components/book-card";

export function WishlistView() {
  const router = useRouter();
  const [books, setBooks] = useState<BookItem[] | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/wishlist")
      .then(async (response) => {
        const body = await response.json();
        if (response.status === 401) {
          router.push("/login?next=/favoritos");
          return [];
        }
        if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível carregar favoritos.");
        return (body.data ?? []).map((item: { books: {
          id: string;
          title: string;
          slug: string;
          cover_url: string | null;
          book_authors?: { authors?: { name?: string } | null }[];
          product_variants?: {
            id: string;
            sku: string;
            format: string;
            price_cents: number;
            compare_at_cents: number | null;
            stock_quantity: number;
          }[];
          reviews?: { rating: number }[];
        } }) => {
          const book = item.books;
          const variant = book.product_variants?.find((value) => value.stock_quantity > 0) ?? book.product_variants?.[0];
          const ratings = book.reviews?.map((value) => value.rating) ?? [];
          return {
            id: book.id,
            title: book.title,
            slug: book.slug,
            cover_url: book.cover_url,
            authors: book.book_authors?.map((value) => value.authors?.name).filter((value): value is string => Boolean(value)) ?? [],
            variant: variant ?? null,
            rating: ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : null,
          } satisfies BookItem;
        });
      })
      .then(setBooks)
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Erro ao carregar favoritos."));
  }, [router]);

  if (message) return <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{message}</p>;
  if (!books) return <div className="h-40 animate-pulse rounded-xl bg-ink/10" />;
  if (!books.length) return <div className="rounded-xl bg-white p-8 text-center text-sm text-ink/60">Você ainda não salvou livros. <Link href="/livros" className="font-semibold text-forest underline">Explorar catálogo</Link></div>;
  async function remove(bookId: string) {
    const response = await fetch(`/api/v1/wishlist/${bookId}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json();
      setMessage(body.error?.message ?? "Não foi possível remover o favorito.");
      return;
    }
    setBooks((current) => current?.filter((book) => book.id !== bookId) ?? []);
  }

  return <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">{books.map((book) => <BookCard key={book.id} book={book} onRemoveFavorite={() => remove(book.id).catch(() => setMessage("Não foi possível remover o favorito."))} />)}</div>;
}
