# Arquitetura

- **Interface:** Next.js App Router, React, TypeScript e Tailwind CSS. Componentes de catálogo/compra consomem as APIs REST da própria aplicação.
- **API:** Route Handlers sob `/api/v1`; validação Zod; autenticação Supabase por cookies SSR ou `Authorization: Bearer`.
- **Dados:** PostgreSQL no Supabase, migrations SQL e RLS. O cliente público usa somente a publishable key; não há chave secreta privilegiada no frontend.
- **Regras transacionais:** `checkout_order`, `add_cart_item`, `set_cart_item_quantity`, `simulate_payment` e `transition_order` são funções PostgreSQL protegidas e executadas em transação.
- **Integrações simuladas:** frete por faixa regional/peso e pagamentos Pix/boleto/cartão sem processar dados financeiros.
- **Runtime:** Next.js serverless, sem arquivos de dados persistentes locais.

Consulte a migration para o modelo efetivamente criado. A camada completa de repositories/services por domínio e CRUD administrativo ainda está parcial.
