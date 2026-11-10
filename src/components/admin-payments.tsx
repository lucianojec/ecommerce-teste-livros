"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/money";

type Payment = {
  id: string;
  method: string;
  status: string;
  amount_cents: number;
  created_at: string;
  orders: { order_number: string } | null;
};

export function AdminPayments() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/v1/admin/payments");
    const body = await response.json();
    if (response.status === 401) {
      router.push("/login?next=/admin/pagamentos");
      return;
    }
    if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível carregar pagamentos.");
    setPayments(body.data);
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/admin/payments", { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (response.status === 401) {
          router.push("/login?next=/admin/pagamentos");
          return [];
        }
        if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível carregar pagamentos.");
        return body.data as Payment[];
      })
      .then((data) => { if (!controller.signal.aborted) setPayments(data); })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : "Erro ao carregar pagamentos.");
      });
    return () => controller.abort();
  }, [router]);

  async function simulate(payment: Payment, result: "APPROVED" | "DECLINED" | "EXPIRED") {
    const response = await fetch(`/api/v1/payments/${payment.id}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result }),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error?.message ?? "Não foi possível simular o pagamento.");
      return;
    }
    setMessage(`Pagamento de ${payment.orders?.order_number ?? "pedido"} simulado como ${result}.`);
    await load();
  }

  return (
    <div>
      {message ? <p role="status" className="mb-4 rounded-lg bg-[#edf4ee] p-3 text-sm text-forest">{message}</p> : null}
      {!payments.length ? <p className="rounded-xl bg-white p-5 text-sm text-ink/60">Nenhum pagamento registrado.</p> : (
        <div className="space-y-3">{payments.map((payment) => <article key={payment.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-5">
          <div className="text-sm"><p className="font-semibold">{payment.orders?.order_number ?? payment.id} · {payment.method} · {payment.status}</p><p className="mt-1 text-xs text-ink/55">{formatPrice(payment.amount_cents)} · {new Date(payment.created_at).toLocaleString("pt-BR")}</p></div>
          {payment.status === "PENDING" ? <div className="flex gap-2"><button onClick={() => simulate(payment, "APPROVED")} className="rounded-full bg-forest px-3 py-2 text-xs font-bold text-white">Aprovar simulado</button><button onClick={() => simulate(payment, "DECLINED")} className="rounded-full border border-ink/20 px-3 py-2 text-xs font-semibold">Recusar</button><button onClick={() => simulate(payment, "EXPIRED")} className="rounded-full border border-ink/20 px-3 py-2 text-xs font-semibold">Expirar</button></div> : null}
        </article>)}</div>
      )}
    </div>
  );
}
