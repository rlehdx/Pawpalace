# Phase 1: UI Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 UI 컴포넌트의 디자인 일관성, 1440px+ 와이드 화면 최적화, 인터랙션 개선, Toast 시스템 구축, 상품 상세 페이지 구현.

**Architecture:** 현재 Next.js 14 App Router + Tailwind CSS 구조를 유지하면서 디자인 시스템 토큰을 강화. 새로운 `components/ui/Toast.tsx`와 `components/ui/Skeleton.tsx`를 추가하고, `app/products/[id]/page.tsx`를 신규 생성. `container-site` 클래스를 `max-w-screen-2xl`로 확장하여 와이드 화면 대응.

**Tech Stack:** Next.js 14, React 18, Tailwind CSS 3.4, TypeScript 5, Lucide React

---

## File Map

| 작업 | 파일 |
|------|------|
| Create | `components/ui/Toast.tsx` |
| Create | `components/ui/Skeleton.tsx` |
| Create | `components/ui/ToastProvider.tsx` |
| Create | `app/products/[id]/page.tsx` |
| Modify | `app/globals.css` — container-site 와이드 대응, 1440px breakpoint |
| Modify | `app/layout.tsx` — ToastProvider 추가 |
| Modify | `components/sections/ProductShowcase.tsx` — Skeleton, Toast 연동 |
| Modify | `components/sections/CategoryGrid.tsx` — 1440px 그리드 조정 |
| Modify | `lib/cart.ts` — createCheckoutSession 에러 시 Toast 사용 |

---

### Task 1: Skeleton Loader 컴포넌트 생성

**Files:**
- Create: `components/ui/Skeleton.tsx`

- [ ] **Step 1: Skeleton 컴포넌트 작성**

```tsx
// components/ui/Skeleton.tsx
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-200",
        className
      )}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-card flex flex-col">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <div className="flex items-center justify-between mt-1">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 개발 서버에서 import 확인**

```bash
cd "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" && npx tsc --noEmit 2>&1 | head -20
```
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add components/ui/Skeleton.tsx
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add Skeleton and ProductCardSkeleton components"
```

---

### Task 2: Toast 시스템 구축

**Files:**
- Create: `components/ui/Toast.tsx`
- Create: `components/ui/ToastProvider.tsx`

- [ ] **Step 1: Toast 타입과 컨텍스트 작성**

```tsx
// components/ui/Toast.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-emerald-500" />,
  error:   <AlertCircle size={18} className="text-red-500" />,
  info:    <Info size={18} className="text-blue-500" />,
  warning: <AlertTriangle size={18} className="text-amber-500" />,
};

const toastBg: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50",
  error:   "border-red-200 bg-red-50",
  info:    "border-blue-200 bg-blue-50",
  warning: "border-amber-200 bg-amber-50",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex items-start gap-3 p-4 rounded-2xl border shadow-lifted",
        "animate-fade-up animate-fill-both",
        "min-w-[300px] max-w-[400px]",
        toastBg[toast.type]
      )}
    >
      <span className="shrink-0 mt-0.5">{icons[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-slate-600 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
        aria-label="알림 닫기"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      {/* Toast Portal */}
      <div
        aria-label="알림"
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
```

- [ ] **Step 2: layout.tsx에 ToastProvider 추가**

`app/layout.tsx`의 `<body>` 내부를 다음과 같이 수정:

```tsx
// app/layout.tsx - import 추가
import { ToastProvider } from "@/components/ui/Toast";

// <body> 내부
<body>
  <ToastProvider>
    <Header />
    {children}
    <Footer />
  </ToastProvider>
</body>
```

- [ ] **Step 3: TypeScript 검증**

```bash
cd "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" && npx tsc --noEmit 2>&1 | head -30
```
Expected: 에러 없음

- [ ] **Step 4: Commit**

```bash
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add components/ui/Toast.tsx app/layout.tsx
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add Toast notification system with ToastProvider"
```

---

### Task 3: 1440px 와이드 화면 대응

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: container-site를 와이드 화면에서 확장**

`app/globals.css`의 `.container-site` 블록을 찾아 다음으로 교체:

```css
.container-site {
  width: 100%;
  max-width: 80rem;
  margin-inline: auto;
  padding-inline: 1.5rem;
}

@media (min-width: 768px) {
  .container-site {
    padding-inline: 2rem;
  }
}

@media (min-width: 1280px) {
  .container-site {
    padding-inline: 2.5rem;
  }
}

@media (min-width: 1440px) {
  .container-site {
    max-width: 88rem;
    padding-inline: 3rem;
  }
}

@media (min-width: 1920px) {
  .container-site {
    max-width: 96rem;
    padding-inline: 4rem;
  }
}
```

- [ ] **Step 2: CategoryGrid 1440px 그리드 조정**

`components/sections/CategoryGrid.tsx`에서 그리드 클래스 수정:

```tsx
// 기존
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"

// 변경
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-6 2xl:gap-8"
```

- [ ] **Step 3: ProductShowcase 1440px 그리드 조정**

`components/sections/ProductShowcase.tsx`에서 그리드 클래스 수정:

```tsx
// 기존
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"

// 변경
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 xl:gap-8"
```

- [ ] **Step 4: Commit**

```bash
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add app/globals.css components/sections/CategoryGrid.tsx components/sections/ProductShowcase.tsx
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: optimize layout for 1440px+ wide screens"
```

---

### Task 4: 상품 상세 페이지 구현

**Files:**
- Create: `app/products/[id]/page.tsx`

