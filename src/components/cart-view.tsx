"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/money";

type CartItem = {
  id: string;
  quantity: number;
  product_variants: {
    id: string;
    format: string;
    price_cents: number;
    stock_quantity: number;
    books: { title: string; slug: string; cover_url: string | null } | null;
  } | null;
};

export function CartView() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const total = items?.reduce((sum, item) => sum + item.quantity * (item.product_variants?.price_cents ?? 0), 0) ?? 0;

  const load = useCallback(async () => {
    const response = await fetch("/api/v1/cart");
    if (response.status === 401) {
      router.push("/login?next=/carrinho");
      return;
    }
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível carregar o carrinho.");
    setItems(body.data.cart_items ?? []);
  }, [router]);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/cart")
      .then(async (response) => {
        if (response.status === 401) {
          router.push("/login?next=/carrinho");
          return null;
        }
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível carregar o carrinho.");
        return body.data.cart_items as CartItem[];
      })
      .then((data) => { if (active && data) setItems(data); })
      .catch((error: unknown) => { if (active) setMessage(error instanceof Error ? error.message : "Erro ao carregar carrinho."); });
    return () => { active = false; };
  }, [load, router]);

  async function update(item: CartItem, quantity: number) {
    setBusyId(item.id);
    setMessage("");
    try {
      const response = quantity < 1
        ? await fetch(`/api/v1/cart/items/${item.id}`, { method: "DELETE" })
        : await fetch(`/api/v1/cart/items/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity }),
          });
      const body = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Não foi possível atualizar o carrinho.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao atualizar o carrinho.");
    } finally {
      setBusyId("");
    }
  }

  if (message && items === null) return <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{message}</p>;
  if (items === null) return <div className="h-48 animate-pulse rounded-xl bg-ink/10" />;
  if (!items.length) return (
    <div className="rounded-2xl bg-white px-6 py-16 text-center">
      <ShoppingBag className="mx-auto text-leaf" size={40} />
      <h2 className="mt-4 font-display text-2xl font-bold">Seu carrinho está vazio</h2>
      <p className="mt-2 text-sm text-ink/55">Encontre uma leitura para chamar de sua.</p>
      <Link href="/livros" className="mt-6 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-bold text-white">Explorar livros</Link>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-3">
        {items.map((item) => {
          const variant = item.product_variants;
          const book = variant?.books;
          return (
            <article key={item.id} data-testid="cart-item" className="flex gap-4 rounded-xl bg-white p-4 sm:p-5">
              <div role="img" aria-label={`Capa de ${book?.title ?? "livro"}`} className="book-cover flex h-28 w-20 shrink-0 items-end rounded-md p-2 text-xs font-bold text-white">
                {book?.title.slice(0, 25)}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/livros/${book?.slug}`} className="font-semibold hover:text-forest">{book?.title ?? "Livro"}</Link>
                <p className="mt-1 text-xs text-ink/55">{variant?.format}</p>
                <p className="mt-3 font-bold text-forest">{formatPrice(variant?.price_cents ?? 0)}</p>
                <div className="mt-3 flex items-center gap-3">
                  <button disabled={busyId === item.id} onClick={() => update(item, item.quantity - 1)} aria-label="Diminuir quantidade" className="rounded-full border border-ink/20 p-1.5 disabled:opacity-40"><Minus size={14} /></button>
                  <span data-testid="cart-quantity" className="min-w-4 text-center text-sm">{item.quantity}</span>
                  <button disabled={busyId === item.id || item.quantity >= (variant?.stock_quantity ?? 1)} onClick={() => update(item, item.quantity + 1)} aria-label="Aumentar quantidade" className="rounded-full border border-ink/20 p-1.5 disabled:opacity-40"><Plus size={14} /></button>
                  <button data-testid="cart-remove" onClick={() => update(item, 0)} aria-label={`Remover ${book?.title ?? "livro"}`} className="ml-auto flex items-center gap-1 text-xs text-red-700 hover:text-red-900"><Trash2 size={15} /> Remover</button>
                </div>
              </div>
            </article>
          );
        })}
        {message ? <p role="alert" className="text-sm text-red-700">{message}</p> : null}
      </div>
      <aside className="h-fit rounded-xl bg-white p-5">
        <h2 className="font-display text-xl font-bold">Resumo do pedido</h2>
        <div className="mt-5 flex justify-between text-sm"><span>Subtotal</span><strong>{formatPrice(total)}</strong></div>
        <p className="mt-2 text-xs text-ink/50">Frete e descontos calculados na próxima etapa.</p>
        <div className="my-5 border-t border-ink/10" />
        <div className="flex justify-between"><span className="font-semibold">Total parcial</span><strong className="text-forest">{formatPrice(total)}</strong></div>
        <Link data-testid="checkout-button" href="/checkout" className="mt-5 flex w-full justify-center rounded-full bg-forest px-5 py-3.5 text-sm font-bold text-white hover:bg-leaf">Continuar para entrega</Link>
      </aside>
    </div>
  );
}
