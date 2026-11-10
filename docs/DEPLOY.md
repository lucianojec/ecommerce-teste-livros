# Deploy Vercel

1. Aplique migration e seed no Supabase e confirme que o catálogo aparece em `GET /api/v1/books`.
2. Importe o repositório `lucianojec/ecommerce-teste-livros` no dashboard Vercel usando Next.js.
3. Cadastre `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `NEXT_PUBLIC_APP_URL` para Production/Preview. `NEXT_PUBLIC_APP_URL` deve ser a URL pública HTTPS do deploy.
4. No Supabase, adicione a URL Vercel às URLs permitidas para login e recuperação.
5. Faça o deploy e teste homepage, login, catálogo, carrinho e `/api-docs`.
6. Configure/atribua administrador manualmente pelo SQL Editor (não há provisionamento automático).

O workflow de GitHub Actions verifica lint, tipos, testes e build sem acessar o banco. Produção atual: https://ecommerce-teste-livros.vercel.app. Em **Authentication → URL Configuration**, o Site URL aponta para esse domínio e os redirects permitidos incluem `/**` do domínio de produção, das previews e de `http://localhost:3000`. Links de confirmação e recuperação de senha passam por `/auth/callback`, que cria a sessão e redireciona.
