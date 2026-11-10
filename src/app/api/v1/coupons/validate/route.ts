import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { validationError } from "@/lib/api";
import { databaseError } from "@/lib/database-errors";

const couponSchema = z.object({
  code: z.string().trim().min(1).max(40),
  subtotal_cents: z.number().int().min(0),
});

export async function POST(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const parsed = couponSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const { data: coupon, error } = await authenticated.supabase
    .from("coupons")
    .select("code,discount_type,discount_value,minimum_subtotal_cents,valid_from,valid_until,usage_limit,usage_count")
    .eq("code", parsed.data.code.toUpperCase())
    .eq("active", true)
    .maybeSingle();
  if (error) return databaseError(error);
  const now = Date.now();
  if (
    !coupon ||
    now < Date.parse(coupon.valid_from) ||
    (coupon.valid_until && now > Date.parse(coupon.valid_until)) ||
    (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) ||
    parsed.data.subtotal_cents < coupon.minimum_subtotal_cents
  ) {
    return NextResponse.json(
      { error: { code: "INVALID_COUPON", message: "Cupom inválido, expirado ou sem usos disponíveis." } },
      { status: 422 },
    );
  }
  const discount_cents = coupon.discount_type === "PERCENTAGE"
    ? Math.min(parsed.data.subtotal_cents, Math.floor(parsed.data.subtotal_cents * coupon.discount_value / 100))
    : Math.min(parsed.data.subtotal_cents, coupon.discount_value);
  return NextResponse.json({ data: { code: coupon.code, discount_cents } });
}
