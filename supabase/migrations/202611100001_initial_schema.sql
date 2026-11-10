create extension if not exists pgcrypto;

create type public.user_role as enum ('CUSTOMER', 'ADMIN');
create type public.order_status as enum (
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED'
);
create type public.payment_status as enum ('PENDING', 'APPROVED', 'DECLINED', 'EXPIRED', 'REFUNDED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.user_role not null default 'CUSTOMER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'ADMIN'
  );
$$;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and new.role <> old.role and not public.is_admin() then
    raise exception using errcode = '42501', message = 'Profile role cannot be changed by this user.';
  end if;
  return new;
end;
$$;

create trigger protect_profile_role_before_update
  before update on public.profiles
  for each row execute procedure public.protect_profile_role();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  insert into public.carts (user_id) values (new.id);
  return new;
end;
$$;

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Casa',
  recipient text not null,
  postal_code text not null,
  street text not null,
  number text not null,
  complement text,
  neighborhood text not null,
  city text not null,
  state char(2) not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index addresses_one_default_per_user_idx
  on public.addresses (user_id)
  where is_default;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  slug text not null unique,
  isbn text unique,
  publisher text,
  publication_year integer check (publication_year between 1400 and 2200),
  synopsis text,
  description text,
  language text not null default 'Português',
  pages integer check (pages is null or pages > 0),
  cover_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.book_authors (
  book_id uuid not null references public.books(id) on delete cascade,
  author_id uuid not null references public.authors(id) on delete restrict,
  primary key (book_id, author_id)
);

create table public.book_categories (
  book_id uuid not null references public.books(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  primary key (book_id, category_id)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete restrict,
  sku text not null unique,
  format text not null default 'Capa comum',
  price_cents integer not null check (price_cents >= 0),
  compare_at_cents integer check (compare_at_cents is null or compare_at_cents >= price_cents),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  weight_grams integer not null default 300 check (weight_grams > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text not null,
  created_at timestamptz not null default now(),
  unique (book_id, user_id)
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('PERCENTAGE', 'FIXED')),
  discount_value integer not null check (
    discount_value > 0 and (discount_type <> 'PERCENTAGE' or discount_value <= 100)
  ),
  minimum_subtotal_cents integer not null default 0 check (minimum_subtotal_cents >= 0),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  order_number text not null unique,
  status public.order_status not null default 'PENDING_PAYMENT',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null check (shipping_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  coupon_code text,
  shipping_address jsonb not null,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  book_title text not null,
  variant_sku text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  line_total_cents integer not null check (line_total_cents >= 0)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  method text not null check (method in ('PIX', 'BOLETO', 'CARD')),
  status public.payment_status not null default 'PENDING',
  amount_cents integer not null check (amount_cents >= 0),
  simulated_reference text not null default ('SIM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  order_id uuid references public.orders(id) on delete restrict,
  quantity_change integer not null check (quantity_change <> 0),
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.wishlists (
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  previous_status public.order_status,
  new_status public.order_status not null,
  note text,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('book-covers', 'book-covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Book covers are publicly readable"
  on storage.objects for select
  using (bucket_id = 'book-covers');
create policy "Admins upload book covers"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'book-covers' and public.is_admin());
create policy "Admins update book covers"
  on storage.objects for update to authenticated
  using (bucket_id = 'book-covers' and public.is_admin())
  with check (bucket_id = 'book-covers' and public.is_admin());
create policy "Admins delete book covers"
  on storage.objects for delete to authenticated
  using (bucket_id = 'book-covers' and public.is_admin());

create index books_active_created_idx on public.books (active, created_at desc);
create index books_title_idx on public.books using gin (to_tsvector('simple', title));
create index variants_book_active_idx on public.product_variants (book_id, active);
create index variants_stock_idx on public.product_variants (stock_quantity) where active;
create index cart_items_cart_idx on public.cart_items (cart_id);
create index orders_user_created_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (status);

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, full_name)
select id, coalesce(raw_user_meta_data ->> 'full_name', '')
from auth.users
on conflict (id) do nothing;

insert into public.carts (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.authors enable row level security;
alter table public.books enable row level security;
alter table public.book_authors enable row level security;
alter table public.book_categories enable row level security;
alter table public.product_variants enable row level security;
alter table public.reviews enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.wishlists enable row level security;
alter table public.order_status_history enable row level security;

create policy "Public can read active catalog" on public.categories for select using (active);
create policy "Public can read authors" on public.authors for select using (true);
create policy "Public can read active books" on public.books for select using (active or public.is_admin());
create policy "Public can read book authors" on public.book_authors for select using (exists (select 1 from public.books b where b.id = book_id and b.active));
create policy "Public can read book categories" on public.book_categories for select using (exists (select 1 from public.books b where b.id = book_id and b.active));
create policy "Public can read active variants" on public.product_variants for select using (active or public.is_admin());
create policy "Public can read active coupons" on public.coupons for select using (active or public.is_admin());
create policy "Public can read reviews" on public.reviews for select using (true);
create policy "Users manage own profile" on public.profiles for select using (id = (select auth.uid()) or public.is_admin());
create policy "Users update own profile" on public.profiles for update using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "Users read own addresses" on public.addresses for select using (user_id = (select auth.uid()) or public.is_admin());
create policy "Users insert own addresses" on public.addresses for insert with check (user_id = (select auth.uid()));
create policy "Users update own addresses" on public.addresses for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Users delete own addresses" on public.addresses for delete using (user_id = (select auth.uid()));
create policy "Users read own carts" on public.carts for select using (user_id = (select auth.uid()) or public.is_admin());
create policy "Users update own carts" on public.carts for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Users read own cart items" on public.cart_items for select using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid())));
create policy "Users delete own cart items" on public.cart_items for delete using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid())));
create policy "Users read own orders" on public.orders for select using (user_id = (select auth.uid()) or public.is_admin());
create policy "Users read own order items" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.is_admin())));
create policy "Users read own payments" on public.payments for select using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.is_admin())));
create policy "Admins manage catalog" on public.books for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage authors" on public.authors for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage variants" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage book authors" on public.book_authors for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage book categories" on public.book_categories for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins read inventory" on public.inventory_movements for select using (public.is_admin());
create policy "Users read own wishlist" on public.wishlists for select using (user_id = (select auth.uid()));
create policy "Users manage own wishlist" on public.wishlists for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Users create own reviews" on public.reviews for insert with check (user_id = (select auth.uid()));
create policy "Users read order history" on public.order_status_history for select using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.is_admin())));

