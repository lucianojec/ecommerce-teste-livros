"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, CircleDollarSign, PackageCheck, Users } from "lucide-react";
import { formatPrice } from "@/lib/money";

type Dashboard = {
  book_count: number;
  customer_count: number;
  order_count: number;
  pending_payment_count: number;
  low_stock_variants: { id: string; sku: string; stock_quantity: number }[];
  total_revenue_cents: number;
  recent_orders: { id: string; status: string; total_cents: number; created_at: string }[];
};

export function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/admin/dashboard")
      .then(async (response) => {
        const body = await response.json();
        if (response.status === 401) {
          router.push("/login?next=/admin");
          return null;
        }
        if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível carregar o painel.");
        return body.data as Dashboard;
      })
      .then(setData)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Erro ao carregar painel."));
  }, [router]);

  if (error) return <div role="alert" className="rounded-xl bg-red-50 p-6 text-red-800">{error}</div>;
  if (!data) return <div className="h-48 animate-pulse rounded-xl bg-ink/10" />;

  const stats = [
    { title: "Livros ativos", value: data.book_count, icon: BookOpen },
    { title: "Clientes", value: data.customer_count, icon: Users },
    { title: "Pedidos", value: data.order_count, icon: PackageCheck },
    { title: "Vendas simuladas", value: formatPrice(data.total_revenue_cents), icon: CircleDollarSign },
  ];
  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, icon: Icon }) => <article key={title} className="rounded-xl bg-white p-5"><Icon className="text-leaf" size={22} /><p className="mt-4 text-sm text-ink/55">{title}</p><p className="mt-1 text-2xl font-bold">{value}</p></article>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-5">
          <h2 className="font-display text-xl font-bold">Pedidos recentes</h2>
          {data.recent_orders.length ? <div className="mt-4 divide-y divide-ink/10">{data.recent_orders.map((order) => <Link key={order.id} href={`/minha-conta/pedidos/${order.id}`} className="flex justify-between py-3 text-sm hover:text-forest"><span>{order.id.slice(0, 8)} · {order.status}</span><strong>{formatPrice(order.total_cents)}</strong></Link>)}</div> : <p className="mt-4 text-sm text-ink/55">Ainda não há pedidos.</p>}
        </section>
        <section className="rounded-xl bg-white p-5">
          <h2 className="font-display text-xl font-bold">Estoque baixo</h2>
          {data.low_stock_variants.length ? <ul className="mt-4 divide-y divide-ink/10">{data.low_stock_variants.map((variant) => <li key={variant.id} className="flex justify-between py-3 text-sm"><span>{variant.sku}</span><strong>{variant.stock_quantity} un.</strong></li>)}</ul> : <p className="mt-4 text-sm text-ink/55">Nenhum item com estoque crítico.</p>}
        </section>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/pedidos" className="rounded-full border border-forest px-5 py-3 text-sm font-semibold text-forest hover:bg-forest hover:text-white">Gerenciar pedidos</Link>
        <Link href="/admin/pagamentos" className="rounded-full border border-forest px-5 py-3 text-sm font-semibold text-forest hover:bg-forest hover:text-white">Simular pagamentos</Link>
      </div>
      <p className="rounded-lg bg-[#edf4ee] p-4 text-sm text-forest">Indicadores são calculados a partir dos dados persistidos. Pagamentos e valores são demonstrativos, sem transações financeiras.</p>
    </div>
  );
}
