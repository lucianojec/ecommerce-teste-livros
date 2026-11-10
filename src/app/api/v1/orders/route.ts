import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { databaseError } from "@/lib/database-errors";

export async function GET(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const { data, error } = await authenticated.supabase
    .from("orders")
    .select("id,order_number,status,total_cents,created_at,payments(status,method)")
    .eq("user_id", authenticated.user.id)
    .order("created_at", { ascending: false });
  if (error) return databaseError(error);
  return NextResponse.json({ data });
}