create or replace function public.checkout_order(
  p_shipping_cents integer,
  p_shipping_address jsonb,
  p_payment_method text,
  p_idempotency_key text,
  p_coupon_code text default null
)
returns table (order_id uuid, order_number text, payment_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_subtotal integer := 0;
  v_discount integer := 0;
  v_total integer;
  v_coupon public.coupons%rowtype;
  v_order_id uuid;
  v_order_number text;
  v_payment_id uuid;
  v_item record;
  v_existing public.orders%rowtype;
  v_weight integer := 0;
  v_expected_shipping integer;
  v_postal_code text;
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHORIZED';
  end if;
  if p_shipping_cents < 0 or p_shipping_cents > 100000 then
    raise exception using errcode = 'P0001', message = 'INVALID_SHIPPING';
  end if;
  if p_payment_method not in ('PIX', 'BOLETO', 'CARD') then
    raise exception using errcode = 'P0001', message = 'INVALID_PAYMENT_METHOD';
  end if;
  if p_idempotency_key is null or length(p_idempotency_key) not between 8 and 100 then
    raise exception using errcode = 'P0001', message = 'INVALID_IDEMPOTENCY_KEY';
  end if;
  select * into v_existing from public.orders
   where user_id = v_user_id and idempotency_key = p_idempotency_key;
  if found then
    select p.id into v_payment_id from public.payments p where p.order_id = v_existing.id;
    return query select v_existing.id, v_existing.order_number, v_payment_id;
    return;
  end if;
  if p_shipping_address is null or jsonb_typeof(p_shipping_address) <> 'object' then
    raise exception using errcode = 'P0001', message = 'INVALID_ADDRESS';
  end if;
  select id into v_cart_id from public.carts where user_id = v_user_id for update;
  select * into v_existing from public.orders
   where user_id = v_user_id and idempotency_key = p_idempotency_key;
  if found then
    select p.id into v_payment_id from public.payments p where p.order_id = v_existing.id;
    return query select v_existing.id, v_existing.order_number, v_payment_id;
    return;
  end if;
  if v_cart_id is null then
    raise exception using errcode = 'P0001', message = 'EMPTY_CART';
  end if;
  if not exists (select 1 from public.cart_items where cart_id = v_cart_id) then
    raise exception using errcode = 'P0001', message = 'EMPTY_CART';
  end if;

  for v_item in
    select ci.variant_id, ci.quantity, pv.sku, pv.price_cents, pv.stock_quantity, pv.weight_grams,
           pv.active as variant_active, b.title, b.active as book_active
      from public.cart_items ci
      join public.product_variants pv on pv.id = ci.variant_id
      join public.books b on b.id = pv.book_id
     where ci.cart_id = v_cart_id
     order by ci.variant_id
     for update of pv
  loop
    if not v_item.variant_active or not v_item.book_active then
      raise exception using errcode = 'P0001', message = 'BOOK_UNAVAILABLE';
    end if;
    if v_item.stock_quantity < v_item.quantity then
      raise exception using errcode = 'P0001', message = 'OUT_OF_STOCK';
    end if;
    v_subtotal := v_subtotal + (v_item.price_cents * v_item.quantity);
    v_weight := v_weight + (v_item.weight_grams * v_item.quantity);
  end loop;

  v_postal_code := regexp_replace(coalesce(p_shipping_address ->> 'postal_code', ''), '\D', '', 'g');
  if length(v_postal_code) <> 8 then
    raise exception using errcode = 'P0001', message = 'INVALID_ADDRESS';
  end if;
  v_expected_shipping := case
    when v_subtotal >= 15000 then 0
    else
      (case when substring(v_postal_code from 1 for 2)::integer between 1 and 19 then 1290 else 2190 end)
      + greatest(0, ceil(v_weight / 1000.0)::integer - 1) * 250
  end;
  if p_shipping_cents <> v_expected_shipping then
    raise exception using errcode = 'P0001', message = 'INVALID_SHIPPING';
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
     where code = upper(trim(p_coupon_code)) for update;
    if not found or not v_coupon.active or now() < v_coupon.valid_from
       or (v_coupon.valid_until is not null and now() > v_coupon.valid_until)
       or (v_coupon.usage_limit is not null and v_coupon.usage_count >= v_coupon.usage_limit) then
      raise exception using errcode = 'P0001', message = 'INVALID_COUPON';
    end if;
    if v_subtotal < v_coupon.minimum_subtotal_cents then
      raise exception using errcode = 'P0001', message = 'COUPON_MINIMUM_NOT_MET';
    end if;
    if v_coupon.discount_type = 'PERCENTAGE' then
      v_discount := least(v_subtotal, (v_subtotal * v_coupon.discount_value) / 100);
    else
      v_discount := least(v_subtotal, v_coupon.discount_value);
    end if;
  end if;

  v_total := greatest(0, v_subtotal + p_shipping_cents - v_discount);
  v_order_number := 'QA-' || to_char(now() at time zone 'UTC', 'YYYYMMDD') || '-' ||
                    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  insert into public.orders (
    user_id, order_number, subtotal_cents, shipping_cents, discount_cents,
    total_cents, coupon_code, shipping_address, idempotency_key
  ) values (
    v_user_id, v_order_number, v_subtotal, p_shipping_cents, v_discount,
    v_total, nullif(upper(trim(p_coupon_code)), ''), p_shipping_address, p_idempotency_key
  ) returning id into v_order_id;

  for v_item in
    select ci.variant_id, ci.quantity, pv.sku, pv.price_cents, b.title
      from public.cart_items ci
      join public.product_variants pv on pv.id = ci.variant_id
      join public.books b on b.id = pv.book_id
     where ci.cart_id = v_cart_id
     order by ci.variant_id
  loop
    update public.product_variants
       set stock_quantity = stock_quantity - v_item.quantity
     where id = v_item.variant_id and stock_quantity >= v_item.quantity;
    if not found then
      raise exception using errcode = 'P0001', message = 'OUT_OF_STOCK';
    end if;
    insert into public.order_items (
      order_id, variant_id, book_title, variant_sku, quantity, unit_price_cents, line_total_cents
    ) values (
      v_order_id, v_item.variant_id, v_item.title, v_item.sku, v_item.quantity,
      v_item.price_cents, v_item.price_cents * v_item.quantity
    );
    insert into public.inventory_movements (variant_id, order_id, quantity_change, reason)
    values (v_item.variant_id, v_order_id, -v_item.quantity, 'CHECKOUT');
  end loop;

  insert into public.payments (order_id, method, amount_cents)
  values (v_order_id, p_payment_method, v_total) returning id into v_payment_id;
  insert into public.order_status_history (order_id, new_status, note)
  values (v_order_id, 'PENDING_PAYMENT', 'Pedido criado; pagamento simulado pendente.');
  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    update public.coupons set usage_count = usage_count + 1 where id = v_coupon.id;
  end if;
  delete from public.cart_items where cart_id = v_cart_id;

  return query select v_order_id, v_order_number, v_payment_id;
end;
$$;

grant execute on function public.checkout_order(integer, jsonb, text, text, text) to authenticated;

create or replace function public.add_cart_item(p_variant_id uuid, p_quantity integer)
returns table (item_id uuid, quantity integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_stock integer;
  v_item_id uuid;
  v_quantity integer;
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHORIZED';
  end if;
  if p_quantity not between 1 and 99 then
    raise exception using errcode = 'P0001', message = 'INVALID_QUANTITY';
  end if;
  select id into v_cart_id from public.carts where user_id = v_user_id for update;
  if v_cart_id is null then
    raise exception using errcode = 'P0001', message = 'CART_NOT_FOUND';
  end if;
  select pv.stock_quantity into v_stock
    from public.product_variants pv
    join public.books b on b.id = pv.book_id
   where pv.id = p_variant_id and pv.active and b.active
   for update of pv;
  if not found then
    raise exception using errcode = 'P0001', message = 'BOOK_NOT_FOUND';
  end if;
  select ci.id, ci.quantity into v_item_id, v_quantity
    from public.cart_items ci
   where ci.cart_id = v_cart_id and ci.variant_id = p_variant_id;
  v_quantity := coalesce(v_quantity, 0) + p_quantity;
  if v_stock < v_quantity then
    raise exception using errcode = 'P0001', message = 'OUT_OF_STOCK';
  end if;
  if v_quantity > 99 then
    raise exception using errcode = 'P0001', message = 'INVALID_QUANTITY';
  end if;
  insert into public.cart_items (cart_id, variant_id, quantity)
  values (v_cart_id, p_variant_id, v_quantity)
  on conflict (cart_id, variant_id) do update set quantity = excluded.quantity
  returning id into v_item_id;
  update public.carts set updated_at = now() where id = v_cart_id;
  return query select v_item_id, v_quantity;
end;
$$;

grant execute on function public.add_cart_item(uuid, integer) to authenticated;

create or replace function public.set_cart_item_quantity(p_item_id uuid, p_quantity integer)
returns public.cart_items
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_variant_id uuid;
  v_stock integer;
  v_item public.cart_items%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'UNAUTHORIZED';
  end if;
  if p_quantity not between 1 and 99 then
    raise exception using errcode = 'P0001', message = 'INVALID_QUANTITY';
  end if;
  select id into v_cart_id from public.carts where user_id = v_user_id for update;
  select variant_id into v_variant_id
    from public.cart_items
   where id = p_item_id and cart_id = v_cart_id;
  if not found then
    raise exception using errcode = 'P0001', message = 'CART_ITEM_NOT_FOUND';
  end if;
  select stock_quantity into v_stock
    from public.product_variants
   where id = v_variant_id and active
   for update;
  if not found or v_stock < p_quantity then
    raise exception using errcode = 'P0001', message = 'OUT_OF_STOCK';
  end if;
  update public.cart_items
     set quantity = p_quantity
   where id = p_item_id and cart_id = v_cart_id
   returning * into v_item;
  update public.carts set updated_at = now() where id = v_cart_id;
  return v_item;
end;
$$;

grant execute on function public.set_cart_item_quantity(uuid, integer) to authenticated;

create or replace function public.simulate_payment(p_payment_id uuid, p_result text)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
  v_order public.orders%rowtype;
  v_status public.payment_status;
  v_order_status public.order_status;
begin
  if not public.is_admin() then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN';
  end if;
  if p_result not in ('APPROVED', 'DECLINED', 'EXPIRED') then
    raise exception using errcode = 'P0001', message = 'INVALID_PAYMENT_RESULT';
  end if;
  select * into v_payment from public.payments where id = p_payment_id;
  if not found then
    raise exception using errcode = 'P0001', message = 'PAYMENT_NOT_FOUND';
  end if;
  select * into v_order from public.orders where id = v_payment.order_id for update;
  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'PAYMENT_NOT_FOUND';
  end if;
  if v_payment.status <> 'PENDING' then
    raise exception using errcode = 'P0001', message = 'INVALID_PAYMENT_STATUS';
  end if;
  v_status := p_result::public.payment_status;
  v_order_status := case when p_result = 'APPROVED' then 'PAID'::public.order_status else 'CANCELLED'::public.order_status end;
  update public.payments set status = v_status, updated_at = now() where id = p_payment_id returning * into v_payment;
  update public.orders set status = v_order_status, updated_at = now() where id = v_order.id;
  insert into public.order_status_history (order_id, previous_status, new_status, note)
  values (v_order.id, v_order.status, v_order_status, 'Atualização via simulador de pagamento.');
  if p_result <> 'APPROVED' then
    update public.product_variants pv
       set stock_quantity = pv.stock_quantity + oi.quantity
      from public.order_items oi
     where oi.order_id = v_order.id and pv.id = oi.variant_id;
    insert into public.inventory_movements (variant_id, order_id, quantity_change, reason)
      select variant_id, v_order.id, quantity, 'PAYMENT_' || p_result
        from public.order_items where order_id = v_order.id;
  end if;
  return v_payment;
end;
$$;

grant execute on function public.simulate_payment(uuid, text) to authenticated;

create or replace function public.transition_order(p_order_id uuid, p_new_status text)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_previous_status public.order_status;
  v_new_status public.order_status;
begin
  if not public.is_admin() then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN';
  end if;
  begin
    v_new_status := p_new_status::public.order_status;
  exception when invalid_text_representation then
    raise exception using errcode = 'P0001', message = 'INVALID_ORDER_STATUS';
  end;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'ORDER_NOT_FOUND';
  end if;
  if not (
    (v_order.status = 'PAID' and v_new_status in ('PROCESSING', 'CANCELLED')) or
    (v_order.status = 'PROCESSING' and v_new_status in ('SHIPPED', 'CANCELLED')) or
    (v_order.status = 'SHIPPED' and v_new_status = 'DELIVERED')
  ) then
    raise exception using errcode = 'P0001', message = 'INVALID_ORDER_STATUS';
  end if;
  v_previous_status := v_order.status;
  update public.orders
     set status = v_new_status, updated_at = now()
   where id = p_order_id returning * into v_order;
  insert into public.order_status_history (order_id, previous_status, new_status, note)
  values (p_order_id, v_previous_status, v_new_status, 'Atualização administrativa.');
  if v_new_status = 'CANCELLED' then
    update public.product_variants pv
       set stock_quantity = pv.stock_quantity + oi.quantity
      from public.order_items oi
     where oi.order_id = p_order_id and pv.id = oi.variant_id;
    insert into public.inventory_movements (variant_id, order_id, quantity_change, reason)
      select variant_id, p_order_id, quantity, 'ORDER_CANCELLED'
        from public.order_items where order_id = p_order_id;
    update public.payments set status = 'REFUNDED', updated_at = now()
     where order_id = p_order_id and status = 'APPROVED';
  end if;
  return v_order;
end;
$$;

grant execute on function public.transition_order(uuid, text) to authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.authors, public.books, public.book_authors,
  public.book_categories, public.product_variants, public.reviews, public.coupons
  to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

revoke all on function public.checkout_order(integer, jsonb, text, text, text) from public, anon;
revoke all on function public.add_cart_item(uuid, integer) from public, anon;
revoke all on function public.set_cart_item_quantity(uuid, integer) from public, anon;
revoke all on function public.simulate_payment(uuid, text) from public, anon;
revoke all on function public.transition_order(uuid, text) from public, anon;
