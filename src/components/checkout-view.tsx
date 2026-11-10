"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/money";

type Item = {
  id: string;
  quantity: number;
  product_variants: {
    price_cents: number;
    books: { title: string } | null;
  } | null;
};

export function CheckoutView() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [postalCode, setPostalCode] = useState("");
  const [shipping, setShipping] = useState<number | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "BOLETO" | "CARD">("PIX");
  const [fields, setFields] = useState({ recipient: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + item.quantity * (item.product_variants?.price_cents ?? 0), 0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([fetch("/api/v1/cart"), fetch("/api/v1/users/me")])
      .then(async ([cartResponse, profileResponse]) => {
        if (cartResponse.status === 401 || profileResponse.status === 401) {
          router.push("/login?next=/checkout");
          return null;
        }
        const cart = await cartResponse.json();
        const profile = await profileResponse.json();
        if (!cartResponse.ok || !profileResponse.ok) throw new Error(cart.error?.message ?? profile.error?.message ?? "Não foi possível carregar o checkout.");
        return { items: cart.data.cart_items as Item[], fullName: profile.data?.full_name as string | undefined };
      })
      .then((result) => {
        if (!controller.signal.aborted && result) {
          setItems(result.items);
          setFields((current) => ({ ...current, recipient: result.fullName ?? "" }));
          setLoaded(true);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setMessage(error instanceof Error ? error.message : "Não foi possível carregar o checkout.");
          setLoaded(true);
        }
      });
    return () => controller.abort();
  }, [router]);

  async function quoteShipping() {
    setMessage("");
    const response = await fetch("/api/v1/shipping/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postal_code: postalCode }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message ?? "CEP inválido.");
    setShipping(body.data.shipping_cents);
  }

  async function validateCoupon() {
    const response = await fetch("/api/v1/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon, subtotal_cents: subtotal }),
    });
    const body = await response.json();
    if (!response.ok) {
      setCouponDiscount(0);
      throw new Error(body.error?.message ?? "Cupom inválido.");
    }
    setCouponDiscount(body.data.discount_cents);
    setMessage(`Cupom aplicado: ${formatPrice(body.data.discount_cents)} de desconto.`);
  }

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (shipping === null) {
      setMessage("Calcule o frete antes de concluir o pedido.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const idempotencyKey = sessionStorage.getItem("qa-checkout-key") ?? crypto.randomUUID();
      sessionStorage.setItem("qa-checkout-key", idempotencyKey);
      const response = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          shipping_cents: shipping,
          payment_method: paymentMethod,
          coupon_code: coupon.trim() || undefined,
          address: { ...fields, postal_code: postalCode },
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível finalizar a compra.");
      sessionStorage.removeItem("qa-checkout-key");
      router.push(`/pedido-confirmado/${body.data.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível finalizar a compra.");
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) return <div className="h-48 animate-pulse rounded-xl bg-ink/10" />;
  if (!items.length) return <div className="rounded-xl bg-white p-8 text-center"><p>Seu carrinho está vazio.</p><Link className="mt-3 inline-block font-semibold text-forest underline" href="/livros">Voltar ao catálogo</Link></div>;

  const inputClass = "w-full rounded-lg border border-ink/20 bg-white px-3 py-3 text-sm outline-none focus:border-forest";
  return (
    <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="rounded-xl bg-white p-5 sm:p-7">
          <h2 className="font-display text-2xl font-bold">Endereço de entrega</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold">Nome do destinatário</span><input required value={fields.recipient} onChange={(event) => setFields({ ...fields, recipient: event.target.value })} className={inputClass} /></label>
            <label><span className="mb-1.5 block text-sm font-semibold">CEP</span><div className="flex gap-2"><input data-testid="shipping-cep" required value={postalCode} onChange={(event) => { setPostalCode(event.target.value); setShipping(null); }} placeholder="00000-000" className={inputClass} /><button type="button" onClick={() => quoteShipping().catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Erro ao calcular frete."))} className="shrink-0 rounded-lg border border-forest px-3 text-xs font-semibold text-forest">Calcular</button></div></label>
            <label><span className="mb-1.5 block text-sm font-semibold">Rua</span><input required value={fields.street} onChange={(event) => setFields({ ...fields, street: event.target.value })} className={inputClass} /></label>
            <label><span className="mb-1.5 block text-sm font-semibold">Número</span><input required value={fields.number} onChange={(event) => setFields({ ...fields, number: event.target.value })} className={inputClass} /></label>
            <label><span className="mb-1.5 block text-sm font-semibold">Complemento</span><input value={fields.complement} onChange={(event) => setFields({ ...fields, complement: event.target.value })} className={inputClass} /></label>
            <label><span className="mb-1.5 block text-sm font-semibold">Bairro</span><input required value={fields.neighborhood} onChange={(event) => setFields({ ...fields, neighborhood: event.target.value })} className={inputClass} /></label>
            <label><span className="mb-1.5 block text-sm font-semibold">Cidade</span><input required value={fields.city} onChange={(event) => setFields({ ...fields, city: event.target.value })} className={inputClass} /></label>
            <label><span className="mb-1.5 block text-sm font-semibold">UF</span><input required maxLength={2} value={fields.state} onChange={(event) => setFields({ ...fields, state: event.target.value.toUpperCase() })} className={inputClass} /></label>
          </div>
          {shipping !== null ? <p role="status" className="mt-4 text-sm text-leaf">Frete simulado calculado: {shipping ? formatPrice(shipping) : "grátis"}</p> : null}
        </section>
        <section className="rounded-xl bg-white p-5 sm:p-7">
          <h2 className="font-display text-2xl font-bold">Pagamento simulado</h2>
          <p className="mt-1 text-sm text-ink/55">Nenhuma cobrança real será realizada.</p>
          <label className="mt-4 block"><span className="mb-1.5 block text-sm font-semibold">Forma de pagamento</span><select data-testid="payment-method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as "PIX" | "BOLETO" | "CARD")} className={inputClass}><option value="PIX">Pix (simulado)</option><option value="BOLETO">Boleto (simulado)</option><option value="CARD">Cartão de crédito (simulado)</option></select></label>
          <label className="mt-4 block"><span className="mb-1.5 block text-sm font-semibold">Cupom de desconto</span><div className="flex gap-2"><input value={coupon} onChange={(event) => setCoupon(event.target.value.toUpperCase())} placeholder="Ex.: BEMVINDO10" className={inputClass} /><button type="button" onClick={() => validateCoupon().catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Erro ao validar cupom."))} className="shrink-0 rounded-lg border border-forest px-4 text-sm font-semibold text-forest">Aplicar</button></div></label>
        </section>
        {message ? <p role="alert" className="rounded-lg bg-[#fff0ed] p-3 text-sm text-[#913a2d]">{message}</p> : null}
      </div>
      <aside className="h-fit rounded-xl bg-white p-5">
        <h2 className="font-display text-xl font-bold">Resumo do pedido</h2>
        <div className="mt-5 space-y-3 text-sm">
          {items.map((item) => <div key={item.id} className="flex justify-between gap-3"><span className="truncate">{item.quantity} × {item.product_variants?.books?.title}</span><span>{formatPrice(item.quantity * (item.product_variants?.price_cents ?? 0))}</span></div>)}
          <div className="flex justify-between border-t border-ink/10 pt-3"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between"><span>Frete</span><span>{shipping === null ? "Calcule acima" : shipping ? formatPrice(shipping) : "Grátis"}</span></div>
          {couponDiscount > 0 ? <div className="flex justify-between text-leaf"><span>Desconto</span><span>− {formatPrice(couponDiscount)}</span></div> : null}
          <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-bold"><span>Total</span><span>{formatPrice(Math.max(0, subtotal + (shipping ?? 0) - couponDiscount))}</span></div>
        </div>
        <button data-testid="confirm-order" disabled={busy || shipping === null} className="mt-5 w-full rounded-full bg-forest px-5 py-3.5 text-sm font-bold text-white hover:bg-leaf disabled:cursor-not-allowed disabled:opacity-45">
          {busy ? "Processando..." : "Confirmar pedido"}
        </button>
        <p className="mt-3 text-center text-xs text-ink/45">Estoque reservado na confirmação · Ambiente de treinamento</p>
      </aside>
    </form>
  );
}
