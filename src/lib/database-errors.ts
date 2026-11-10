import { jsonError } from "@/lib/api";

const knownErrors: Record<string, { status: number; message: string }> = {
  UNAUTHORIZED: { status: 401, message: "Faça login para continuar." },
  FORBIDDEN: { status: 403, message: "Você não tem permissão para esta ação." },
  BOOK_NOT_FOUND: { status: 404, message: "Livro ou variante não encontrado." },
  PAYMENT_NOT_FOUND: { status: 404, message: "Pagamento não encontrado." },
  ORDER_NOT_FOUND: { status: 404, message: "Pedido não encontrado." },
  CART_ITEM_NOT_FOUND: { status: 404, message: "Item não encontrado no carrinho." },
  OUT_OF_STOCK: { status: 409, message: "Estoque insuficiente para a quantidade solicitada." },
  EMPTY_CART: { status: 409, message: "O carrinho está vazio." },
  INVALID_COUPON: { status: 422, message: "Cupom inválido, expirado ou sem usos disponíveis." },
  COUPON_MINIMUM_NOT_MET: { status: 422, message: "O valor mínimo para o cupom não foi atingido." },
  INVALID_QUANTITY: { status: 422, message: "A quantidade deve estar entre 1 e 99." },
  INVALID_PAYMENT_METHOD: { status: 422, message: "Forma de pagamento inválida." },
  INVALID_PAYMENT_RESULT: { status: 422, message: "Resultado de pagamento inválido." },
  INVALID_PAYMENT_STATUS: { status: 409, message: "Este pagamento já foi processado." },
  INVALID_ORDER_STATUS: { status: 409, message: "Esta transição de status não é permitida." },
  INVALID_ADDRESS: { status: 422, message: "Endereço de entrega inválido." },
  INVALID_SHIPPING: { status: 422, message: "Valor de frete inválido." },
  INVALID_IDEMPOTENCY_KEY: { status: 422, message: "Chave de idempotência inválida." },
  BOOK_UNAVAILABLE: { status: 409, message: "Um dos livros não está mais disponível." },
};

export function databaseError(error: { message: string; code?: string }) {
  if (error.code === "PGRST205" || error.code === "42P01") {
    return jsonError(
      503,
      "DATABASE_NOT_READY",
      "O banco ainda não está inicializado. Aplique a migration do projeto Supabase.",
    );
  }
  const known = Object.entries(knownErrors).find(([key]) =>
    error.message.includes(key),
  );
  if (known) {
    const [code, detail] = known;
    return jsonError(detail.status, code, detail.message);
  }
  console.error("database.operation_failed", { code: error.code ?? "UNKNOWN" });
  return jsonError(503, "DATABASE_UNAVAILABLE", "Não foi possível concluir a operação.");
}
