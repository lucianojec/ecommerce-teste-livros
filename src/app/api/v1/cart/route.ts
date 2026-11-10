import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { jsonError, validationError } from "@/lib/api";
import { databaseError } from "@/lib/database-errors";
import { z } from "zod";

const addItemSchema = z.object({
  variant_id: z.uuid(),
  quantity: z.number().int().min(1).max(99).default(1),
});

export async function GET(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const { data: cart, error } = await authenticated.supabase
    .from("carts")
    .select(
      "id,cart_items(id,quantity,product_variants(id,sku,format,price_cents,stock_quantity,books(id,title,slug,cover_url)))",
    )
    .eq("user_id", authenticated.user.id)
    .maybeSingle();
  if (error) return databaseError(error);
  if (!cart) return jsonError(404, "CART_NOT_FOUND", "Carrinho não encontrado.");
  return NextResponse.json({ data: cart });
}

export async function POST(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const parsed = addItemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const { data, error } = await authenticated.supabase.rpc("add_cart_item", {
    p_variant_id: parsed.data.variant_id,
    p_quantity: parsed.data.quantity,
  });
  if (error) return databaseError(error);
  return NextResponse.json({ data: data?.[0] }, { status: 201 });
}

export async function DELETE(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const { data: cart, error: cartError } = await authenticated.supabase
    .from("carts")
    .select("id")
    .eq("user_id", authenticated.user.id)
    .single();
  if (cartError) return databaseError(cartError);
  const { error } = await authenticated.supabase.from("cart_items").delete().eq("cart_id", cart.id);
  if (error) return databaseError(error);
  return new NextResponse(null, { status: 204 });
}
