import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, validationError } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { extractAuthorNames } from "@/lib/catalog-utils";

const querySchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  sort: z.enum(["newest", "title"]).default("newest"),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: url.searchParams.get("q") || undefined,
    page: url.searchParams.get("page") || 1,
    limit: url.searchParams.get("limit") || 12,
    sort: url.searchParams.get("sort") || "newest",
  });
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient();
  let query = supabase
    .from("books")
    .select(
      "id,title,slug,cover_url,description,product_variants(id,sku,format,price_cents,compare_at_cents,stock_quantity,active),book_authors(authors(name)),book_categories!inner(categories!inner(slug)),reviews(rating)",
      { count: "exact" },
    )
    .eq("active", true);

  if (parsed.data.q) {
    query = query.ilike("title", `%${parsed.data.q.replace(/[%_]/g, "")}%`);
  }
  if (parsed.data.category) {
    query = query.eq("book_categories.categories.slug", parsed.data.category);
  }
  query = query.order(parsed.data.sort === "title" ? "title" : "created_at", {
    ascending: parsed.data.sort === "title" ? true : false,
  });
  const from = (parsed.data.page - 1) * parsed.data.limit;
  const { data, error, count } = await query.range(from, from + parsed.data.limit - 1);
  if (error) {
    console.error("catalog.list_failed", { code: error.code });
    if (error.code === "PGRST205" || error.code === "42P01") {
      return jsonError(503, "DATABASE_NOT_READY", "O banco ainda não está inicializado. Aplique a migration do projeto Supabase.");
    }
    return jsonError(503, "DATABASE_UNAVAILABLE", "O catálogo está temporariamente indisponível.");
  }

  const books = (data ?? []).map((book) => {
    const variants = book.product_variants ?? [];
    const variant = variants.find((item) => item.active && item.stock_quantity > 0) ?? variants[0];
    const ratings = book.reviews?.map((review) => review.rating) ?? [];
    return {
      id: book.id,
      title: book.title,
      slug: book.slug,
      cover_url: book.cover_url,
      description: book.description,
      authors: extractAuthorNames(book.book_authors),
      variant: variant
        ? {
            id: variant.id,
            sku: variant.sku,
            format: variant.format,
            price_cents: variant.price_cents,
            compare_at_cents: variant.compare_at_cents,
            stock_quantity: variant.stock_quantity,
          }
        : null,
      rating: ratings.length
        ? ratings.reduce((sum, item) => sum + item, 0) / ratings.length
        : null,
    };
  });

  return NextResponse.json({
    data: books,
    pagination: {
      page: parsed.data.page,
      limit: parsed.data.limit,
      total: count ?? 0,
      total_pages: Math.ceil((count ?? 0) / parsed.data.limit),
    },
  });
}
