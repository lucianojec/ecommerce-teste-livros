# Ambiente e configuração Supabase

## Variáveis

Copie `.env.example` para `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Obtenha URL e publishable key em **Supabase Dashboard → Project Settings → API** (ou API Keys, conforme a interface atual). A publishable key é feita para uso do cliente e deve sempre ser protegida por RLS. A implementação não precisa de `service_role`/secret key para a jornada básica.

## Banco, Storage e Auth

1. Use o projeto Supabase existente; não crie outro.
2. No **SQL Editor**, execute a migration `supabase/migrations/202611100001_initial_schema.sql`.
3. Execute `supabase/seed.sql`.
4. A migration prepara o bucket `book-covers` público para leitura; escrita e remoção exigem perfil ADMIN. Não faça upload de arquivo pessoal.
5. Em **Authentication → URL Configuration**, defina `Site URL` como `http://localhost:3000` e permita o redirect `http://localhost:3000/recuperar-senha`.
6. Para usuários fictícios locais, em **Authentication → Providers → Email**, desative confirmação de e-mail somente se apropriado para o ambiente de treinamento. Não altere essa configuração em produção sem avaliar riscos.
7. Cadastre uma conta pela interface. Para elevar uma conta a ADMIN, obtenha o UUID dela em Authentication → Users e rode no SQL Editor, conferindo o email/ID antes:

```sql
update public.profiles
set role = 'ADMIN'
where id = '<UUID-confirmado-da-conta>'
  and exists (
    select 1 from auth.users
    where id = '<UUID-confirmado-da-conta>'
      and email = '<email-confirmado>'
  );
```

Não há conta administrativa pública ou senha embutida. A consulta é privilegiada e deve ser executada manualmente por quem controla o projeto Supabase.

## Segredos

`.env.local` é ignorado por Git. Não copie `service_role`/secret key para `NEXT_PUBLIC_*`, não cole tokens em issues/logs e não use credenciais reais em testes automatizados.
