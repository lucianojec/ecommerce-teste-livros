import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, validationError } from "@/lib/api";
import { getApiClient } from "@/lib/auth";

const registerSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.email(),
  password: z.string().min(10).max(128),
  confirm_password: z.string().min(10).max(128),
}).refine((value) => value.password === value.confirm_password, {
  path: ["confirm_password"],
  message: "As senhas não coincidem.",
});

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await getApiClient(request);
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.full_name } },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return jsonError(409, "EMAIL_ALREADY_REGISTERED", "Este e-mail já possui cadastro.");
    }
    console.error("auth.registration_failed", { code: error.code ?? "UNKNOWN" });
    return jsonError(422, "REGISTRATION_FAILED", "Não foi possível criar a conta.");
  }

  return NextResponse.json(
    {
      data: {
        user: { id: data.user?.id, email: data.user?.email },
        confirmation_required: !data.session,
      },
    },
    { status: 201 },
  );
}
