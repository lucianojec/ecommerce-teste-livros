import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { validationError } from "@/lib/api";
import { databaseError } from "@/lib/database-errors";

const quoteSchema = z.object({ postal_code: z.string().regex(/^\d{5}-?\d{3}$/) });

export async function POST(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const parsed = quoteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const { data: cart, error } = await authenticated.supabase
    .from("carts")
    .select("cart_items(quantity,product_variants(weight_grams,price_cents))")
    .eq("user_id", authenticated.user.id)
    .single();
  if (error) return databaseError(error);
  const items = cart.cart_items ?? [];
  if (items.length === 0) {
    return NextResponse.json(
      { error: { code: "EMPTY_CART", message: "Adicione um livro antes de calcular o frete." } },
      { status: 409 },
    );
  }
  const subtotal = items.reduce((sum, item) => {
    const variant = Array.isArray(item.product_variants)
      ? item.product_variants[0]
      : item.product_variants;
    return sum + item.quantity * (variant?.price_cents ?? 0);
  }, 0);
  const weight = items.reduce((sum, item) => {
    const variant = Array.isArray(item.product_variants)
      ? item.product_variants[0]
      : item.product_variants;
    return sum + item.quantity * (variant?.weight_grams ?? 0);
  }, 0);
  const prefix = parsed.data.postal_code.replace(/\D/g, "").slice(0, 2);
  const regional = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"].includes(prefix);
  const base = regional ? 1290 : 2190;
  const shipping_cents = subtotal >= 15000 ? 0 : base + Math.max(0, Math.ceil(weight / 1000) - 1) * 250;
  return NextResponse.json({
    data: {
      postal_code: parsed.data.postal_code,
      shipping_cents,
      delivery_days: regional ? 3 : 7,
      simulated: true,
    },
  });
}
