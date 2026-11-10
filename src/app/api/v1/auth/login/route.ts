import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, validationError } from "@/lib/api";
import { getApiClient } from "@/lib/auth";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await getApiClient(request);
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.session) {
    return jsonError(401, "INVALID_CREDENTIALS", "E-mail ou senha inválidos.");
  }

  return NextResponse.json({
    data: {
      user: { id: data.user.id, email: data.user.email },
      access_token: data.session.access_token,
      token_type: data.session.token_type,
      expires_at: data.session.expires_at,
    },
  });
}
