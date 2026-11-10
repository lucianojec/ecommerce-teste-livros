import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { jsonError, validationError } from "@/lib/api";
import { databaseError } from "@/lib/database-errors";

const addressSchema = z.object({
  label: z.string().trim().min(1).max(40).optional(),
  recipient: z.string().trim().min(2).max(120).optional(),
  postal_code: z.string().regex(/^\d{5}-?\d{3}$/).optional(),
  street: z.string().trim().min(2).max(160).optional(),
  number: z.string().trim().min(1).max(20).optional(),
  complement: z.string().trim().max(100).nullable().optional(),
  neighborhood: z.string().trim().min(2).max(100).optional(),
  city: z.string().trim().min(2).max(100).optional(),
  state: z.string().length(2).transform((value) => value.toUpperCase()).optional(),
  is_default: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const { id } = await params;
  const parsed = addressSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const { data, error } = await authenticated.supabase
    .from("addresses")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", authenticated.user.id)
    .select()
    .maybeSingle();
  if (error) return databaseError(error);
  if (!data) return jsonError(404, "ADDRESS_NOT_FOUND", "Endereço não encontrado.");
  return NextResponse.json({ data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const { id } = await params;
  const { data, error } = await authenticated.supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", authenticated.user.id)
    .select("id")
    .maybeSingle();
  if (error) return databaseError(error);
  if (!data) return jsonError(404, "ADDRESS_NOT_FOUND", "Endereço não encontrado.");
  return new NextResponse(null, { status: 204 });
}
