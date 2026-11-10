import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { validationError } from "@/lib/api";
import { databaseError } from "@/lib/database-errors";

const addressSchema = z.object({
  label: z.string().trim().min(1).max(40).default("Casa"),
  recipient: z.string().trim().min(2).max(120),
  postal_code: z.string().regex(/^\d{5}-?\d{3}$/),
  street: z.string().trim().min(2).max(160),
  number: z.string().trim().min(1).max(20),
  complement: z.string().trim().max(100).optional(),
  neighborhood: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  state: z.string().length(2).transform((value) => value.toUpperCase()),
  is_default: z.boolean().default(false),
});

export async function GET(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const { data, error } = await authenticated.supabase
    .from("addresses")
    .select("*")
    .eq("user_id", authenticated.user.id)
    .order("created_at", { ascending: false });
  if (error) return databaseError(error);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const parsed = addressSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const { data, error } = await authenticated.supabase
    .from("addresses")
    .insert({ ...parsed.data, user_id: authenticated.user.id })
    .select()
    .single();
  if (error) return databaseError(error);
  return NextResponse.json({ data }, { status: 201 });
}
