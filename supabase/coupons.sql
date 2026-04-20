-- supabase/coupons.sql
create table if not exists pawpalace_coupons (
  id              uuid primary key default uuid_generate_v4(),
  code            text unique not null,
  discount_type   text not null check (discount_type in ('percent', 'fixed')),
  discount_value  numeric(10,2) not null check (discount_value > 0),
  min_order_amount numeric(10,2) default 0,
  max_uses        int,
  used_count      int default 0,
  expires_at      timestamptz,
  is_active       boolean default true,
  created_at      timestamptz default now()
);

alter table pawpalace_coupons enable row level security;
create policy "coupons_read_active" on pawpalace_coupons for select
  using (is_active = true);
create policy "coupons_all_admin" on pawpalace_coupons for all
  using (
    exists (select 1 from pawpalace_profiles where id = auth.uid() and is_admin = true)
  );
