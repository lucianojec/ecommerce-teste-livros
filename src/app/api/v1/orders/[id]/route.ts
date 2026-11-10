import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { authenticate } from "@/lib/auth";
import { databaseError } from "@/lib/database-errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const { id } = await params;
  const { data, error } = await authenticated.supabase
    .from("orders")
    .select("*,order_items(*),payments(*),order_status_history(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) return databaseError(error);
  if (!data || (data.user_id !== authenticated.user.id)) {
    return jsonError(404, "ORDER_NOT_FOUND", "Pedido não encontrado.");
  }
  return NextResponse.json({ data });
}
