import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAdmin } from "@/lib/auth";
import { validationError } from "@/lib/api";
import { databaseError } from "@/lib/database-errors";

const statusSchema = z.object({
  status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authenticated = await authenticateAdmin(request);
  if ("response" in authenticated) return authenticated.response;
  const { id } = await params;
  const parsed = statusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const { data, error } = await authenticated.supabase.rpc("transition_order", {
    p_order_id: id,
    p_new_status: parsed.data.status,
  });
  if (error) return databaseError(error);
  return NextResponse.json({ data });
}
