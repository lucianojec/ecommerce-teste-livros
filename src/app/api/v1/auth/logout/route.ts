import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { jsonError } from "@/lib/api";

export async function POST(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const { error } = await authenticated.supabase.auth.signOut();
  if (error) return jsonError(500, "LOGOUT_FAILED", "Não foi possível encerrar a sessão.");
  return NextResponse.json({ data: { signed_out: true } });
}
