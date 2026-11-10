"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/money";

type Order = {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  created_at: string;
};

const nextStates: Record<string, string[]> = {
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

export function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/v1/admin/orders");
    const body = await response.json();
    if (response.status === 401) {
      router.push("/login?next=/admin/pedidos");
      return;
    }
    if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível carregar pedidos.");
    setOrders(body.data);
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/admin/orders", { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (response.status === 401) {
          router.push("/login?next=/admin/pedidos");
          return [];
        }
        if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível carregar pedidos.");
        return body.data as Order[];
      })
      .then((data) => { if (!controller.signal.aborted) setOrders(data); })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : "Erro ao carregar pedidos.");
      });
    return () => controller.abort();
  }, [router]);

  async function updateStatus(order: Order, status: string) {
    const response = await fetch(`/api/v1/admin/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error?.message ?? "Não foi possível atualizar o pedido.");
      return;
    }
    setMessage(`Pedido ${order.order_number} atualizado para ${status}.`);
    await load();
  }

  return (
    <div>
      {message ? <p role="status" className="mb-4 rounded-lg bg-[#edf4ee] p-3 text-sm text-forest">{message}</p> : null}
      {!orders.length ? <p className="rounded-xl bg-white p-5 text-sm text-ink/60">Nenhum pedido disponível.</p> : (
        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-ink/10 bg-cream text-xs uppercase text-ink/55"><tr><th className="p-4">Pedido</th><th className="p-4">Data</th><th className="p-4">Status</th><th className="p-4">Total</th><th className="p-4">Atualizar</th></tr></thead>
            <tbody className="divide-y divide-ink/10">
              {orders.map((order) => <tr key={order.id}><td className="p-4 font-semibold">{order.order_number}</td><td className="p-4">{new Date(order.created_at).toLocaleDateString("pt-BR")}</td><td className="p-4">{order.status}</td><td className="p-4">{formatPrice(order.total_cents)}</td><td className="p-4"><select aria-label={`Atualizar status de ${order.order_number}`} value="" disabled={!nextStates[order.status]?.length} onChange={(event) => updateStatus(order, event.target.value)} className="rounded-md border border-ink/20 bg-white px-2 py-1.5 text-xs disabled:opacity-45"><option value="">Escolher</option>{(nextStates[order.status] ?? []).map((status) => <option key={status} value={status}>{status}</option>)}</select></td></tr>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
