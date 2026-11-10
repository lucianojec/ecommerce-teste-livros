import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth";
import { databaseError } from "@/lib/database-errors";

export async function GET(request: Request) {
  const authenticated = await authenticateAdmin(request);
  if ("response" in authenticated) return authenticated.response;
  const { data, error } = await authenticated.supabase
    .from("payments")
    .select("id,order_id,method,status,amount_cents,created_at,orders(order_number)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return databaseError(error);
  return NextResponse.json({ data });
}
