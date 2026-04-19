-- ============================================
-- PAW PALACE DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- ============================================

create extension if not exists "uuid-ossp";

-- 1. ANIMAL CATEGORIES (대분류)
create table if not exists pawpalace_animal_categories (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  emoji       text,
  image_url   text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- 2. PRODUCT CATEGORIES (소분류)
create table if not exists pawpalace_product_categories (
  id                  uuid primary key default uuid_generate_v4(),
  animal_category_id  uuid references pawpalace_animal_categories(id) on delete cascade,
  slug                text unique not null,
  name                text not null,
  sort_order          int default 0,
  created_at          timestamptz default now()
);

-- 3. PRODUCTS
create table if not exists pawpalace_products (
  id                    uuid primary key default uuid_generate_v4(),
  animal_category_id    uuid references pawpalace_animal_categories(id),
  product_category_id   uuid references pawpalace_product_categories(id),
  name                  text not null,
  slug                  text unique not null,
  description           text,
  price                 numeric(10,2) not null check (price >= 0),
  original_price        numeric(10,2) check (original_price >= 0),
  stock                 int not null default 0 check (stock >= 0),
  images                text[] default '{}',
  badge                 text check (badge in ('new','sale','bestseller','limited')),
  tags                  text[] default '{}',
  is_active             boolean default true,
  free_shipping         boolean default false,
  stripe_price_id       text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- 4. PROFILES (auth.users 확장)
create table if not exists pawpalace_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  phone       text,
  address     jsonb,
  is_admin    boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 5. ORDERS
create table if not exists pawpalace_orders (
  id                          uuid primary key default uuid_generate_v4(),
  user_id                     uuid references pawpalace_profiles(id),
  status                      text not null default 'pending'
                                check (status in ('pending','paid','shipping','delivered','cancelled','refunded')),
  total_amount                numeric(10,2) not null,
  stripe_session_id           text unique,
  stripe_payment_intent_id    text,
  shipping_address            jsonb,
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now()
);

-- 6. ORDER ITEMS
create table if not exists pawpalace_order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid references pawpalace_orders(id) on delete cascade,
  product_id  uuid references pawpalace_products(id),
  quantity    int not null check (quantity > 0),
  unit_price  numeric(10,2) not null,
  created_at  timestamptz default now()
);

-- TRIGGERS: updated_at 자동 갱신
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_products_updated_at
  before update on pawpalace_products
  for each row execute function update_updated_at();

create trigger trg_orders_updated_at
  before update on pawpalace_orders
  for each row execute function update_updated_at();

-- RPC: 재고 차감 (원자적)
create or replace function decrement_stock(product_id uuid, qty int)
returns void as $$
begin
  update pawpalace_products
  set stock = stock - qty
  where id = product_id and stock >= qty;
  if not found then
    raise exception 'insufficient stock for product %', product_id;
  end if;
end;
$$ language plpgsql security definer;

-- TRIGGER: 신규 유저 → 프로필 자동 생성
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into pawpalace_profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS POLICIES
alter table pawpalace_products enable row level security;
create policy "products_read_all" on pawpalace_products for select using (true);
create policy "products_write_admin" on pawpalace_products for all
  using (exists (select 1 from pawpalace_profiles where id = auth.uid() and is_admin = true));

alter table pawpalace_animal_categories enable row level security;
create policy "animal_categories_read_all" on pawpalace_animal_categories for select using (true);
create policy "animal_categories_write_admin" on pawpalace_animal_categories for all
  using (exists (select 1 from pawpalace_profiles where id = auth.uid() and is_admin = true));

alter table pawpalace_product_categories enable row level security;
create policy "product_categories_read_all" on pawpalace_product_categories for select using (true);
create policy "product_categories_write_admin" on pawpalace_product_categories for all
  using (exists (select 1 from pawpalace_profiles where id = auth.uid() and is_admin = true));

alter table pawpalace_profiles enable row level security;
create policy "profiles_read_own" on pawpalace_profiles for select
  using (id = auth.uid() or exists (select 1 from pawpalace_profiles where id = auth.uid() and is_admin = true));
create policy "profiles_update_own" on pawpalace_profiles for update
  using (id = auth.uid());

alter table pawpalace_orders enable row level security;
create policy "orders_read_own" on pawpalace_orders for select
  using (user_id = auth.uid() or exists (select 1 from pawpalace_profiles where id = auth.uid() and is_admin = true));
create policy "orders_insert_own" on pawpalace_orders for insert
  with check (user_id = auth.uid());
create policy "orders_update_admin" on pawpalace_orders for update
  using (exists (select 1 from pawpalace_profiles where id = auth.uid() and is_admin = true));

alter table pawpalace_order_items enable row level security;
create policy "order_items_read_own" on pawpalace_order_items for select
  using (
    exists (
      select 1 from pawpalace_orders
      where id = order_id
        and (user_id = auth.uid() or
          exists (select 1 from pawpalace_profiles where id = auth.uid() and is_admin = true))
    )
  );
create policy "order_items_insert_own" on pawpalace_order_items for insert
  with check (
    exists (
      select 1 from pawpalace_orders
      where id = order_id and user_id = auth.uid()
    )
  );

-- SEED: 초기 카테고리
insert into pawpalace_animal_categories (slug, name, emoji, sort_order) values
  ('dog',       '강아지', '🐕', 1),
  ('cat',       '고양이', '🐈', 2),
  ('bird',      '조류',   '🦜', 3),
  ('fish',      '어류',   '🐠', 4),
  ('small-pet', '소동물', '🐹', 5)
on conflict (slug) do nothing;

insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'dog-food',     '사료 & 간식', 1 from pawpalace_animal_categories where slug = 'dog' on conflict (slug) do nothing;
insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'dog-toys',     '장난감',      2 from pawpalace_animal_categories where slug = 'dog' on conflict (slug) do nothing;
insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'dog-beds',     '침대 & 가구', 3 from pawpalace_animal_categories where slug = 'dog' on conflict (slug) do nothing;
insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'dog-grooming', '미용 & 위생', 4 from pawpalace_animal_categories where slug = 'dog' on conflict (slug) do nothing;

insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'cat-food',  '사료 & 간식',  1 from pawpalace_animal_categories where slug = 'cat' on conflict (slug) do nothing;
insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'cat-toys',  '장난감',        2 from pawpalace_animal_categories where slug = 'cat' on conflict (slug) do nothing;
insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'cat-beds',  '침대 & 캣타워', 3 from pawpalace_animal_categories where slug = 'cat' on conflict (slug) do nothing;
insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'cat-litter','모래 & 화장실', 4 from pawpalace_animal_categories where slug = 'cat' on conflict (slug) do nothing;
