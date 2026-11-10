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
    .from("payments")
    .select("id,order_id,method,status,amount_cents,simulated_reference,created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) return databaseError(error);
  if (!data) return jsonError(404, "PAYMENT_NOT_FOUND", "Pagamento não encontrado.");
  return NextResponse.json({ data });
}
