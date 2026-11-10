insert into public.categories (name, slug, description) values
  ('Ficção', 'ficcao', 'Histórias para explorar novos mundos.'),
  ('Desenvolvimento pessoal', 'desenvolvimento-pessoal', 'Leituras para aprender e evoluir.'),
  ('Tecnologia', 'tecnologia', 'Conhecimento prático sobre tecnologia.'),
  ('Negócios', 'negocios', 'Ideias para projetos e organizações.'),
  ('Infantil', 'infantil', 'Livros para leitores em formação.')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

insert into public.authors (name, slug) values
  ('Ana Ribeiro', 'ana-ribeiro'), ('Caio Martins', 'caio-martins'),
  ('Lia Fernandes', 'lia-fernandes'), ('Rui Carvalho', 'rui-carvalho'),
  ('Bia Azevedo', 'bia-azevedo'), ('Nuno Costa', 'nuno-costa'),
  ('Cora Lima', 'cora-lima'), ('Ivo Barros', 'ivo-barros')
on conflict (slug) do nothing;

do $seed$
#variable_conflict use_variable
declare
  titles text[] := array[
    'A Cidade das Janelas Azuis', 'O Jardim Depois da Chuva', 'Pequeno Atlas das Ideias',
    'Código para Dias Melhores', 'A Ponte de Papel', 'Conversas que Constroem',
    'O Mapa das Pequenas Coragens', 'Fundamentos de Dados Abertos', 'Rotinas com Intenção',
    'A Oficina de Nuvens', 'O Último Farol do Vale', 'Princípios de Produto Digital',
    'Janelas para o Amanhã', 'Aprender em Ciclos', 'Sistemas que Fazem Sentido',
    'A Casa das Três Estações', 'Histórias de Um Grão de Areia', 'Ofício de Empreender',
    'Caderno de Perguntas Boas', 'A Biblioteca do Vento', 'Práticas de Segurança Web',
    'O Clube dos Inventores', 'Finanças para Projetos Reais', 'A Estrada das Lanternas',
    'Tempo para o Essencial', 'Interfaces que Incluem', 'O Barco de Pano Verde',
    'Liderança em Construção', 'O Arquivo das Marés', 'Escrever para Organizar Ideias',
    'APIs para Equipes Pequenas', 'Uma Estrela no Quintal', 'Estratégia sem Atalhos',
    'O Relógio de Areia Clara', 'Hábitos para Aprender Melhor', 'Observabilidade no Dia a Dia',
    'A Menina e o Rio Curioso', 'Times que Compartilham', 'A Cidade das Janelas Azuis - Edição de Bolso',
    'Manual de Projetos Pacientes'
  ];
  authors text[] := array[
    'ana-ribeiro', 'caio-martins', 'lia-fernandes', 'rui-carvalho',
    'bia-azevedo', 'nuno-costa', 'cora-lima', 'ivo-barros'
  ];
  categories text[] := array[
    'ficcao', 'ficcao', 'desenvolvimento-pessoal', 'tecnologia', 'infantil',
    'negocios', 'ficcao', 'tecnologia', 'desenvolvimento-pessoal', 'infantil',
    'ficcao', 'negocios', 'ficcao', 'desenvolvimento-pessoal', 'tecnologia',
    'ficcao', 'infantil', 'negocios', 'desenvolvimento-pessoal', 'ficcao',
    'tecnologia', 'infantil', 'negocios', 'ficcao', 'desenvolvimento-pessoal',
    'tecnologia', 'infantil', 'negocios', 'ficcao', 'desenvolvimento-pessoal',
    'tecnologia', 'infantil', 'negocios', 'ficcao', 'desenvolvimento-pessoal',
    'tecnologia', 'infantil', 'negocios', 'ficcao', 'negocios'
  ];
  prices integer[] := array[
    4290,3590,2490,6890,1990,5490,3990,8990,3290,2890,
    4590,12990,3790,2790,7590,4990,1590,6290,2190,4190,
    9990,3190,8490,3890,2990,7190,1790,5790,4490,2590,
    9290,2290,6790,3690,3190,10990,2790,5890,1490,18900
  ];
  stock integer[] := array[
    80,1,120,40,60,32,45,25,75,0,18,22,54,90,35,21,100,28,70,0,
    16,48,30,42,57,19,83,34,26,62,14,50,17,39,44,12,67,23,95,8
  ];
  category_id uuid;
  author_id uuid;
  book_id uuid;
  book_slug text;
  isbn_base text;
  isbn text;
  isbn_sum integer;
  isbn_check integer;
  digit_position integer;
  i integer;
begin
  for i in 1..array_length(titles, 1) loop
    book_slug := 'fixture-livro-' || lpad(i::text, 2, '0');
    isbn_base := '978000000' || lpad(i::text, 3, '0');
    isbn_sum := 0;
    for digit_position in 1..12 loop
      isbn_sum := isbn_sum + substring(isbn_base from digit_position for 1)::integer
        * case when digit_position % 2 = 0 then 3 else 1 end;
    end loop;
    isbn_check := (10 - isbn_sum % 10) % 10;
    isbn := isbn_base || isbn_check::text;
    insert into public.books (
      title, slug, isbn, publisher, publication_year, synopsis,
      description, pages, active
    ) values (
      titles[i],
      book_slug,
      isbn,
      'Editora Livraria QA',
      2024,
      'Obra fictícia criada para exercitar pesquisa, navegação e cenários de teste.',
      'Conteúdo demonstrativo original para treinamento de automação de qualidade.',
      120 + i,
      i <> 20
    )
    on conflict (slug) do update set
      title = excluded.title,
      synopsis = excluded.synopsis,
      description = excluded.description,
      active = excluded.active
    returning id into book_id;

    select id into author_id from public.authors where slug = authors[((i - 1) % 8) + 1];
    select id into category_id from public.categories where slug = categories[i];
    insert into public.book_authors (book_id, author_id) values (book_id, author_id)
      on conflict do nothing;
    insert into public.book_categories (book_id, category_id) values (book_id, category_id)
      on conflict do nothing;
    insert into public.product_variants (
      book_id, sku, format, price_cents, compare_at_cents, stock_quantity, weight_grams
    ) values (
      book_id,
      'QA-LIVRO-' || lpad(i::text, 3, '0'),
      'Capa comum',
      prices[i],
      case when i = 4 then prices[i] + 1500 else null end,
      stock[i],
      300
    )
    on conflict (sku) do nothing;
  end loop;

  select id into book_id from public.books where slug = 'fixture-livro-01';
  insert into public.product_variants (book_id, sku, format, price_cents, stock_quantity, weight_grams)
  values (book_id, 'QA-LIVRO-001-HC', 'Capa dura', 6990, 12, 550)
  on conflict (sku) do nothing;
end
$seed$;

insert into public.coupons (
  code, discount_type, discount_value, minimum_subtotal_cents,
  valid_until, usage_limit, usage_count, active
)
values
  ('BEMVINDO10', 'PERCENTAGE', 10, 5000, now() + interval '1 year', 1000, 0, true),
  ('FIXO500', 'FIXED', 500, 3000, now() + interval '1 year', null, 0, true),
  ('QAEXPIRADO', 'PERCENTAGE', 15, 0, now() - interval '1 day', null, 0, true),
  ('QAINATIVO', 'FIXED', 1000, 0, now() + interval '1 year', null, 0, false),
  ('QALIMITADO', 'PERCENTAGE', 5, 0, now() + interval '1 year', 1, 1, true)
on conflict (code) do nothing;
