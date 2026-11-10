import { createClient } from "@/lib/supabase/server";
import { extractAuthorNames } from "@/lib/catalog-utils";

export { extractAuthorNames } from "@/lib/catalog-utils";

export type BookCardData = {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  description: string | null;
  authors: string[];
  price_cents: number;
  compare_at_cents: number | null;
  available: boolean;
  rating: number | null;
};

export async function getBooks(limit = 12): Promise<BookCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(
      "id,title,slug,cover_url,description,product_variants(price_cents,compare_at_cents,stock_quantity,active),book_authors(authors(name)),reviews(rating)",
    )
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return [];
    throw new Error(`Não foi possível carregar o catálogo: ${error.message}`);
  }

  return (data ?? []).map((book) => {
    const variants = book.product_variants ?? [];
    const availableVariant = variants.find(
      (variant) => variant.active && variant.stock_quantity > 0,
    );
    const ratings = book.reviews?.map((review) => review.rating) ?? [];
    return {
      id: book.id,
      title: book.title,
      slug: book.slug,
      cover_url: book.cover_url,
      description: book.description,
      authors: extractAuthorNames(book.book_authors),
      price_cents: availableVariant?.price_cents ?? variants[0]?.price_cents ?? 0,
      compare_at_cents: availableVariant?.compare_at_cents ?? null,
      available: Boolean(availableVariant),
      rating: ratings.length
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null,
    };
  });
}
