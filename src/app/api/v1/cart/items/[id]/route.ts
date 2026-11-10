import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { jsonError, validationError } from "@/lib/api";
import { databaseError } from "@/lib/database-errors";

const quantitySchema = z.object({ quantity: z.number().int().min(1).max(99) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const { id } = await params;
  const parsed = quantitySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const { data, error } = await authenticated.supabase.rpc("set_cart_item_quantity", {
    p_item_id: id,
    p_quantity: parsed.data.quantity,
  });
  if (error) return databaseError(error);
  return NextResponse.json({ data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const { id } = await params;
  const { data: cart, error: cartError } = await authenticated.supabase
    .from("carts")
    .select("id")
    .eq("user_id", authenticated.user.id)
    .single();
  if (cartError) return databaseError(cartError);
  const { data, error } = await authenticated.supabase
    .from("cart_items")
    .delete()
    .eq("id", id)
    .eq("cart_id", cart.id)
    .select("id")
    .maybeSingle();
  if (error) return databaseError(error);
  if (!data) return jsonError(404, "CART_ITEM_NOT_FOUND", "Item não encontrado no carrinho.");
  return new NextResponse(null, { status: 204 });
}
