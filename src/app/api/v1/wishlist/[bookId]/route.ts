import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { databaseError } from "@/lib/database-errors";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  const authenticated = await authenticate(request);
  if ("response" in authenticated) return authenticated.response;
  const { bookId } = await params;
  const { data, error } = await authenticated.supabase
    .from("wishlists")
    .delete()
    .eq("user_id", authenticated.user.id)
    .eq("book_id", bookId)
    .select("book_id")
    .maybeSingle();
  if (error) return databaseError(error);
  if (!data) return jsonError(404, "WISHLIST_ITEM_NOT_FOUND", "Livro não encontrado nos favoritos.");
  return new NextResponse(null, { status: 204 });
}
