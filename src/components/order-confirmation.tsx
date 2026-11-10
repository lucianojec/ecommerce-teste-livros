"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgeCheck, Clock3 } from "lucide-react";
import { formatPrice } from "@/lib/money";

type Order = {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  payments: { status: string; method: string } | { status: string; method: string }[] | null;
};

export function OrderConfirmation({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/v1/orders/${encodeURIComponent(id)}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível localizar o pedido.");
        return body.data as Order;
      })
      .then(setOrder)
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Erro ao consultar pedido."));
  }, [id]);

  if (message) return <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">{message}</p>;
  if (!order) return <div className="h-52 animate-pulse rounded-2xl bg-ink/10" />;
  const payment = Array.isArray(order.payments) ? order.payments[0] : order.payments;

  return (
    <div className="rounded-2xl bg-white p-7 text-center shadow-sm sm:p-12">
      {order.status === "PAID" ? <BadgeCheck className="mx-auto text-leaf" size={48} /> : <Clock3 className="mx-auto text-gold" size={48} />}
      <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-leaf">Pedido registrado</p>
      <h1 data-testid="order-number" className="mt-2 font-display text-3xl font-bold">{order.order_number}</h1>
      <p className="mt-3 text-sm leading-6 text-ink/60">Seu pagamento está em processamento no simulador. Esta compra não gera cobrança real.</p>
      <div className="mx-auto mt-7 max-w-sm rounded-xl bg-cream p-5 text-left">
        <div className="flex justify-between text-sm"><span>Status do pedido</span><strong data-testid="order-status">{order.status}</strong></div>
        <div className="mt-3 flex justify-between text-sm"><span>Pagamento</span><strong>{payment?.status ?? "PENDENTE"}</strong></div>
        <div className="mt-3 flex justify-between text-sm"><span>Total</span><strong>{formatPrice(order.total_cents)}</strong></div>
      </div>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href={`/minha-conta/pedidos/${order.id}`} className="rounded-full bg-forest px-5 py-3 text-sm font-bold text-white">Acompanhar pedido</Link>
        <Link href="/livros" className="rounded-full border border-forest px-5 py-3 text-sm font-bold text-forest">Continuar comprando</Link>
      </div>
    </div>
  );
}
