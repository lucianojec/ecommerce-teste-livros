import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { jsonError, validationError } from "@/lib/api";
import { databaseError } from "@/lib/database-errors";

const checkoutSchema = z.object({
  shipping_cents: z.number().int().min(0).max(100000),
  payment_method: z.enum(["PIX", "BOLETO", "CARD"]),
  coupon_code: z.string().trim().max(40).optional(),
  address: z.object({
    recipient: z.string().trim().min(2).max(120),
    postal_code: z.string().regex(/^\d{5}-?\d{3}$/),
    street: z.string().trim().min(2).max(160),
    number: z.string().trim().min(1).max(20),
    complement: z.string().trim().max(100).optional(),
    neighborhood: z.string().trim().min(2).max(100),
    city: z.string().trim().min(2).max(100),
    state: z.string().length(2).transform((value) => value.toUpperCase()),
  }),
});

export async function POST(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const idempotencyKey = request.headers.get("Idempotency-Key");
  if (!idempotencyKey) {
    return jsonError(400, "IDEMPOTENCY_KEY_REQUIRED", "Envie o cabeçalho Idempotency-Key.");
  }

  const { data, error } = await authenticated.supabase.rpc("checkout_order", {
    p_shipping_cents: parsed.data.shipping_cents,
    p_shipping_address: parsed.data.address,
    p_payment_method: parsed.data.payment_method,
    p_idempotency_key: idempotencyKey,
    p_coupon_code: parsed.data.coupon_code ?? null,
  });
  if (error) return databaseError(error);
  const order = data?.[0];
  if (!order) return jsonError(503, "CHECKOUT_FAILED", "Não foi possível criar o pedido.");
  return NextResponse.json(
    {
      data: {
        id: order.order_id,
        order_number: order.order_number,
        payment_id: order.payment_id,
      },
    },
    { status: 201 },
  );
}
