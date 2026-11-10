"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Check, ShoppingBag, Star } from "lucide-react";
import { formatPrice } from "@/lib/money";
import { getSafeImageUrl } from "@/lib/image";

type Detail = {
  id: string;
  title: string;
  subtitle: string | null;
  synopsis: string | null;
  description: string | null;
  cover_url: string | null;
  publication_year: number | null;
  publisher: string | null;
  pages: number | null;
  book_authors: { authors: { name: string } | null }[];
  product_variants: {
    id: string;
    sku: string;
    format: string;
    price_cents: number;
    compare_at_cents: number | null;
    stock_quantity: number;
    active: boolean;
  }[];
  reviews: { id: string; rating: number; title: string | null; body: string }[];
};

export function BookDetails({ slug }: { slug: string }) {
  const router = useRouter();
  const [book, setBook] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [variantId, setVariantId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/books/slug/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Livro não encontrado.");
        return body.data as Detail;
      })
      .then((data) => {
        setBook(data);
        const variant = data.product_variants.find((item) => item.active && item.stock_quantity > 0) ?? data.product_variants[0];
        setVariantId(variant?.id ?? "");
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Não foi possível carregar o livro."));
  }, [slug]);

  async function addToCart() {
    if (!variantId) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
      });
      const body = await response.json();
      if (response.status === 401) {
        router.push("/login?next=/carrinho");
        return;
      }
      if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível adicionar ao carrinho.");
      setMessage("Livro adicionado ao carrinho.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Não foi possível adicionar ao carrinho.");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div role="alert" className="rounded-xl bg-red-50 p-6 text-red-800">{error} <Link href="/livros" className="underline">Voltar ao catálogo</Link></div>;
  if (!book) return <div className="grid animate-pulse gap-8 md:grid-cols-2"><div className="aspect-[4/5] rounded-2xl bg-ink/10" /><div className="h-80 rounded-2xl bg-ink/10" /></div>;

  const selected = book.product_variants.find((item) => item.id === variantId);
  const availableVariants = book.product_variants.filter((item) => item.active);
  const coverUrl = getSafeImageUrl(book.cover_url);
  return (
    <div className="grid gap-10 md:grid-cols-[.8fr_1.2fr] md:gap-16">
      <div className="relative flex min-h-[420px] items-end overflow-hidden rounded-2xl p-8 md:min-h-[560px]">
        {coverUrl ? <div role="img" aria-label={`Capa de ${book.title}`} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(0deg, rgb(15 31 25 / 85%), transparent 80%), url(${JSON.stringify(coverUrl)})` }} /> : <div role="img" aria-label={`Capa ilustrativa de ${book.title}`} className="book-cover absolute inset-0" />}
        <div className="relative z-10"><BookOpen className="mb-4 text-gold" /><p className="font-display text-3xl font-bold leading-tight text-white">{book.title}</p></div>
      </div>
      <div className="py-2">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">Livro</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">{book.title}</h1>
        {book.subtitle ? <p className="mt-3 text-lg text-ink/65">{book.subtitle}</p> : null}
        <p className="mt-4 text-sm text-ink/60">por <span className="font-semibold text-ink">{book.book_authors.map((item) => item.authors?.name).filter(Boolean).join(", ") || "Autor independente"}</span></p>
        <div className="mt-3 flex items-center gap-1 text-sm text-gold"><Star fill="currentColor" size={16} /><span className="text-ink/60">{book.reviews.length ? `${(book.reviews.reduce((sum, item) => sum + item.rating, 0) / book.reviews.length).toFixed(1)} · ${book.reviews.length} avaliações` : "Ainda sem avaliações"}</span></div>
        <div className="mt-7 border-y border-ink/10 py-6">
          {selected?.compare_at_cents ? <p className="text-sm text-ink/45 line-through">{formatPrice(selected.compare_at_cents)}</p> : null}
          <p className="font-display text-3xl font-bold text-forest">{selected ? formatPrice(selected.price_cents) : "Indisponível"}</p>
          <p className="mt-1 text-xs text-ink/50">{selected && selected.stock_quantity > 0 ? `Em estoque · ${selected.stock_quantity} disponível(is)` : "Indisponível no momento"}</p>
          <div className="mt-5">
            <label htmlFor="book-variant" className="mb-2 block text-sm font-semibold">Formato</label>
            <select id="book-variant" value={variantId} onChange={(event) => setVariantId(event.target.value)} className="w-full max-w-sm rounded-lg border border-ink/20 bg-white px-3 py-2.5 text-sm">
              {availableVariants.map((variant) => <option key={variant.id} value={variant.id}>{variant.format} · {formatPrice(variant.price_cents)}{variant.stock_quantity < 1 ? " · esgotado" : ""}</option>)}
            </select>
          </div>
          <button
            data-testid="add-to-cart"
            onClick={addToCart}
            disabled={!selected || selected.stock_quantity < 1 || busy}
            className="mt-5 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-bold text-white transition hover:bg-leaf disabled:cursor-not-allowed disabled:opacity-45"
          >
            {message.startsWith("Livro adicionado") ? <Check size={18} /> : <ShoppingBag size={18} />}
            {selected && selected.stock_quantity > 0 ? "Adicionar ao carrinho" : "Indisponível"}
          </button>
          {message ? <p role="status" className="mt-3 text-sm text-leaf">{message}</p> : null}
        </div>
        <div className="mt-7">
          <h2 className="font-display text-2xl font-bold">Sobre este livro</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink/70">{book.synopsis || book.description || "Descrição em breve."}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            {book.publisher ? <div><dt className="text-ink/45">Editora</dt><dd className="mt-1 font-medium">{book.publisher}</dd></div> : null}
            {book.publication_year ? <div><dt className="text-ink/45">Ano</dt><dd className="mt-1 font-medium">{book.publication_year}</dd></div> : null}
            {book.pages ? <div><dt className="text-ink/45">Páginas</dt><dd className="mt-1 font-medium">{book.pages}</dd></div> : null}
          </dl>
        </div>
      </div>
    </div>
  );
}
