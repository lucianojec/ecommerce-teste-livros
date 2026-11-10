# Limitações conhecidas

- A migration e o seed foram criados localmente, mas precisam ser aplicados no projeto Supabase pelo SQL Editor. Não há evidência de conexão ou alterações remotas feitas.
- Implementação operacional concentrada na jornada catálogo → autenticação → carrinho → checkout simulado → pedido/painel.
- O CRUD administrativo de livros/autores/categorias/estoque/cupom ainda não possui telas/API completa; a migration tem policies para parte do catálogo.
- Não foram implementados rastreamento de transportadora, entregas, documento fiscal demonstrativo, e-mail/WhatsApp, CRM, campanha, programa de fidelidade, tickets/FAQ editável e analytics detalhado.
- Avaliações são lidas no detalhe/listagem, mas falta interface/API de criação e moderação.
- O bucket de imagens está preparado com policies, mas falta fluxo de upload e associação das imagens no painel.
- Não existe reset do banco nem Laboratório QA; nenhuma operação destrutiva é exposta.
- Frete/pagamento são simuladores determinísticos. Não há integração financeira ou logística real.
- Rate limit distribuído e camada completa de service/repository/log estruturado ainda são pendências antes de uso público com tráfego real.
- Confirmar configuração de e-mail/redirect de recuperação no Supabase. SMTP e confirmação dependem das configurações e limites do projeto Supabase.
