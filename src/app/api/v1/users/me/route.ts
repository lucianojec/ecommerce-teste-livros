import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { validationError } from "@/lib/api";
import { databaseError } from "@/lib/database-errors";

const profileSchema = z.object({ full_name: z.string().trim().min(2).max(120) });

export async function GET(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const { data, error } = await authenticated.supabase
    .from("profiles")
    .select("id,full_name,role,created_at")
    .eq("id", authenticated.user.id)
    .single();
  if (error) return databaseError(error);
  return NextResponse.json({ data: { ...data, email: authenticated.user.email } });
}

export async function PATCH(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const { data, error } = await authenticated.supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, updated_at: new Date().toISOString() })
    .eq("id", authenticated.user.id)
    .select("id,full_name,role")
    .single();
  if (error) return databaseError(error);
  return NextResponse.json({ data });
}
