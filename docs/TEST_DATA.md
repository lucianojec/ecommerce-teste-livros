# Dados previsíveis para QA

Execute `supabase/seed.sql` após a migration. O script é repetível e não recria pedidos/clientes.

Fixtures de livros têm slug `fixture-livro-01` até `fixture-livro-40` e SKU `QA-LIVRO-001` até `QA-LIVRO-040`. Casos intencionais:

- `QA-LIVRO-001`: estoque alto e duas variantes (capa comum e dura).
- `QA-LIVRO-002`: apenas uma unidade.
- `QA-LIVRO-004`: desconto.
- `QA-LIVRO-010`: sem estoque.
- `fixture-livro-20`: livro inativo.
- `fixture-livro-01` e `fixture-livro-39`: título semelhante.
- `QA-LIVRO-040`: valor alto; livros de baixo preço também disponíveis.
- `BEMVINDO10` e `FIXO500`: cupons válidos.
- `QAEXPIRADO`, `QAINATIVO`, `QALIMITADO`: casos negativos.

Crie clientes pelo formulário ou endpoint de registro. Para um admin de teste, siga o procedimento privilegiado no [guia de ambiente](./ENVIRONMENT.md); não mantenha senha de admin em fixtures.