- [ ] **Step 1: 상품 상세 페이지 작성**

```tsx
// app/products/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Star, Truck, RotateCcw, Shield, ChevronLeft } from "lucide-react";
import { FEATURED_PRODUCTS } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Props {
  params: { id: string };
}

export async function generateStaticParams() {
  return FEATURED_PRODUCTS.map((p) => ({ id: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = FEATURED_PRODUCTS.find((p) => p.slug === params.id);
  if (!product) return { title: "상품을 찾을 수 없습니다" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default function ProductDetailPage({ params }: Props) {
  const product = FEATURED_PRODUCTS.find((p) => p.slug === params.id);
  if (!product) notFound();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <main className="section-padding">
      <div className="container-site">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
          <a href="/" className="hover:text-amber-600 transition-colors">홈</a>
          <span>/</span>
          <a href={`/category/${product.category}`} className="hover:text-amber-600 transition-colors capitalize">{product.category}</a>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate">{product.name}</span>
        </nav>

        {/* Back */}
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-600 transition-colors mb-6 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          뒤로가기
        </a>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50 shadow-card">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <Badge variant={product.badge === "sale" ? "sale" : product.badge === "new" ? "new" : "default"}>
                    {product.badge === "bestseller" ? "베스트셀러" : product.badge === "sale" ? "세일" : product.badge === "new" ? "신상품" : "한정판"}
                  </Badge>
                </div>
              )}
            </div>
            {product.images[1] && (
              <div className="grid grid-cols-2 gap-4">
                {product.images.slice(1).map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 shadow-card cursor-pointer hover:-translate-y-1 transition-transform duration-200">
                    <Image src={img} alt={`${product.name} ${i + 2}`} fill className="object-cover" sizes="25vw" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm font-semibold text-amber-600 capitalize mb-2">{product.category}</p>
              <h1 className="font-display text-3xl xl:text-4xl font-bold text-slate-900 leading-tight">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-700">{product.rating}</span>
              <span className="text-sm text-slate-400">({product.reviewCount.toLocaleString()} 리뷰)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-slate-900">${product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-slate-400 line-through">${product.originalPrice}</span>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {discount}% 할인
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-slate-600 leading-relaxed">{product.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 capitalize">
                  {tag}
                </span>
              ))}
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3 pt-2">
              <Button size="lg" fullWidth icon={<ShoppingCart size={18} />}>
                장바구니에 담기
              </Button>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              {[
                { icon: <Truck size={16} />, label: product.freeShipping ? "무료 배송" : "$49 이상 무료배송" },
                { icon: <RotateCcw size={16} />, label: "30일 반품 보장" },
                { icon: <Shield size={16} />, label: "안전한 결제" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="text-amber-500">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: TypeScript 검증**

```bash
cd "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" && npx tsc --noEmit 2>&1 | head -30
```
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add app/products/
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: add product detail page with image gallery and trust signals"
```

---

### Task 5: ProductShowcase에 Skeleton 및 Toast 연동

**Files:**
- Modify: `components/sections/ProductShowcase.tsx`

- [ ] **Step 1: ProductShowcase 상단 import에 Skeleton과 useToast 추가**

```tsx
// 추가할 import
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
```

- [ ] **Step 2: ProductShowcase 컴포넌트 내부에 로딩 상태와 Toast 연동**

```tsx
// ProductShowcase 함수 내부 상단에 추가
const { toast } = useToast();
const [isLoading, setIsLoading] = useState(false);

// addToCart 핸들러 수정
const addToCart = useCallback((productId: string) => {
  const product = FEATURED_PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  setAddedToCart((prev) => new Set(prev).add(productId));
  toast({
    type: "success",
    title: "장바구니에 담았습니다",
    message: product.name,
  });

  setTimeout(() => {
    setAddedToCart((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  }, 2000);
}, [toast]);
```

- [ ] **Step 3: 로딩 시 Skeleton 표시 (ProductShowcase 그리드 부분 교체)**

```tsx
{/* Product Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 xl:gap-8">
  {isLoading
    ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
    : filteredProducts.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlist.has(product.id)}
          isAddedToCart={addedToCart.has(product.id)}
          isHovered={hoveredProduct === product.id}
          onWishlistToggle={() => toggleWishlist(product.id)}
          onAddToCart={() => addToCart(product.id)}
          onHover={(id) => setHoveredProduct(id)}
          style={{ animationDelay: `${index * 60}ms` }}
        />
      ))}
</div>
```

- [ ] **Step 4: TypeScript 검증 및 Commit**

```bash
cd "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" && npx tsc --noEmit 2>&1 | head -20
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" add components/sections/ProductShowcase.tsx
git -C "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" commit -m "feat: integrate Skeleton loader and Toast in ProductShowcase"
```

---

### Task 6: 전체 빌드 검증

- [ ] **Step 1: 프로덕션 빌드 실행**

```bash
cd "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" && npm run build 2>&1
```
Expected: `✓ Compiled successfully`

- [ ] **Step 2: 개발 서버 실행 후 수동 확인**

```bash
cd "C:/Users/rlehd/Downloads/Pawpalace-main/Pawpalace-main" && npm run dev
```

브라우저에서 확인:
- `http://localhost:3000` — 메인 페이지 레이아웃
- `http://localhost:3000/products/premium-grain-free-salmon-kibble` — 상품 상세 페이지
- 상품 카드에서 "Add" 클릭 → Toast 팝업 확인
- 1440px 화면에서 그리드 5열 확인
