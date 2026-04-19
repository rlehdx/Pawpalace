# Phase 2: Supabase + Stripe 백엔드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supabase DB 스키마(대분류→소분류→상품, 회원, 주문) 설계 및 연동, Supabase Auth 기반 회원가입/로그인, Stripe Checkout + Webhook 구현, 재고 차감 트랜잭션.

**Architecture:** Next.js App Router의 Server Components에서 Supabase SSR client로 데이터 페칭. API Routes (`app/api/`)에서 Stripe Checkout Session 생성 및 Webhook 수신. 재고 차감은 Webhook `payment_intent.succeeded` 이벤트에서 Supabase RPC 함수로 원자적 처리. RLS로 고객은 본인 데이터만 접근, 관리자는 `is_admin` 플래그로 모든 테이블 접근.

**Tech Stack:** Next.js 14, Supabase JS v2 (`@supabase/ssr`, `@supabase/supabase-js`), Stripe JS v14 (`stripe`, `@stripe/stripe-js`), TypeScript 5

---

## File Map

| 작업 | 파일 |
|------|------|
| Create | `.env.local` — 환경 변수 템플릿 |
| Create | `supabase/schema.sql` — 전체 DB 스키마 + RLS |
| Create | `lib/supabase/client.ts` — 브라우저용 클라이언트 |
| Create | `lib/supabase/server.ts` — 서버 컴포넌트용 클라이언트 |
| Create | `lib/supabase/middleware.ts` — 세션 갱신 미들웨어 |
| Create | `middleware.ts` — Next.js 미들웨어 (auth 보호) |
| Create | `lib/types-db.ts` — DB에서 생성된 TypeScript 타입 |
| Create | `app/api/checkout/route.ts` — Stripe Checkout Session 생성 |
| Create | `app/api/webhooks/stripe/route.ts` — Stripe Webhook 처리 |
| Create | `app/(auth)/login/page.tsx` — 로그인 페이지 |
| Create | `app/(auth)/signup/page.tsx` — 회원가입 페이지 |
| Create | `app/(auth)/layout.tsx` — Auth 레이아웃 |
| Create | `app/checkout/success/page.tsx` — 결제 완료 페이지 |
| Create | `app/checkout/cancel/page.tsx` — 결제 취소/실패 페이지 |
| Modify | `lib/types.ts` — DB 연동 타입 확장 |
| Modify | `lib/cart.ts` — createCheckoutSession에 auth 연동 |
| Modify | `app/layout.tsx` — Supabase 세션 Provider |

---

### Task 1: 패키지 설치 및 환경 변수 설정

**Files:**
- Create: `.env.local`

- [ ] **Step 1: 필요 패키지 설치**

```bash
cd "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" && npm install @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js
```
Expected: `added X packages`

- [ ] **Step 2: .env.local 파일 생성 (실제 키로 채워야 함)**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **중요:** Supabase 대시보드 → Settings → API에서 URL과 anon key 복사. Stripe 대시보드 → Developers → API keys에서 복사.

- [ ] **Step 3: .gitignore에 .env.local 확인**

```bash
grep -n ".env" "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main/.gitignore" || echo ".env.local" >> "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main/.gitignore"
```

- [ ] **Step 4: Commit**

```bash
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add package.json package-lock.json .gitignore
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "chore: install supabase, stripe packages"
```

---

### Task 2: Supabase DB 스키마 작성

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: 전체 스키마 SQL 작성**

