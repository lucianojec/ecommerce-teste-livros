import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { validationError } from "@/lib/api";
import { databaseError } from "@/lib/database-errors";

const wishlistSchema = z.object({ book_id: z.uuid() });

export async function GET(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const { data, error } = await authenticated.supabase
    .from("wishlists")
    .select("created_at,books(id,title,slug,cover_url,product_variants(id,sku,format,price_cents,compare_at_cents,stock_quantity),book_authors(authors(name)),reviews(rating))")
    .eq("user_id", authenticated.user.id)
    .order("created_at", { ascending: false });
  if (error) return databaseError(error);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const parsed = wishlistSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const { data, error } = await authenticated.supabase
    .from("wishlists")
    .upsert({ user_id: authenticated.user.id, book_id: parsed.data.book_id })
    .select()
    .single();
  if (error) return databaseError(error);
  return NextResponse.json({ data }, { status: 201 });
}
