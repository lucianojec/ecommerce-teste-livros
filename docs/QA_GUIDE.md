# Guia de automação QA

## Executar

`npm.cmd run dev`; frontend `http://localhost:3000`; Swagger `http://localhost:3000/api-docs`.

## API

Faça `POST /api/v1/auth/login` com JSON `{ "email": "...", "password": "..." }`. Copie `data.access_token` para `Authorization: Bearer <token>` em chamadas privadas. Swagger possui o botão **Authorize**. A coleção importável está em `docs/postman-collection.json`.

Exemplo de catálogo:

```http
GET /api/v1/books?q=janelas&page=1&limit=12
```

Exemplo de checkout: calcule primeiro `POST /api/v1/shipping/quote`, envie endereço e método de pagamento a `POST /api/v1/checkout` e defina uma chave estável no cabeçalho `Idempotency-Key`. As respostas de validação incluem código e `requestId`; tokens e segredos não são registrados nos logs da aplicação.

## Seletores

Use roles/labels semânticos ou seletores estáveis como `book-search`, `book-card`, `add-to-cart`, `login-email`, `login-password`, `cart-item`, `cart-quantity`, `checkout-button`, `shipping-cep`, `payment-method`, `confirm-order`, `order-number` e `order-status`.

## Cenários negativos

- Chamada protegida sem token → `401`.
- Cliente tentando usar `/api/v1/admin/*` → `403`.
- Pedido de outro usuário → `404` (sem revelar existência).
- Variante sem estoque → `409 OUT_OF_STOCK`.
- Cupom expirado/inativo/limite atingido → `422 INVALID_COUPON`.
- Chave de idempotência repetida → devolve o mesmo pedido; não cria pedido adicional.
- Transição administrativa inválida → `409 INVALID_ORDER_STATUS`.
- Simulação de pagamento só é permitida a ADMIN.

Os cenários de corrida de estoque devem usar dois clientes e a fixture de última unidade `QA-LIVRO-002`.
