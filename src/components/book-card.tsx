"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Heart, ShoppingBag, Star } from "lucide-react";
import { formatPrice } from "@/lib/money";
import { getSafeImageUrl } from "@/lib/image";

export type BookItem = {
  id: string;
  title: string;
  slug: string;
  cover_url?: string | null;
  description?: string | null;
  authors: string[];
  variant: {
    id: string;
    sku: string;
    format: string;
    price_cents: number;
    compare_at_cents: number | null;
    stock_quantity: number;
  } | null;
  rating: number | null;
};

export function BookCard({ book, onRemoveFavorite }: { book: BookItem; onRemoveFavorite?: () => void }) {
  const router = useRouter();
  const coverUrl = getSafeImageUrl(book.cover_url);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState("");

  async function addToCart() {
    if (!book.variant || book.variant.stock_quantity < 1) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: book.variant.id, quantity: 1 }),
      });
      if (response.status === 401) {
        router.push("/login?next=/carrinho");
        return;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Não foi possível adicionar ao carrinho.");
      setMessage("Adicionado ao carrinho");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível adicionar ao carrinho.");
    } finally {
      setBusy(false);
    }
  }

  async function addFavorite() {
    const response = await fetch("/api/v1/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id: book.id }),
    });
    const body = await response.json();
    if (response.status === 401) {
      router.push("/login?next=/favoritos");
      return;
    }
    if (!response.ok) {
      setFavoriteMessage(body.error?.message ?? "Não foi possível salvar o favorito.");
      return;
    }
    setFavoriteMessage("Salvo nos favoritos.");
  }

  return (
    <article data-testid="book-card" className="group min-w-0">
      <div className="relative">
        <Link href={`/livros/${book.slug}`} className="block">
          <div className="relative flex aspect-[4/5] items-end overflow-hidden rounded-xl p-5 transition-transform duration-300 group-hover:-translate-y-1">
          {coverUrl ? (
            <div
              role="img"
              aria-label={`Capa de ${book.title}`}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `linear-gradient(0deg, rgb(15 31 25 / 88%), transparent 75%), url(${JSON.stringify(coverUrl)})` }}
            />
          ) : (
            <div role="img" aria-label={`Capa ilustrativa de ${book.title}`} className="book-cover absolute inset-0" />
          )}
          <span className="relative z-10 max-w-[90%] font-display text-xl font-bold leading-tight text-white sm:text-2xl">{book.title}</span>
          {book.variant?.compare_at_cents ? (
            <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">Oferta</span>
          ) : null}
          </div>
        </Link>
        <button
          type="button"
          aria-label={onRemoveFavorite ? `Remover ${book.title} dos favoritos` : `Salvar ${book.title} nos favoritos`}
          onClick={() => {
            if (onRemoveFavorite) onRemoveFavorite();
            else addFavorite().catch(() => setFavoriteMessage("Não foi possível salvar o favorito."));
          }}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-forest shadow-sm transition hover:bg-white"
        >
          <Heart size={16} fill={onRemoveFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="pt-4">
        <p className="truncate text-sm text-ink/55">{book.authors.join(", ") || "Autor independente"}</p>
        <Link href={`/livros/${book.slug}`} className="mt-1 block min-h-12 font-semibold leading-6 text-ink hover:text-forest">{book.title}</Link>
        <div className="mt-1 flex min-h-5 items-center gap-1 text-xs text-gold" aria-label={book.rating ? `Avaliação ${book.rating.toFixed(1)} de 5` : "Sem avaliações"}>
          <Star size={14} fill="currentColor" />
          <span className="text-ink/55">{book.rating ? book.rating.toFixed(1) : "Novo"}</span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            {book.variant?.compare_at_cents ? <p className="text-xs text-ink/45 line-through">{formatPrice(book.variant.compare_at_cents)}</p> : null}
            <p className="font-bold text-forest">{book.variant ? formatPrice(book.variant.price_cents) : "Indisponível"}</p>
          </div>
          <button
            type="button"
            data-testid="add-to-cart"
            aria-label={`Adicionar ${book.title} ao carrinho`}
            disabled={!book.variant || book.variant.stock_quantity < 1 || busy}
            onClick={addToCart}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-forest/20 text-forest transition hover:bg-forest hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {message === "Adicionado ao carrinho" ? <Check size={18} /> : <ShoppingBag size={18} />}
          </button>
        </div>
        {message ? <p role="status" className="mt-2 text-xs text-leaf">{message}</p> : null}
        {favoriteMessage ? <p role="status" className="mt-1 text-xs text-leaf">{favoriteMessage}</p> : null}
      </div>
    </article>
  );
}
