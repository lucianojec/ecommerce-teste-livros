# Implementation status

Status atualizado em 10/11/2026. "Implementado" significa código presente no repositório, não significa que a migration tenha sido aplicada no projeto Supabase nem que o deploy tenha sido realizado.

| Área | Estado | Evidência / pendência |
|---|---|---|
| Next.js, TypeScript, Tailwind e design responsivo | Implementado | App Router, componentes e seletores `data-testid`; build de produção validado localmente. |
| Supabase Auth | Implementado no código | Cadastro, login, logout e recuperação; autenticação por cookie e token Bearer; depende de aplicar migration e configurar URLs/Auth no dashboard. |
| Catálogo, busca, categorias e variantes | Implementado | APIs e telas conectadas ao banco; filtros disponíveis são busca/categoria e paginação. URLs de capa aceitam apenas HTTPS. |
| Carrinho e favoritos | Implementado | Persistidos por cliente, com RLS. |
| Perfil e endereços | Implementado | Consulta/edição do perfil e CRUD de endereços via API. |
| Checkout e estoque | Implementado | RPC PostgreSQL atômica, valida estoque, frete calculado no servidor, coupon/stock update, idempotency key e movimentações. |
| Pagamentos | Parcialmente implementado | Simulador administrável de aprovado/recusado/expirado; sem gateway real por definição. |
| Pedidos e painel | Parcialmente implementado | Consulta própria, métricas e transições administrativas; logística/rastreamento não implementados. |
| Seed previsível | Implementado | `supabase/seed.sql` com 40 livros, casos de estoque e cupons, idempotente. |
| Migração e políticas | Aplicado | Migration e seed aplicados no projeto Supabase `yztslnvemfbqftblholk` em 10/11/2026 (40 livros, 41 variantes, 5 cupons). |
| OpenAPI, Swagger e Postman | Implementado parcialmente | Swagger em `/api-docs`; contrato lista a superfície entregue, não todos os endpoints inicialmente propostos. |
| Testes, lint, typecheck e build | Validado localmente | `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd test` (3 testes) e `npm.cmd run build` passaram. `/`, `/livros` e `/api-docs` responderam HTTP 200; `/api/v1/books` respondeu `DATABASE_NOT_READY` (503), como esperado antes da migration. |
| Deploy Vercel / GitHub Actions | Publicado | Produção em https://ecommerce-teste-livros.vercel.app, projeto Vercel conectado ao GitHub (push na `main` publica). |
| Upload de capas | Parcial | Bucket e policies preparados na migration; interface de upload administrativo pendente. |
| CRUD admin, suporte, CRM, fidelidade, analytics detalhado e Laboratório QA | Pendente | Ver [limitações conhecidas](./docs/KNOWN_LIMITATIONS.md). |

## Pendências manuais

1. Desativar confirmação de e-mail apenas no projeto de treinamento, se desejado (o SMTP padrão do Supabase limita o envio de e-mails por hora).
2. Criar uma conta ADMIN pela consulta SQL descrita em [ENVIRONMENT.md](./docs/ENVIRONMENT.md).