```sql
-- supabase/schema.sql
-- ============================================
-- PAW PALACE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. ANIMAL CATEGORIES (대분류)
-- ============================================
create table if not exists pawpalace_animal_categories (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  emoji       text,
  image_url   text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- ============================================
-- 2. PRODUCT CATEGORIES (소분류)
-- ============================================
create table if not exists pawpalace_product_categories (
  id                  uuid primary key default uuid_generate_v4(),
  animal_category_id  uuid references pawpalace_animal_categories(id) on delete cascade,
  slug                text unique not null,
  name                text not null,
  sort_order          int default 0,
  created_at          timestamptz default now()
);

-- ============================================
-- 3. PRODUCTS
-- ============================================
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

-- ============================================
-- 4. PROFILES (auth.users 확장)
-- ============================================
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

-- ============================================
-- 5. ORDERS
-- ============================================
create table if not exists pawpalace_orders (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references pawpalace_profiles(id),
  status          text not null default 'pending'
                    check (status in ('pending','paid','shipping','delivered','cancelled','refunded')),
  total_amount    numeric(10,2) not null,
  stripe_session_id   text unique,
  stripe_payment_intent_id text,
  shipping_address    jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ============================================
-- 6. ORDER ITEMS
-- ============================================
create table if not exists pawpalace_order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid references pawpalace_orders(id) on delete cascade,
  product_id  uuid references pawpalace_products(id),
  quantity    int not null check (quantity > 0),
  unit_price  numeric(10,2) not null,
  created_at  timestamptz default now()
);

-- ============================================
-- TRIGGERS: updated_at 자동 갱신
-- ============================================
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

-- ============================================
-- RPC: 재고 차감 (원자적)
-- ============================================
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

-- ============================================
-- TRIGGER: 신규 유저 → 프로필 자동 생성
-- ============================================
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

-- ============================================
-- RLS POLICIES
-- ============================================

-- Products: 전체 읽기 허용, 수정은 관리자만
alter table pawpalace_products enable row level security;
create policy "products_read_all" on pawpalace_products for select using (true);
create policy "products_write_admin" on pawpalace_products for all
  using (
    exists (
      select 1 from pawpalace_profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Animal categories: 전체 읽기
alter table pawpalace_animal_categories enable row level security;
create policy "animal_categories_read_all" on pawpalace_animal_categories for select using (true);
create policy "animal_categories_write_admin" on pawpalace_animal_categories for all
  using (
    exists (select 1 from pawpalace_profiles where id = auth.uid() and is_admin = true)
  );

-- Product categories: 전체 읽기
alter table pawpalace_product_categories enable row level security;
create policy "product_categories_read_all" on pawpalace_product_categories for select using (true);
create policy "product_categories_write_admin" on pawpalace_product_categories for all
  using (
    exists (select 1 from pawpalace_profiles where id = auth.uid() and is_admin = true)
  );

-- Profiles: 본인만 읽기/수정, 관리자는 전체
alter table pawpalace_profiles enable row level security;
create policy "profiles_read_own" on pawpalace_profiles for select
  using (id = auth.uid() or exists (select 1 from pawpalace_profiles where id = auth.uid() and is_admin = true));
create policy "profiles_update_own" on pawpalace_profiles for update
  using (id = auth.uid());

-- Orders: 본인 주문만, 관리자는 전체
alter table pawpalace_orders enable row level security;
create policy "orders_read_own" on pawpalace_orders for select
  using (user_id = auth.uid() or exists (select 1 from pawpalace_profiles where id = auth.uid() and is_admin = true));
create policy "orders_insert_own" on pawpalace_orders for insert
  with check (user_id = auth.uid());
create policy "orders_update_admin" on pawpalace_orders for update
  using (exists (select 1 from pawpalace_profiles where id = auth.uid() and is_admin = true));

-- Order items: 본인 주문의 아이템만
alter table pawpalace_order_items enable row level security;
create policy "order_items_read_own" on pawpalace_order_items for select
  using (
    exists (
      select 1 from pawpalace_orders
      where id = order_id and (user_id = auth.uid() or
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

-- ============================================
-- SEED: 초기 카테고리 데이터
-- ============================================
insert into pawpalace_animal_categories (slug, name, emoji, sort_order) values
  ('dog',       '강아지', '🐕', 1),
  ('cat',       '고양이', '🐈', 2),
  ('bird',      '조류',   '🦜', 3),
  ('fish',      '어류',   '🐠', 4),
  ('small-pet', '소동물', '🐹', 5)
on conflict (slug) do nothing;

-- 강아지 소분류
insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'dog-food',     '사료 & 간식', 1 from pawpalace_animal_categories where slug = 'dog'
on conflict (slug) do nothing;
insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'dog-toys',     '장난감',       2 from pawpalace_animal_categories where slug = 'dog'
on conflict (slug) do nothing;
insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'dog-beds',     '침대 & 가구',  3 from pawpalace_animal_categories where slug = 'dog'
on conflict (slug) do nothing;
insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'dog-grooming', '미용 & 위생',  4 from pawpalace_animal_categories where slug = 'dog'
on conflict (slug) do nothing;

-- 고양이 소분류
insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'cat-food',  '사료 & 간식', 1 from pawpalace_animal_categories where slug = 'cat'
on conflict (slug) do nothing;
insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'cat-toys',  '장난감',       2 from pawpalace_animal_categories where slug = 'cat'
on conflict (slug) do nothing;
insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'cat-beds',  '침대 & 캣타워', 3 from pawpalace_animal_categories where slug = 'cat'
on conflict (slug) do nothing;
insert into pawpalace_product_categories (animal_category_id, slug, name, sort_order)
select id, 'cat-litter','모래 & 화장실', 4 from pawpalace_animal_categories where slug = 'cat'
on conflict (slug) do nothing;
```

