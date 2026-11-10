import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { databaseError } from "@/lib/database-errors";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(
      "id,title,subtitle,slug,isbn,publisher,publication_year,synopsis,description,language,pages,cover_url,product_variants(id,sku,format,price_cents,compare_at_cents,stock_quantity,active),book_authors(authors(name)),book_categories(categories(name,slug)),reviews(id,rating,title,body,created_at)",
    )
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) return databaseError(error);
  if (!data) return jsonError(404, "BOOK_NOT_FOUND", "Livro não encontrado.");
  return NextResponse.json({ data });
}
