# Phase 3: Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 관리자 전용 대시보드 구현 — 매출/주문/회원 통계, 상품 CRUD + Supabase Storage 이미지 업로드, 주문 상태 원클릭 변경, 회원 관리, 쿠폰 관리.

**Architecture:** `/admin` 경로는 Phase 2의 미들웨어에서 `is_admin` 플래그로 보호. Server Components에서 Supabase SSR client로 초기 데이터 페칭. 상태 변경(주문, 상품) 은 Server Actions으로 처리하여 form submit 후 `revalidatePath`로 즉시 UI 갱신. 이미지 업로드는 Supabase Storage `pawpalace-products` 버킷에 저장, URL을 DB에 반영.

**Tech Stack:** Next.js 14 Server Actions, Supabase JS v2, Supabase Storage, TypeScript 5, Tailwind CSS

**전제조건:** Phase 2 완료 (Supabase 스키마, 클라이언트 설정, 미들웨어)

---

## File Map

| 작업 | 파일 |
|------|------|
| Create | `app/admin/layout.tsx` — 관리자 사이드바 레이아웃 |
| Create | `app/admin/page.tsx` — 대시보드 (통계) |
| Create | `app/admin/products/page.tsx` — 상품 목록 |
| Create | `app/admin/products/new/page.tsx` — 상품 등록 |
| Create | `app/admin/products/[id]/edit/page.tsx` — 상품 수정 |
| Create | `app/admin/orders/page.tsx` — 주문 목록 + 상태 변경 |
| Create | `app/admin/members/page.tsx` — 회원 목록 |
| Create | `app/admin/coupons/page.tsx` — 쿠폰 관리 |
| Create | `app/admin/actions.ts` — 모든 Server Actions |
| Create | `supabase/coupons.sql` — 쿠폰 테이블 스키마 |

---

### Task 1: 쿠폰 테이블 스키마 추가

**Files:**
- Create: `supabase/coupons.sql`

- [ ] **Step 1: 쿠폰 테이블 SQL 작성 후 Supabase에서 실행**

```sql
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
```

> Supabase 대시보드 → SQL Editor에서 실행

- [ ] **Step 2: Commit**

```bash
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add supabase/coupons.sql
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add coupons table schema with RLS"
```

---

### Task 2: Server Actions 작성

**Files:**
- Create: `app/admin/actions.ts`

- [ ] **Step 1: 모든 관리자 Server Actions 작성**

