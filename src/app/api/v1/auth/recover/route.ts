import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, getApiClient } from "@/lib/auth";
import { jsonError, validationError } from "@/lib/api";

const recoverySchema = z.object({ email: z.email() });

export async function POST(request: Request) {
  const parsed = recoverySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const supabase = await getApiClient(request);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${new URL(appUrl).origin}/recuperar-senha?reset=1`,
  });
  if (error) {
    console.error("auth.recovery_failed", { code: error.code ?? "UNKNOWN" });
    return jsonError(503, "RECOVERY_UNAVAILABLE", "Não foi possível iniciar a recuperação de senha.");
  }
  return NextResponse.json({ data: { accepted: true } });
}

const passwordSchema = z.object({
  password: z.string().min(10).max(128),
  confirm_password: z.string().min(10).max(128),
}).refine((value) => value.password === value.confirm_password, {
  path: ["confirm_password"],
  message: "As senhas não coincidem.",
});

export async function PATCH(request: Request) {
  const parsed = passwordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const { error } = await authenticated.supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    console.error("auth.password_update_failed", { code: error.code ?? "UNKNOWN" });
    return jsonError(422, "PASSWORD_UPDATE_FAILED", "Não foi possível atualizar a senha.");
  }
  return NextResponse.json({ data: { updated: true } });
}
