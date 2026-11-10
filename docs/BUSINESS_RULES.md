# Regras de negócio

- O preço e o estoque aceitos vêm do PostgreSQL, nunca do preço enviado pelo navegador.
- A quantidade no carrinho varia de 1 a 99 e não pode superar o estoque atual.
- Checkout exige usuário autenticado, carrinho não vazio, endereço válido e `Idempotency-Key` (8–100 caracteres).
- O frete demonstrativo é recalculado no servidor: R$ 12,90 para prefixos de CEP 01–19, R$ 21,90 para os demais, mais R$ 2,50 por kg adicional; frete grátis a partir de R$ 150,00.
- Cupons só são aceitos se ativos, dentro da validade, com limite disponível e subtotal mínimo atendido. Desconto não excede o subtotal.
- Pedidos iniciam em `PENDING_PAYMENT`; pagamento é sempre simulado. Aprovação administrativa define `PAID`; recusa/expiração cancela e devolve estoque.
- Transições administrativas permitidas: `PAID → PROCESSING/CANCELLED`, `PROCESSING → SHIPPED/CANCELLED`, `SHIPPED → DELIVERED`. Não há transição de volta.
- Cliente só consulta os próprios pedidos e endereços. Alterar perfil não permite editar o próprio papel.
- Nenhum dado de cartão é coletado ou armazenado.