```ts
// app/admin/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ——— 상품 ———

export async function createProduct(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const slug = (formData.get("name") as string)
    .toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const price = parseFloat(formData.get("price") as string);
  const originalPrice = formData.get("originalPrice")
    ? parseFloat(formData.get("originalPrice") as string)
    : null;
  const stock = parseInt(formData.get("stock") as string, 10);
  const description = formData.get("description") as string;
  const animalCategoryId = formData.get("animal_category_id") as string;
  const productCategoryId = formData.get("product_category_id") as string;
  const badge = (formData.get("badge") as string) || null;
  const freeShipping = formData.get("free_shipping") === "on";
  const imageUrl = formData.get("image_url") as string;

  const { error } = await supabase.from("pawpalace_products").insert({
    name,
    slug,
    price,
    original_price: originalPrice,
    stock,
    description,
    animal_category_id: animalCategoryId,
    product_category_id: productCategoryId,
    badge,
    free_shipping: freeShipping,
    images: imageUrl ? [imageUrl] : [],
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const price = parseFloat(formData.get("price") as string);
  const originalPrice = formData.get("originalPrice")
    ? parseFloat(formData.get("originalPrice") as string)
    : null;
  const stock = parseInt(formData.get("stock") as string, 10);
  const imageUrl = formData.get("image_url") as string;

  const { error } = await supabase
    .from("pawpalace_products")
    .update({
      name: formData.get("name") as string,
      price,
      original_price: originalPrice,
      stock,
      description: formData.get("description") as string,
      badge: (formData.get("badge") as string) || null,
      free_shipping: formData.get("free_shipping") === "on",
      images: imageUrl ? [imageUrl] : [],
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
}

export async function deleteProduct(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("pawpalace_products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
}

// ——— 주문 상태 변경 ———

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("pawpalace_orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}

// ——— 쿠폰 ———

export async function createCoupon(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("pawpalace_coupons").insert({
    code: (formData.get("code") as string).toUpperCase(),
    discount_type: formData.get("discount_type") as string,
    discount_value: parseFloat(formData.get("discount_value") as string),
    min_order_amount: parseFloat((formData.get("min_order_amount") as string) || "0"),
    max_uses: formData.get("max_uses") ? parseInt(formData.get("max_uses") as string, 10) : null,
    expires_at: (formData.get("expires_at") as string) || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/coupons");
}

export async function toggleCoupon(id: string, isActive: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("pawpalace_coupons")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/coupons");
}

// ——— 이미지 업로드 ———

export async function uploadProductImage(formData: FormData): Promise<string> {
  const supabase = createClient();
  const file = formData.get("file") as File;
  const ext = file.name.split(".").pop();
  const path = `products/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("pawpalace-products")
    .upload(path, file, { upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("pawpalace-products").getPublicUrl(path);
  return data.publicUrl;
}
```

- [ ] **Step 2: Supabase Storage 버킷 생성**

> Supabase 대시보드 → Storage → New bucket → 이름: `pawpalace-products` → Public: ON → Create

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add app/admin/actions.ts
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add admin server actions for products, orders, coupons, and image upload"
```

---

### Task 3: 관리자 레이아웃 및 사이드바

**Files:**
- Create: `app/admin/layout.tsx`

- [ ] **Step 1: 관리자 레이아웃 작성**

```tsx
// app/admin/layout.tsx
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, ChevronRight } from "lucide-react";
import Link from "next/link";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "대시보드" },
  { href: "/admin/products", icon: Package, label: "상품 관리" },
  { href: "/admin/orders", icon: ShoppingBag, label: "주문 관리" },
  { href: "/admin/members", icon: Users, label: "회원 관리" },
  { href: "/admin/coupons", icon: Tag, label: "쿠폰 관리" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <Link href="/" className="font-display text-xl font-bold">
            Paw<span className="text-amber-400">Palace</span>
          </Link>
          <p className="text-slate-400 text-xs mt-1">관리자 패널</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="flex flex-col gap-1">
            {NAV.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-150 text-sm font-medium group"
                >
                  <Icon size={18} className="shrink-0" />
                  {label}
                  <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            ← 사이트로 돌아가기
          </Link>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add app/admin/layout.tsx
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add admin sidebar layout"
```

---

### Task 4: 관리자 대시보드 (통계)

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1: 대시보드 페이지 작성**

```tsx
// app/admin/page.tsx
import { createClient } from "@/lib/supabase/server";
import { TrendingUp, ShoppingBag, Users, Package } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    { count: totalOrders },
    { count: totalMembers },
    { count: totalProducts },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("pawpalace_orders").select("*", { count: "exact", head: true }),
    supabase.from("pawpalace_profiles").select("*", { count: "exact", head: true }),
    supabase.from("pawpalace_products").select("*", { count: "exact", head: true }),
    supabase
      .from("pawpalace_orders")
      .select("id, status, total_amount, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const { data: revenueData } = await supabase
    .from("pawpalace_orders")
    .select("total_amount")
    .eq("status", "paid");
  const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0;

  const stats = [
    { label: "총 매출", value: `$${totalRevenue.toLocaleString("en", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
    { label: "총 주문", value: totalOrders ?? 0, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
    { label: "총 회원", value: totalMembers ?? 0, icon: Users, color: "text-purple-600 bg-purple-50" },
    { label: "등록 상품", value: totalProducts ?? 0, icon: Package, color: "text-amber-600 bg-amber-50" },
  ];

  const statusLabel: Record<string, string> = {
    pending: "대기", paid: "결제완료", shipping: "배송중", delivered: "배송완료", cancelled: "취소", refunded: "환불"
  };
  const statusColor: Record<string, string> = {
    pending: "bg-slate-100 text-slate-600",
    paid: "bg-blue-100 text-blue-700",
    shipping: "bg-amber-100 text-amber-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    refunded: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="p-8">
      <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">대시보드</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
              <Icon size={22} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">최근 주문</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="text-left py-3 pr-4 font-medium">주문 ID</th>
                <th className="text-left py-3 pr-4 font-medium">상태</th>
                <th className="text-left py-3 pr-4 font-medium">금액</th>
                <th className="text-left py-3 font-medium">날짜</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((order) => (
                <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-slate-600">{order.id.slice(0, 8)}...</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-semibold">${Number(order.total_amount).toFixed(2)}</td>
                  <td className="py-3 text-slate-500">{new Date(order.created_at).toLocaleDateString("ko-KR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add app/admin/page.tsx
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add admin dashboard with stats and recent orders"
```

---

### Task 5: 상품 관리 페이지 (목록 + 등록 + 수정)

**Files:**
- Create: `app/admin/products/page.tsx`
- Create: `app/admin/products/new/page.tsx`
- Create: `app/admin/products/[id]/edit/page.tsx`

- [ ] **Step 1: 상품 목록 페이지**

```tsx
// app/admin/products/page.tsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deleteProduct } from "../actions";

export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("pawpalace_products")
    .select("id, name, price, stock, badge, is_active, images")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900">상품 관리</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors shadow-warm"
        >
          <Plus size={16} /> 상품 등록
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <th className="text-left px-6 py-4 font-medium">상품명</th>
              <th className="text-left px-6 py-4 font-medium">가격</th>
              <th className="text-left px-6 py-4 font-medium">재고</th>
              <th className="text-left px-6 py-4 font-medium">뱃지</th>
              <th className="text-left px-6 py-4 font-medium">상태</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {product.images?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <span className="font-medium text-slate-900 line-clamp-1">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold">${Number(product.price).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${product.stock < 5 ? "text-red-600" : "text-slate-700"}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {product.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 capitalize">
                      {product.badge}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {product.is_active ? "활성" : "비활성"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <Pencil size={15} />
                    </Link>
                    <form action={deleteProduct.bind(null, product.id)}>
                      <button
                        type="submit"
                        className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        onClick={(e) => {
                          if (!confirm("정말 삭제하시겠습니까?")) e.preventDefault();
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 상품 등록 폼 (이미지 업로드 포함)**

```tsx
// app/admin/products/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, uploadProductImage } from "../../actions";
import { Button } from "@/components/ui/Button";
import { Upload } from "lucide-react";

export default function AdminProductNewPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const url = await uploadProductImage(fd);
      setImageUrl(url);
    } catch {
      alert("이미지 업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set("image_url", imageUrl);
    try {
      await createProduct(fd);
      router.push("/admin/products");
    } catch (err) {
      alert("상품 등록 실패: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">상품 등록</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-slate-100 p-8 flex flex-col gap-6">

        {/* 이미지 업로드 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">상품 이미지</label>
          <div className="flex items-center gap-4">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="상품 이미지" className="w-24 h-24 rounded-xl object-cover border border-slate-200" />
            ) : (
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                <Upload size={24} />
              </div>
            )}
            <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-amber-400 hover:text-amber-600 transition-colors">
              {uploading ? "업로드 중..." : "파일 선택"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* 상품명 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">상품명 *</label>
          <input name="name" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all" />
        </div>

        {/* 가격 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">판매가 ($) *</label>
            <input name="price" type="number" step="0.01" min="0" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">정가 ($)</label>
            <input name="originalPrice" type="number" step="0.01" min="0" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all" />
          </div>
        </div>

        {/* 재고 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">재고 *</label>
          <input name="stock" type="number" min="0" required defaultValue={0} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all" />
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">상품 설명</label>
          <textarea name="description" rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all resize-none" />
        </div>

        {/* 뱃지 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">뱃지</label>
          <select name="badge" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm">
            <option value="">없음</option>
            <option value="new">신상품</option>
            <option value="sale">세일</option>
            <option value="bestseller">베스트셀러</option>
            <option value="limited">한정판</option>
          </select>
        </div>

        {/* 무료배송 */}
        <div className="flex items-center gap-3">
          <input type="checkbox" name="free_shipping" id="free_shipping" className="w-4 h-4 rounded accent-amber-500" />
          <label htmlFor="free_shipping" className="text-sm font-medium text-slate-700">무료 배송</label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>취소</Button>
          <Button type="submit" loading={submitting}>등록하기</Button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add app/admin/products/
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add admin product list, new product form with image upload"
```

---

### Task 6: 주문 관리 페이지 (원클릭 상태 변경)

**Files:**
- Create: `app/admin/orders/page.tsx`

- [ ] **Step 1: 주문 목록 + 상태 변경 폼 작성**

```tsx
// app/admin/orders/page.tsx
import { createClient } from "@/lib/supabase/server";
import { updateOrderStatus } from "../actions";

const ORDER_STATUSES = [
  { value: "pending",   label: "대기중",   color: "bg-slate-100 text-slate-600" },
  { value: "paid",      label: "결제완료", color: "bg-blue-100 text-blue-700" },
  { value: "shipping",  label: "배송중",   color: "bg-amber-100 text-amber-700" },
  { value: "delivered", label: "배송완료", color: "bg-emerald-100 text-emerald-700" },
  { value: "cancelled", label: "취소됨",   color: "bg-red-100 text-red-700" },
  { value: "refunded",  label: "환불됨",   color: "bg-purple-100 text-purple-700" },
];

export default async function AdminOrdersPage() {
  const supabase = createClient();
  const { data: orders } = await supabase
    .from("pawpalace_orders")
    .select("id, status, total_amount, created_at, user_id")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">주문 관리</h1>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <th className="text-left px-6 py-4 font-medium">주문 ID</th>
              <th className="text-left px-6 py-4 font-medium">금액</th>
              <th className="text-left px-6 py-4 font-medium">날짜</th>
              <th className="text-left px-6 py-4 font-medium">상태 변경 (원클릭)</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-600">{order.id.slice(0, 12)}...</td>
                <td className="px-6 py-4 font-semibold">${Number(order.total_amount).toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-500">{new Date(order.created_at).toLocaleDateString("ko-KR")}</td>
                <td className="px-6 py-4">
                  {/* 원클릭 상태 변경 버튼들 */}
                  <div className="flex flex-wrap gap-1.5">
                    {ORDER_STATUSES.map(({ value, label, color }) => (
                      <form key={value} action={updateOrderStatus.bind(null, order.id, value)}>
                        <button
                          type="submit"
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border-2 ${
                            order.status === value
                              ? `${color} border-current opacity-100 ring-2 ring-offset-1 ring-current`
                              : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600"
                          }`}
                        >
                          {label}
                        </button>
                      </form>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add app/admin/orders/
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add admin orders page with one-click status change"
```

---

### Task 7: 회원 관리 + 쿠폰 관리

**Files:**
- Create: `app/admin/members/page.tsx`
- Create: `app/admin/coupons/page.tsx`

- [ ] **Step 1: 회원 관리 페이지**

```tsx
// app/admin/members/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function AdminMembersPage() {
  const supabase = createClient();
  const { data: members } = await supabase
    .from("pawpalace_profiles")
    .select("id, email, full_name, is_admin, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">회원 관리</h1>
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <th className="text-left px-6 py-4 font-medium">이름</th>
              <th className="text-left px-6 py-4 font-medium">이메일</th>
              <th className="text-left px-6 py-4 font-medium">역할</th>
              <th className="text-left px-6 py-4 font-medium">가입일</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((member) => (
              <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{member.full_name ?? "—"}</td>
                <td className="px-6 py-4 text-slate-600">{member.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${member.is_admin ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                    {member.is_admin ? "관리자" : "일반회원"}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{new Date(member.created_at).toLocaleDateString("ko-KR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 쿠폰 관리 페이지**

```tsx
// app/admin/coupons/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createCoupon, toggleCoupon } from "../actions";

export default async function AdminCouponsPage() {
  const supabase = createClient();
  const { data: coupons } = await supabase
    .from("pawpalace_coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">쿠폰 관리</h1>

      {/* 쿠폰 등록 폼 */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 mb-8">
        <h2 className="font-semibold text-slate-900 mb-4">새 쿠폰 등록</h2>
        <form action={createCoupon} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">쿠폰 코드 *</label>
            <input name="code" required placeholder="SUMMER20" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm uppercase" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">할인 유형 *</label>
            <select name="discount_type" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm">
              <option value="percent">퍼센트 (%)</option>
              <option value="fixed">정액 ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">할인 값 *</label>
            <input name="discount_value" type="number" step="0.01" min="0" required placeholder="20" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">최소 주문금액 ($)</label>
            <input name="min_order_amount" type="number" step="0.01" min="0" defaultValue="0" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">최대 사용 횟수</label>
            <input name="max_uses" type="number" min="1" placeholder="무제한" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">만료일</label>
            <input name="expires_at" type="date" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm" />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors">
              쿠폰 등록
            </button>
          </div>
        </form>
      </div>

      {/* 쿠폰 목록 */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <th className="text-left px-6 py-4 font-medium">코드</th>
              <th className="text-left px-6 py-4 font-medium">할인</th>
              <th className="text-left px-6 py-4 font-medium">사용/최대</th>
              <th className="text-left px-6 py-4 font-medium">만료일</th>
              <th className="text-left px-6 py-4 font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {coupons?.map((coupon) => (
              <tr key={coupon.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-slate-900">{coupon.code}</td>
                <td className="px-6 py-4">
                  {coupon.discount_type === "percent"
                    ? `${coupon.discount_value}%`
                    : `$${Number(coupon.discount_value).toFixed(2)}`}
                </td>
                <td className="px-6 py-4">{coupon.used_count} / {coupon.max_uses ?? "∞"}</td>
                <td className="px-6 py-4 text-slate-500">
                  {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString("ko-KR") : "—"}
                </td>
                <td className="px-6 py-4">
                  <form action={toggleCoupon.bind(null, coupon.id, !coupon.is_active)}>
                    <button
                      type="submit"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        coupon.is_active
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {coupon.is_active ? "활성" : "비활성"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript 검증 및 Commit**

```bash
cd "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" && npx tsc --noEmit 2>&1 | head -30
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add app/admin/members/ app/admin/coupons/
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add admin members and coupons pages"
```

---

### Task 8: 전체 빌드 및 최종 검증

- [ ] **Step 1: 빌드 실행**

```bash
cd "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" && npm run build 2>&1
```
Expected: `✓ Compiled successfully`

- [ ] **Step 2: 관리자 계정 설정**

> Supabase 대시보드 → SQL Editor에서 실행:
```sql
update pawpalace_profiles
set is_admin = true
where email = 'your-admin@email.com';
```

- [ ] **Step 3: 로컬에서 관리자 기능 확인**

```bash
cd "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" && npm run dev
```

브라우저에서 확인:
- `http://localhost:3000/admin` — 대시보드 통계
- `http://localhost:3000/admin/products/new` — 이미지 업로드 → 상품 등록
- `http://localhost:3000/admin/orders` — 주문 상태 원클릭 변경
- `http://localhost:3000/admin/coupons` — 쿠폰 등록 및 활성/비활성 토글
