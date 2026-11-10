"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/money";

type Order = {
  id: string;
  order_number: string;
  status: string;
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  total_cents: number;
  created_at: string;
  order_items: { id: string; book_title: string; variant_sku: string; quantity: number; unit_price_cents: number; line_total_cents: number }[];
  payments: { status: string; method: string; simulated_reference: string } | { status: string; method: string; simulated_reference: string }[];
  order_status_history: { previous_status: string | null; new_status: string; note: string | null; created_at: string }[];
};

export function OrderDetail({ id }: { id: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`/api/v1/orders/${encodeURIComponent(id)}`)
      .then(async (response) => {
        const body = await response.json();
        if (response.status === 401) {
          router.push(`/login?next=/minha-conta/pedidos/${id}`);
          return null;
        }
        if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível consultar o pedido.");
        return body.data as Order;
      })
      .then(setOrder)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Erro ao carregar pedido."));
  }, [id, router]);

  if (error) return <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{error}</p>;
  if (!order) return <div className="h-48 animate-pulse rounded-xl bg-ink/10" />;
  const payments = Array.isArray(order.payments) ? order.payments : order.payments ? [order.payments] : [];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="rounded-xl bg-white p-5 sm:p-7">
        <div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-leaf">Pedido</p><h1 className="mt-1 font-display text-3xl font-bold">{order.order_number}</h1></div><span className="h-fit rounded-full bg-[#edf4ee] px-3 py-1.5 text-xs font-semibold text-forest">{order.status}</span></div>
        <div className="mt-6 divide-y divide-ink/10">{order.order_items.map((item) => <div key={item.id} className="flex justify-between gap-4 py-4 text-sm"><div><p className="font-semibold">{item.book_title}</p><p className="mt-1 text-xs text-ink/50">{item.variant_sku} · {item.quantity} un.</p></div><strong>{formatPrice(item.line_total_cents)}</strong></div>)}</div>
      </section>
      <aside className="h-fit space-y-5">
        <section className="rounded-xl bg-white p-5"><h2 className="font-display text-xl font-bold">Resumo</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal_cents)}</dd></div><div className="flex justify-between"><dt>Frete</dt><dd>{formatPrice(order.shipping_cents)}</dd></div><div className="flex justify-between"><dt>Desconto</dt><dd>− {formatPrice(order.discount_cents)}</dd></div><div className="flex justify-between border-t border-ink/10 pt-3 font-bold"><dt>Total</dt><dd>{formatPrice(order.total_cents)}</dd></div></dl><p className="mt-3 text-xs text-ink/50">Criado em {new Date(order.created_at).toLocaleString("pt-BR")}</p></section>
        <section className="rounded-xl bg-white p-5"><h2 className="font-display text-xl font-bold">Pagamento</h2>{payments.map((payment, index) => <div key={index} className="mt-3 text-sm"><p>{payment.method} · {payment.status}</p><p className="mt-1 text-xs text-ink/50">Referência simulada: {payment.simulated_reference}</p></div>)}</section>
        <section className="rounded-xl bg-white p-5"><h2 className="font-display text-xl font-bold">Histórico</h2><ol className="mt-3 space-y-3">{order.order_status_history.map((event, index) => <li key={`${event.new_status}-${index}`} className="border-l-2 border-gold pl-3 text-sm"><strong>{event.new_status}</strong><p className="text-xs text-ink/50">{new Date(event.created_at).toLocaleString("pt-BR")}</p></li>)}</ol></section>
      </aside>
      <Link href="/minha-conta/pedidos" className="text-sm font-semibold text-forest hover:underline">← Voltar aos pedidos</Link>
    </div>
  );
}
