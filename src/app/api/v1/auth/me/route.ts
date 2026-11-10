import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function GET(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  return NextResponse.json({
    data: { id: authenticated.user.id, email: authenticated.user.email },
  });
}
