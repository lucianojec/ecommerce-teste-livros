# Livraria QA

E-commerce demonstrativo de livros em pt-BR, criado para treinamento de QA e automação. A aplicação usa Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth e PostgreSQL. Carrinho, catálogo, endereços, pedidos, cupons, estoque e painel administrativo usam dados persistidos; pagamento e frete são simulados e não movimentam dinheiro.

## Requisitos

- Node.js 20.9 ou superior.
- Projeto Supabase já criado.
- Migração e seed aplicados manualmente no banco (ver [Configuração do Supabase](./docs/ENVIRONMENT.md)).

## Executar localmente

```powershell
npm.cmd install
npm.cmd run dev
```

Configure `.env.local` com `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `NEXT_PUBLIC_APP_URL` (veja [.env.example](./.env.example)). A aplicação local fica em `http://localhost:3000`; a documentação Swagger, em `http://localhost:3000/api-docs`.

## Verificações

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

## Funcionalidades implementadas

- Catálogo persistido, busca por título, categorias, variantes, preço, estoque e página de detalhes.
- Cadastro, login, logout e recuperação de senha pelo Supabase Auth.
- Perfil, endereços, favoritos e pedidos por usuário.
- Carrinho persistido com validação concorrente de estoque.
- Cotação de frete demonstrativa e validação de cupons.
- Checkout atômico, idempotente, com snapshot de itens, reserva/baixa de estoque e movimentações.
- Pagamento simulado, dashboard administrativo e transições de status permitidas.
- APIs REST sob `/api/v1`, OpenAPI/Swagger, Postman e fixtures SQL idempotentes.
- RLS nas tabelas do negócio e policies do bucket `book-covers`.

## Estado e limitações

Leia [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) antes de usar. O projeto Supabase informado não foi alterado automaticamente; aplique a migração e o seed explicitamente. A interface cobre a jornada principal, mas CRUD administrativo completo de livros/categorias/autores, rastreamento de transportadora, suporte, CRM, fidelidade, avaliações editáveis e ferramentas de reset do Laboratório QA ainda não estão concluídos. A documentação OpenAPI descreve os endpoints já implementados; consulte [limitações conhecidas](./docs/KNOWN_LIMITATIONS.md).

## Documentação

- [Arquitetura](./docs/ARCHITECTURE.md)
- [Banco de dados](./docs/DATABASE.md)
- [Regras de negócio](./docs/BUSINESS_RULES.md)
- [APIs e QA](./docs/QA_GUIDE.md)
- [Dados de teste](./docs/TEST_DATA.md)
- [Ambiente local e Supabase](./docs/ENVIRONMENT.md)
- [Deploy Vercel](./docs/DEPLOY.md)
- [Limitações](./docs/KNOWN_LIMITATIONS.md)