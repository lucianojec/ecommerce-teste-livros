"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/money";

type Order = { id: string; order_number: string; status: string; total_cents: number; created_at: string };

export function OrdersList() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/orders")
      .then(async (response) => {
        const body = await response.json();
        if (response.status === 401) {
          router.push("/login?next=/minha-conta/pedidos");
          return [];
        }
        if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível carregar os pedidos.");
        return body.data as Order[];
      })
      .then((data) => setOrders(data))
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Erro ao carregar pedidos."));
  }, [router]);

  if (message) return <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{message}</p>;
  if (!orders) return <div className="h-48 animate-pulse rounded-xl bg-ink/10" />;
  if (!orders.length) return <div className="rounded-xl bg-white p-8 text-center text-sm text-ink/60">Você ainda não fez pedidos. <Link href="/livros" className="font-semibold text-forest underline">Explorar livros</Link></div>;
  return <div className="divide-y divide-ink/10 rounded-xl bg-white px-5">{orders.map((order) => <Link key={order.id} href={`/minha-conta/pedidos/${order.id}`} className="flex flex-wrap items-center justify-between gap-4 py-5 text-sm hover:text-forest"><span><strong>{order.order_number}</strong><span className="ml-3 text-ink/50">{new Date(order.created_at).toLocaleDateString("pt-BR")}</span></span><span className="flex items-center gap-5"><span>{order.status}</span><strong>{formatPrice(order.total_cents)}</strong></span></Link>)}</div>;
}