- [ ] **Step 2: Supabase SQL Editor에서 실행**

> Supabase 대시보드 → SQL Editor → 위 SQL 전체 붙여넣기 → Run

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add supabase/
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add supabase schema with RLS policies and seed data"
```

---

### Task 3: Supabase 클라이언트 설정

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `middleware.ts`

- [ ] **Step 1: 브라우저용 클라이언트 작성**

```ts
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: 서버 컴포넌트용 클라이언트 작성**

```ts
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
```

- [ ] **Step 3: Next.js 미들웨어 작성 (세션 갱신 + /admin 보호)**

```ts
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // /admin 접근 시 관리자 확인
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const { data: profile } = await supabase
      .from("pawpalace_profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 인증 필요 페이지
  if (request.nextUrl.pathname.startsWith("/account") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
```

- [ ] **Step 4: TypeScript 검증**

```bash
cd "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add lib/supabase/ middleware.ts
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add supabase client helpers and auth middleware"
```

---

### Task 4: 회원가입 / 로그인 페이지

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/signup/page.tsx`

- [ ] **Step 1: Auth 레이아웃 작성**

```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="font-display text-3xl font-bold text-slate-900">
            Paw<span className="text-amber-500">Palace</span>
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 로그인 페이지 작성**

```tsx
// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast({ type: "error", title: "로그인 실패", message: "이메일 또는 비밀번호를 확인해주세요." });
      return;
    }
    toast({ type: "success", title: "로그인 성공" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-3xl shadow-card p-8">
      <h1 className="font-display text-2xl font-bold text-slate-900 mb-6">로그인</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">이메일</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
            placeholder="hello@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">비밀번호</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
          로그인
        </Button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-6">
        계정이 없으신가요?{" "}
        <a href="/signup" className="text-amber-600 font-semibold hover:underline">회원가입</a>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: 회원가입 페이지 작성**

```tsx
// app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast({ type: "warning", title: "비밀번호는 8자 이상이어야 합니다." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);

    if (error) {
      toast({ type: "error", title: "회원가입 실패", message: error.message });
      return;
    }
    toast({ type: "success", title: "회원가입 완료", message: "이메일을 확인해주세요." });
    router.push("/login");
  }

  return (
    <div className="bg-white rounded-3xl shadow-card p-8">
      <h1 className="font-display text-2xl font-bold text-slate-900 mb-6">회원가입</h1>
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">이름</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
            placeholder="홍길동"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">이메일</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
            placeholder="hello@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">비밀번호 (8자 이상)</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
          가입하기
        </Button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-6">
        이미 계정이 있으신가요?{" "}
        <a href="/login" className="text-amber-600 font-semibold hover:underline">로그인</a>
      </p>
    </div>
  );
}
```

- [ ] **Step 4: TypeScript 검증 및 Commit**

```bash
cd "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" && npx tsc --noEmit 2>&1 | head -20
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add app/\(auth\)/
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add login and signup pages with Supabase Auth"
```

---

### Task 5: Stripe Checkout API Route

**Files:**
- Create: `app/api/checkout/route.ts`

- [ ] **Step 1: Checkout Session 생성 API 작성**

```ts
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export async function POST(request: NextRequest) {
  // 인증 확인
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let items: CheckoutItem[];
  try {
    const body = await request.json() as { items: CheckoutItem[] };
    items = body.items;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "장바구니가 비어있습니다." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            metadata: { productId: item.productId },
          },
          unit_amount: Math.round(item.price * 100), // cents
        },
        quantity: item.quantity,
      })),
      metadata: {
        userId: user.id,
        items: JSON.stringify(items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        }))),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "결제 세션 생성에 실패했습니다." }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add app/api/checkout/
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add Stripe checkout session API route"
```

---

### Task 6: Stripe Webhook 처리

**Files:**
- Create: `app/api/webhooks/stripe/route.ts`

- [ ] **Step 1: Webhook 핸들러 작성**

```ts
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Webhook 핸들러는 service role 사용 (RLS 우회)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const itemsRaw = session.metadata?.items;

  if (!userId || !itemsRaw) {
    console.error("Missing metadata in session:", session.id);
    return;
  }

  const items = JSON.parse(itemsRaw) as Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // 1. 주문 생성
  const { data: order, error: orderError } = await supabaseAdmin
    .from("pawpalace_orders")
    .insert({
      user_id: userId,
      status: "paid",
      total_amount: totalAmount,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("Failed to create order:", orderError);
    return;
  }

  // 2. 주문 아이템 생성
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.price,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from("pawpalace_order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Failed to create order items:", itemsError);
    return;
  }

  // 3. 재고 차감 (원자적 RPC)
  for (const item of items) {
    const { error: stockError } = await supabaseAdmin.rpc("decrement_stock", {
      product_id: item.productId,
      qty: item.quantity,
    });
    if (stockError) {
      console.error(`Failed to decrement stock for ${item.productId}:`, stockError);
    }
  }

  console.log(`Order ${order.id} created successfully for session ${session.id}`);
}
```

> **중요:** Webhook 로컬 테스트는 `stripe listen --forward-to localhost:3000/api/webhooks/stripe` 명령으로 실행. 이때 출력되는 `whsec_...` 값을 `.env.local`의 `STRIPE_WEBHOOK_SECRET`에 설정.

- [ ] **Step 2: Commit**

```bash
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add app/api/webhooks/
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add Stripe webhook handler with order creation and stock decrement"
```

---

### Task 7: 결제 완료 / 취소 페이지

**Files:**
- Create: `app/checkout/success/page.tsx`
- Create: `app/checkout/cancel/page.tsx`

- [ ] **Step 1: 결제 완료 페이지**

```tsx
// app/checkout/success/page.tsx
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center section-padding">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">결제 완료!</h1>
        <p className="text-slate-600 mb-2">주문이 성공적으로 접수되었습니다.</p>
        <p className="text-slate-500 text-sm mb-8">확인 이메일이 발송됩니다.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" size="lg">
            <a href="/account/orders">주문 확인</a>
          </Button>
          <Button size="lg">
            <a href="/">계속 쇼핑하기</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 결제 취소/실패 페이지**

```tsx
// app/checkout/cancel/page.tsx
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center section-padding">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">결제가 취소되었습니다</h1>
        <p className="text-slate-600 mb-2">결제가 완료되지 않았습니다.</p>
        <p className="text-slate-500 text-sm mb-8">장바구니 상품은 유지됩니다. 다시 시도해주세요.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" size="lg">
            <a href="/">홈으로 돌아가기</a>
          </Button>
          <Button size="lg">
            <a href="/cart">장바구니로 이동</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: TypeScript 검증 및 Commit**

```bash
cd "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" && npx tsc --noEmit 2>&1 | head -20
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add app/checkout/
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add checkout success and cancel pages"
```

---

### Task 8: 전체 빌드 검증

- [ ] **Step 1: 빌드 실행**

```bash
cd "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" && npm run build 2>&1
```
Expected: `✓ Compiled successfully`

- [ ] **Step 2: Webhook 로컬 테스트 (Stripe CLI 필요)**

```bash
# Stripe CLI 설치 후 실행 (별도 터미널)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 테스트 이벤트 전송
stripe trigger checkout.session.completed
```
Expected: 서버 콘솔에 `Order ... created successfully` 출력
