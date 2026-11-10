import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAdmin } from "@/lib/auth";
import { validationError } from "@/lib/api";
import { databaseError } from "@/lib/database-errors";

const simulationSchema = z.object({
  result: z.enum(["APPROVED", "DECLINED", "EXPIRED"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authenticated = await authenticateAdmin(request);
  if ("response" in authenticated) return authenticated.response;
  const { id } = await params;
  const parsed = simulationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const { data, error } = await authenticated.supabase.rpc("simulate_payment", {
    p_payment_id: id,
    p_result: parsed.data.result,
  });
  if (error) return databaseError(error);
  return NextResponse.json({ data, simulated: true });
}
