# Banco de dados

## Aplicação

1. Abra o SQL Editor do projeto Supabase.
2. Execute o conteúdo de `supabase/migrations/202611100001_initial_schema.sql` uma única vez.
3. Execute `supabase/seed.sql` para inserir categorias, autores, 40 livros, variantes e cupons de teste.

O seed usa slugs/SKUs determinísticos, `ON CONFLICT` e não altera quantidades existentes de variantes; não apaga pedidos nem dados de clientes.

## Tabelas da migration

- Identidade: `profiles`, `addresses` (identidade vinculada a `auth.users`).
- Catálogo: `books`, `authors`, `book_authors`, `categories`, `book_categories`, `product_variants`, `reviews`.
- Compra: `carts`, `cart_items`, `orders`, `order_items`, `payments`, `order_status_history`.
- Estoque e marketing: `inventory_movements`, `coupons`, `wishlists`.
- Imagens: bucket público `book-covers`; gravação/remoção somente por ADMIN.

Preços são inteiros em centavos; timestamps usam `timestamptz`. Itens do pedido guardam título/SKU/preço unitário como snapshot. RLS limita dados pessoais ao próprio usuário e ações administrativas a `profiles.role = 'ADMIN'`.

## Integridade

O checkout confirma estoque sob locks, gera pedido e pagamento, registra movimentações e esvazia o carrinho em uma única transação. Chaves de idempotência são únicas por cliente. Não use reset/destruição de dados em produção.
