import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth";
import { databaseError } from "@/lib/database-errors";

export async function GET(request: Request) {
  const authenticated = await authenticateAdmin(request);
  if ("response" in authenticated) return authenticated.response;

  const [books, orders, customers, stock, pendingPayments] = await Promise.all([
    authenticated.supabase.from("books").select("id", { count: "exact", head: true }),
    authenticated.supabase.from("orders").select("id,status,total_cents,created_at"),
    authenticated.supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "CUSTOMER"),
    authenticated.supabase.from("product_variants").select("id,sku,stock_quantity").lte("stock_quantity", 3).eq("active", true),
    authenticated.supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
  ]);
  const failure = [books.error, orders.error, customers.error, stock.error, pendingPayments.error].find(Boolean);
  if (failure) return databaseError(failure);
  const totalRevenue = (orders.data ?? [])
    .filter((order) => ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status))
    .reduce((sum, order) => sum + order.total_cents, 0);

  return NextResponse.json({
    data: {
      book_count: books.count ?? 0,
      customer_count: customers.count ?? 0,
      order_count: orders.data?.length ?? 0,
      pending_payment_count: pendingPayments.count ?? 0,
      low_stock_variants: stock.data ?? [],
      total_revenue_cents: totalRevenue,
      recent_orders: [...(orders.data ?? [])]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 8),
      simulated_metrics: true,
    },
  });
}
