"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/money";

type Profile = { full_name: string; email: string; role: string };
type Order = { id: string; order_number: string; status: string; total_cents: number; created_at: string };

export function AccountView() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/v1/users/me"), fetch("/api/v1/orders")])
      .then(async ([profileResponse, ordersResponse]) => {
        if (profileResponse.status === 401) {
          router.push("/login?next=/minha-conta");
          return;
        }
        const profileBody = await profileResponse.json();
        const ordersBody = await ordersResponse.json();
        if (!profileResponse.ok || !ordersResponse.ok) throw new Error(profileBody.error?.message ?? ordersBody.error?.message ?? "Não foi possível carregar sua conta.");
        setProfile(profileBody.data);
        setOrders(ordersBody.data);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Erro ao carregar conta."));
  }, [router]);

  if (error) return <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{error}</p>;
  if (!profile) return <div className="h-48 animate-pulse rounded-xl bg-ink/10" />;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit rounded-xl bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-[.15em] text-leaf">Minha conta</p>
        <h2 className="mt-2 font-display text-2xl font-bold">{profile.full_name}</h2>
        <p className="mt-1 text-sm text-ink/55">{profile.email}</p>
        <nav className="mt-5 grid gap-2 border-t border-ink/10 pt-4 text-sm">
          <Link href="/minha-conta/pedidos" className="hover:text-forest">Meus pedidos</Link>
          <Link href="/minha-conta/enderecos" className="hover:text-forest">Meus endereços</Link>
          <Link href="/favoritos" className="hover:text-forest">Favoritos</Link>
          {profile.role === "ADMIN" ? <Link href="/admin" className="font-semibold text-leaf">Painel administrativo</Link> : null}
        </nav>
      </aside>
      <section className="rounded-xl bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[.15em] text-leaf">Seu histórico</p><h2 className="mt-1 font-display text-2xl font-bold">Pedidos recentes</h2></div>
          <Link href="/minha-conta/pedidos" className="text-sm font-semibold text-forest hover:underline">Ver todos</Link>
        </div>
        {!orders.length ? <p className="mt-7 rounded-lg bg-cream p-5 text-sm text-ink/60">Você ainda não fez pedidos.</p> : (
          <div className="mt-5 divide-y divide-ink/10">
            {orders.slice(0, 5).map((order) => <Link key={order.id} href={`/minha-conta/pedidos/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm hover:text-forest"><span><strong>{order.order_number}</strong><span className="ml-3 text-ink/50">{new Date(order.created_at).toLocaleDateString("pt-BR")}</span></span><span className="flex items-center gap-4"><span>{order.status}</span><strong>{formatPrice(order.total_cents)}</strong></span></Link>)}
          </div>
        )}
      </section>
    </div>
  );
}
