# Code Quality & SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ProductCard 컴포넌트 추출(카테고리별 더미데이터 포함), 내부 링크 Link 태그 통일, robots.txt+sitemap 생성, 메타데이터 보완

**Architecture:** 공통 ProductCard 컴포넌트를 `components/ui/ProductCard.tsx`에 추출하고, 카테고리별 더미 데이터는 `lib/dummy/` 폴더에 분리 관리한다. SEO는 Next.js App Router의 `generateMetadata` + `MetadataRoute`를 활용한다.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide React

---

## File Map

| 작업 | 파일 |
|------|------|
| 생성 | `components/ui/ProductCard.tsx` |
| 생성 | `lib/dummy/index.ts` (카테고리별 더미 데이터 re-export) |
| 생성 | `lib/dummy/dog.ts` |
| 생성 | `lib/dummy/cat.ts` |
| 생성 | `lib/dummy/bird.ts` |
| 생성 | `lib/dummy/fish.ts` |
| 생성 | `lib/dummy/small-pet.ts` |
| 수정 | `app/products/page.tsx` — ProductCard 사용으로 교체 |
| 수정 | `app/category/[id]/page.tsx` — ProductCard 사용으로 교체 |
| 수정 | `app/category/[id]/[sub]/page.tsx` — ProductCard 사용으로 교체 |
| 수정 | `app/sale/page.tsx` — ProductCard 사용으로 교체 |
| 수정 | `components/layout/Header.tsx` — `<a>` → `<Link>` |
| 수정 | `components/layout/Footer.tsx` — `<a>` → `<Link>` |
| 수정 | `app/products/[id]/page.tsx` — `<a>` → `<Link>` |
| 생성 | `app/robots.ts` |
| 생성 | `app/sitemap.ts` |
| 수정 | `app/(auth)/login/page.tsx` — metadata 추가 |
| 수정 | `app/(auth)/signup/page.tsx` — metadata 추가 |
| 수정 | `app/products/[id]/page.tsx` — Product JSON-LD schema 추가 |

---

### Task 1: ProductCard 공통 컴포넌트 생성

**Files:**
- Create: `components/ui/ProductCard.tsx`

- [ ] **Step 1: `components/ui/ProductCard.tsx` 생성**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductBadge } from "@/components/ui/Badge";

interface ProductCardProps {
  product: Product;
  /** 할인율 배지를 우측 상단에 표시할지 여부 (sale 페이지용) */
  showDiscountBadge?: boolean;
}

export function ProductCard({ product, showDiscountBadge = false }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-lifted transition-shadow duration-300 block"
    >
      {/* Image */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {product.badge && (
          <div className="absolute top-3 left-3">
            <ProductBadge type={product.badge} />
          </div>
        )}
        {showDiscountBadge && discount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs font-semibold text-amber-600 capitalize mb-1">{product.category}</p>
        <h2 className="font-semibold text-slate-900 text-sm leading-snug mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
          {product.name}
        </h2>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              className={
                i < Math.floor(product.rating)
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-200 fill-slate-200"
              }
              aria-hidden="true"
            />
          ))}
          <span className="text-xs text-slate-500 ml-1">({product.reviewCount.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className={`font-bold ${showDiscountBadge && discount ? "text-red-600" : "text-slate-900"}`}>
            ${product.price}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-sm text-slate-400 line-through">${product.originalPrice}</span>
              <span className="text-xs font-bold text-emerald-600">-{discount}%</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
```

- [ ] **Step 2: 동작 확인**

개발 서버(`npm run dev`)가 실행 중이면 TypeScript 에러 없이 컴파일되는지 확인.

---

### Task 2: 카테고리별 더미 데이터 분리

**Files:**
- Create: `lib/dummy/dog.ts`
- Create: `lib/dummy/cat.ts`
- Create: `lib/dummy/bird.ts`
- Create: `lib/dummy/fish.ts`
- Create: `lib/dummy/small-pet.ts`
- Create: `lib/dummy/index.ts`

- [ ] **Step 1: `lib/dummy/dog.ts` 생성**

```ts
import type { Product } from "@/lib/types";

export const DOG_PRODUCTS: Product[] = [
  {
    id: "d001",
    name: "Premium Grain-Free Salmon Kibble",
    slug: "premium-grain-free-salmon-kibble",
    category: "dog",
    price: 42.99,
    originalPrice: 54.99,
    rating: 4.8,
    reviewCount: 1247,
    images: [
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&q=80",
      "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=600&q=80",
    ],
    badge: "bestseller",
    tags: ["grain-free", "salmon", "adult", "food"],
    description: "All-natural salmon & sweet potato formula. No fillers, no artificial colors. Vet-recommended for adult dogs.",
    inStock: true,
    freeShipping: true,
  },
  {
    id: "d002",
    name: "Orthopedic Memory Foam Dog Bed",
    slug: "orthopedic-memory-foam-dog-bed",
    category: "dog",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.9,
    reviewCount: 834,
    images: [
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80",
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80",
    ],
    badge: "sale",
    tags: ["bed", "orthopedic", "memory-foam", "washable"],
    description: "2-inch memory foam base with removable, machine-washable cover.",
    inStock: true,
    freeShipping: true,
  },
  {
    id: "d003",
    name: "Rope & Rubber Chew Combo Pack",
    slug: "rope-rubber-chew-combo-pack",
    category: "dog",
    price: 24.99,
    rating: 4.5,
    reviewCount: 389,
    images: [
      "https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=600&q=80",
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80",
    ],
    badge: "new",
    tags: ["toys", "chew", "rope", "rubber"],
    description: "8-piece variety pack including braided rope toys, rubber bones, and treat-dispensing balls.",
    inStock: true,
    freeShipping: false,
  },
  {
    id: "d004",
    name: "Natural Chicken & Rice Dog Food",
    slug: "natural-chicken-rice-dog-food",
    category: "dog",
    price: 38.99,
    originalPrice: 46.99,
    rating: 4.7,
    reviewCount: 892,
    images: [
      "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=600&q=80",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&q=80",
    ],
    badge: "sale",
    tags: ["food", "chicken", "rice", "natural", "adult"],
    description: "Real chicken as the #1 ingredient with wholesome brown rice and sweet potatoes.",
    inStock: true,
    freeShipping: true,
  },
  {
    id: "d005",
    name: "Retractable Dog Leash 16ft",
    slug: "retractable-dog-leash-16ft",
    category: "dog",
    price: 22.99,
    rating: 4.4,
    reviewCount: 1543,
    images: [
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80",
      "https://images.unsplash.com/photo-1560743641-3914f2c45636?w=600&q=80",
    ],
    tags: ["leash", "retractable", "walking", "outdoor", "grooming"],
    description: "16ft retractable leash with one-button brake and lock. Reflective ribbon for night walks.",
    inStock: true,
    freeShipping: false,
  },
  {
    id: "d006",
    name: "Heavy-Duty Dog Harness",
    slug: "heavy-duty-dog-harness",
    category: "dog",
    price: 34.99,
    originalPrice: 44.99,
    rating: 4.8,
    reviewCount: 2104,
    images: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
      "https://images.unsplash.com/photo-1568572933382-74d440642117?w=600&q=80",
    ],
    badge: "bestseller",
    tags: ["harness", "no-pull", "adjustable", "grooming"],
    description: "No-pull front clip harness with dual attachment points and reflective stitching.",
    inStock: true,
    freeShipping: true,
  },
];
```

- [ ] **Step 2: `lib/dummy/cat.ts` 생성**

```ts
import type { Product } from "@/lib/types";

export const CAT_PRODUCTS: Product[] = [
  {
    id: "c001",
    name: "Interactive Feather Wand Toy",
    slug: "interactive-feather-wand-toy",
    category: "cat",
    price: 18.99,
    rating: 4.7,
    reviewCount: 562,
    images: [
      "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&q=80",
      "https://images.unsplash.com/photo-1511044568906-3b3f5e7c7f95?w=600&q=80",
    ],
    badge: "new",
    tags: ["toys", "interactive", "feather", "exercise"],
    description: "Extendable 36\" wand with real feathers and bells. Keeps cats mentally stimulated.",
    inStock: true,
    freeShipping: false,
  },
  {
    id: "c002",
    name: "Self-Cleaning Litter Box Pro",
    slug: "self-cleaning-litter-box-pro",
    category: "cat",
    price: 189.99,
    originalPrice: 229.99,
    rating: 4.6,
    reviewCount: 1089,
    images: [
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&q=80",
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
    ],
    badge: "sale",
    tags: ["litter", "self-cleaning", "odor-control", "smart"],
    description: "Automated rake system cleans 20 minutes after use. Holds up to 2 weeks of waste.",
    inStock: true,
    freeShipping: true,
  },
  {
    id: "c003",
    name: "Cat Tree Tower Deluxe",
    slug: "cat-tree-tower-deluxe",
    category: "cat",
    price: 149.99,
    originalPrice: 199.99,
    rating: 4.9,
    reviewCount: 678,
    images: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80",
    ],
    badge: "bestseller",
    tags: ["beds", "cat-tree", "sisal", "condo", "perch"],
    description: "67\" tall cat tower with 3 condos, 2 perches, sisal scratching posts, and plush hammock.",
    inStock: true,
    freeShipping: true,
  },
  {
    id: "c004",
    name: "Automatic Cat Feeder 6-Meal",
    slug: "automatic-cat-feeder-6-meal",
    category: "cat",
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.5,
    reviewCount: 731,
    images: [
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&q=80",
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80",
    ],
    badge: "sale",
    tags: ["food", "automatic", "feeder", "programmable"],
    description: "Programs up to 6 meals daily with custom portions. LCD display and battery backup.",
    inStock: true,
    freeShipping: true,
  },
  {
    id: "c005",
    name: "Cat Tunnel & Play Set",
    slug: "cat-tunnel-play-set",
    category: "cat",
    price: 29.99,
    rating: 4.6,
    reviewCount: 445,
    images: [
      "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&q=80",
      "https://images.unsplash.com/photo-1511044568906-3b3f5e7c7f95?w=600&q=80",
    ],
    badge: "new",
    tags: ["toys", "tunnel", "play", "exercise"],
    description: "Collapsible 3-way tunnel with crinkle sounds and peek-a-boo holes. Machine washable.",
    inStock: true,
    freeShipping: false,
  },
  {
    id: "c006",
    name: "Premium Clumping Cat Litter",
    slug: "premium-clumping-cat-litter",
    category: "cat",
    price: 24.99,
    originalPrice: 31.99,
    rating: 4.7,
    reviewCount: 2341,
    images: [
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&q=80",
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80",
    ],
    badge: "bestseller",
    tags: ["litter", "clumping", "odor-control", "natural"],
    description: "99% dust-free, tight-clumping formula. Activated carbon neutralizes odors for up to 2 weeks.",
    inStock: true,
    freeShipping: true,
  },
];
```

- [ ] **Step 3: `lib/dummy/bird.ts` 생성**

```ts
import type { Product } from "@/lib/types";

export const BIRD_PRODUCTS: Product[] = [
  {
    id: "b001",
    name: "Wild Bird Premium Seed Mix",
    slug: "wild-bird-premium-seed-mix",
    category: "bird",
    price: 15.99,
    rating: 4.8,
    reviewCount: 203,
    images: [
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&q=80",
      "https://images.unsplash.com/photo-1570018070607-a48f702d74e0?w=600&q=80",
    ],
    tags: ["food", "seed", "mixed", "natural"],
    description: "Nutrient-rich blend of sunflower, safflower, millet, and peanuts. Vitamin-fortified.",
    inStock: true,
    freeShipping: false,
  },
  {
    id: "b002",
    name: "Stainless Steel Bird Cage Large",
    slug: "stainless-steel-bird-cage-large",
    category: "bird",
    price: 189.99,
    originalPrice: 239.99,
    rating: 4.7,
    reviewCount: 312,
    images: [
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&q=80",
      "https://images.unsplash.com/photo-1570018070607-a48f702d74e0?w=600&q=80",
    ],
    badge: "sale",
    tags: ["cage", "stainless", "large", "accessories"],
    description: "32\" x 21\" stainless steel cage with 4 feeder cups, 3 perches, and pull-out tray.",
    inStock: true,
    freeShipping: true,
  },
  {
    id: "b003",
    name: "Colorful Bird Swing & Perch Set",
    slug: "colorful-bird-swing-perch-set",
    category: "bird",
    price: 12.99,
    rating: 4.5,
    reviewCount: 187,
    images: [
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&q=80",
      "https://images.unsplash.com/photo-1570018070607-a48f702d74e0?w=600&q=80",
    ],
    badge: "new",
    tags: ["toys", "swing", "perch", "colorful"],
    description: "5-piece set with wooden swings, ladders, and rope perches. Safe, non-toxic materials.",
    inStock: true,
    freeShipping: false,
  },
  {
    id: "b004",
    name: "Parrot Training Treat Sticks",
    slug: "parrot-training-treat-sticks",
    category: "bird",
    price: 9.99,
    rating: 4.6,
    reviewCount: 98,
    images: [
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&q=80",
      "https://images.unsplash.com/photo-1570018070607-a48f702d74e0?w=600&q=80",
    ],
    tags: ["food", "treats", "training", "parrot"],
    description: "Natural fruit & honey flavored treat sticks. No artificial colors. Great for training.",
    inStock: true,
    freeShipping: false,
  },
];
```

- [ ] **Step 4: `lib/dummy/fish.ts` 생성**

```ts
import type { Product } from "@/lib/types";

export const FISH_PRODUCTS: Product[] = [
  {
    id: "f001",
    name: "Aquarium Starter Kit 20-Gallon",
    slug: "aquarium-starter-kit-20-gallon",
    category: "fish",
    price: 134.99,
    originalPrice: 169.99,
    rating: 4.7,
    reviewCount: 421,
    images: [
      "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&q=80",
      "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600&q=80",
    ],
    badge: "sale",
    tags: ["tank", "starter", "filter", "led", "accessories"],
    description: "Complete 20-gallon setup: tank, silent LED filter, full-spectrum lighting, and thermometer.",
    inStock: true,
    freeShipping: true,
  },
  {
    id: "f002",
    name: "Premium Tropical Fish Food",
    slug: "premium-tropical-fish-food",
    category: "fish",
    price: 11.99,
    rating: 4.8,
    reviewCount: 567,
    images: [
      "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&q=80",
      "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600&q=80",
    ],
    tags: ["food", "flakes", "tropical", "color-enhancing"],
    description: "Color-enhancing flake formula with spirulina and carotenoids. For all tropical fish.",
    inStock: true,
    freeShipping: false,
  },
  {
    id: "f003",
    name: "Aquarium LED Light Strip",
    slug: "aquarium-led-light-strip",
    category: "fish",
    price: 34.99,
    originalPrice: 44.99,
    rating: 4.6,
    reviewCount: 289,
    images: [
      "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&q=80",
      "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600&q=80",
    ],
    badge: "new",
    tags: ["lighting", "led", "accessories", "planted-tank"],
    description: "Full-spectrum LED strip with timer and dimmer. Supports plant growth and natural fish behavior.",
    inStock: true,
    freeShipping: false,
  },
  {
    id: "f004",
    name: "Canister Filter 100-Gallon",
    slug: "canister-filter-100-gallon",
    category: "fish",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.9,
    reviewCount: 344,
    images: [
      "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&q=80",
      "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600&q=80",
    ],
    badge: "bestseller",
    tags: ["filter", "canister", "accessories", "silent"],
    description: "Ultra-silent canister filter rated for 100 gallons. Multi-stage filtration with self-priming pump.",
    inStock: true,
    freeShipping: true,
  },
];
```

- [ ] **Step 5: `lib/dummy/small-pet.ts` 생성**

```ts
import type { Product } from "@/lib/types";

export const SMALL_PET_PRODUCTS: Product[] = [
  {
    id: "s001",
    name: "Hamster Habitat Starter Kit",
    slug: "hamster-habitat-starter-kit",
    category: "small-pet",
    price: 49.99,
    originalPrice: 64.99,
    rating: 4.6,
    reviewCount: 234,
    images: [
      "https://images.unsplash.com/photo-1591382696684-38c427c7547a?w=600&q=80",
      "https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=600&q=80",
    ],
    badge: "sale",
    tags: ["cage", "habitat", "starter", "accessories"],
    description: "Complete starter kit with cage, water bottle, food dish, exercise wheel, and hideout.",
    inStock: true,
    freeShipping: true,
  },
  {
    id: "s002",
    name: "Small Animal Exercise Wheel Silent",
    slug: "small-animal-exercise-wheel-silent",
    category: "small-pet",
    price: 16.99,
    rating: 4.7,
    reviewCount: 891,
    images: [
      "https://images.unsplash.com/photo-1591382696684-38c427c7547a?w=600&q=80",
      "https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=600&q=80",
    ],
    badge: "bestseller",
    tags: ["toys", "wheel", "exercise", "silent"],
    description: "Whisper-quiet ball-bearing wheel. 8.5\" diameter, solid running surface safe for small feet.",
    inStock: true,
    freeShipping: false,
  },
  {
    id: "s003",
    name: "Natural Timothy Hay Bale 5lb",
    slug: "natural-timothy-hay-bale-5lb",
    category: "small-pet",
    price: 14.99,
    rating: 4.8,
    reviewCount: 1203,
    images: [
      "https://images.unsplash.com/photo-1591382696684-38c427c7547a?w=600&q=80",
      "https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=600&q=80",
    ],
    tags: ["food", "hay", "timothy", "natural"],
    description: "Sun-cured first-cut timothy hay. High fiber for healthy digestion in rabbits and guinea pigs.",
    inStock: true,
    freeShipping: false,
  },
  {
    id: "s004",
    name: "Rabbit Hutch Indoor Deluxe",
    slug: "rabbit-hutch-indoor-deluxe",
    category: "small-pet",
    price: 89.99,
    originalPrice: 109.99,
    rating: 4.5,
    reviewCount: 178,
    images: [
      "https://images.unsplash.com/photo-1591382696684-38c427c7547a?w=600&q=80",
      "https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=600&q=80",
    ],
    badge: "new",
    tags: ["cage", "hutch", "rabbit", "accessories"],
    description: "2-story indoor rabbit hutch with ramp, hideout, and removable tray. 47\" x 24\" footprint.",
    inStock: true,
    freeShipping: true,
  },
];
```

- [ ] **Step 6: `lib/dummy/index.ts` 생성**

```ts
export { DOG_PRODUCTS } from "./dog";
export { CAT_PRODUCTS } from "./cat";
export { BIRD_PRODUCTS } from "./bird";
export { FISH_PRODUCTS } from "./fish";
export { SMALL_PET_PRODUCTS } from "./small-pet";

import { DOG_PRODUCTS } from "./dog";
import { CAT_PRODUCTS } from "./cat";
import { BIRD_PRODUCTS } from "./bird";
import { FISH_PRODUCTS } from "./fish";
import { SMALL_PET_PRODUCTS } from "./small-pet";
import type { Product } from "@/lib/types";

export const ALL_DUMMY_PRODUCTS: Product[] = [
  ...DOG_PRODUCTS,
  ...CAT_PRODUCTS,
  ...BIRD_PRODUCTS,
  ...FISH_PRODUCTS,
  ...SMALL_PET_PRODUCTS,
];

/** 카테고리 ID로 더미 상품 조회 */
export function getDummyByCategory(categoryId: string): Product[] {
  return ALL_DUMMY_PRODUCTS.filter((p) => p.category === categoryId);
}

/** 카테고리 ID + 태그(sub)로 더미 상품 필터링 */
export function getDummyByCategorySub(categoryId: string, sub: string): Product[] {
  const byCategory = getDummyByCategory(categoryId);
  const filtered = byCategory.filter((p) => p.tags.some((t) => t.includes(sub)));
  return filtered.length > 0 ? filtered : byCategory;
}
```

- [ ] **Step 7: 커밋**

```bash
git add components/ui/ProductCard.tsx lib/dummy/
git commit -m "feat: add ProductCard component and per-category dummy data"
```

---

### Task 3: 페이지에서 ProductCard 적용 (중복 코드 제거)

**Files:**
- Modify: `app/products/page.tsx`
- Modify: `app/category/[id]/page.tsx`
- Modify: `app/category/[id]/[sub]/page.tsx`
- Modify: `app/sale/page.tsx`

- [ ] **Step 1: `app/products/page.tsx` 교체**

파일 전체를 아래로 교체:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/lib/data";
import { ALL_DUMMY_PRODUCTS, getDummyByCategory } from "@/lib/dummy";
import { ProductCard } from "@/components/ui/ProductCard";

export const metadata: Metadata = {
  title: "All Products — PawPalace",
  description: "Shop 500+ premium pet products for dogs, cats, birds, fish & more.",
};

interface Props {
  searchParams: { category?: string };
}

export default function ProductsPage({ searchParams }: Props) {
  const activeCategory = searchParams.category ?? null;
  const products = activeCategory
    ? getDummyByCategory(activeCategory)
    : ALL_DUMMY_PRODUCTS;

  return (
    <main className="section-padding">
      <div className="container-site">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold text-slate-900 mb-2">
            {activeCategory
              ? (CATEGORIES.find((c) => c.id === activeCategory)?.label ?? "Products")
              : "All Products"}
          </h1>
          <p className="text-slate-500">{products.length} products</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/products"
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              !activeCategory
                ? "bg-amber-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600"
            }`}
          >
            All
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat.id
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600"
              }`}
            >
              {cat.emoji} {cat.label}
            </Link>
          ))}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">No products found.</p>
            <Link href="/products" className="mt-4 inline-block text-amber-600 hover:underline">View all products</Link>
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: `app/category/[id]/page.tsx` 교체**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { getDummyByCategory } from "@/lib/dummy";
import { ProductCard } from "@/components/ui/ProductCard";

interface Props {
  params: { id: string };
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = CATEGORIES.find((c) => c.id === params.id);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.label} — PawPalace`,
    description: `Shop ${category.productCount} products for ${category.label.toLowerCase()}.`,
  };
}

export default function CategoryPage({ params }: Props) {
  const category = CATEGORIES.find((c) => c.id === params.id);
  if (!category) notFound();

  const products = getDummyByCategory(params.id);

  return (
    <main className="section-padding">
      <div className="container-site">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 font-medium capitalize">{category.label}</span>
        </nav>

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-600 transition-colors mb-6 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
          Back to home
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <span className="text-5xl" aria-hidden="true">{category.emoji}</span>
          <div>
            <h1 className="font-display text-4xl font-bold text-slate-900">{category.label}</h1>
            <p className="text-slate-500 mt-1">{products.length} products</p>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">No products found in this category yet.</p>
            <Link href="/" className="mt-4 inline-block text-amber-600 hover:underline">Back to home</Link>
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: `app/category/[id]/[sub]/page.tsx` 교체**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CATEGORIES, NAV_ITEMS } from "@/lib/data";
import { getDummyByCategorySub } from "@/lib/dummy";
import { ProductCard } from "@/components/ui/ProductCard";

interface Props {
  params: { id: string; sub: string };
}

function getSubLabel(categoryId: string, sub: string): string | null {
  const navItem = NAV_ITEMS.find((n) => n.href === `/category/${categoryId}`);
  const child = navItem?.children?.find((c) => c.href === `/category/${categoryId}/${sub}`);
  return child?.label ?? null;
}

export async function generateStaticParams() {
  const params: { id: string; sub: string }[] = [];
  for (const navItem of NAV_ITEMS) {
    if (navItem.children) {
      for (const child of navItem.children) {
        const parts = child.href.split("/").filter(Boolean);
        if (parts.length === 3) params.push({ id: parts[1], sub: parts[2] });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = CATEGORIES.find((c) => c.id === params.id);
  const subLabel = getSubLabel(params.id, params.sub);
  if (!category || !subLabel) return { title: "Category not found" };
  return {
    title: `${subLabel} — ${category.label} | PawPalace`,
    description: `Shop ${subLabel.toLowerCase()} for ${category.label.toLowerCase()} at PawPalace.`,
  };
}

export default function CategorySubPage({ params }: Props) {
  const category = CATEGORIES.find((c) => c.id === params.id);
  const subLabel = getSubLabel(params.id, params.sub);
  if (!category || !subLabel) notFound();

  const products = getDummyByCategorySub(params.id, params.sub);

  return (
    <main className="section-padding">
      <div className="container-site">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/category/${category.id}`} className="hover:text-amber-600 transition-colors capitalize">
            {category.label}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 font-medium">{subLabel}</span>
        </nav>

        <Link href={`/category/${category.id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-600 transition-colors mb-6 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
          Back to {category.label}
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <span className="text-5xl" aria-hidden="true">{category.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-amber-600 mb-1">{category.label}</p>
            <h1 className="font-display text-4xl font-bold text-slate-900">{subLabel}</h1>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">No products found in this subcategory yet.</p>
            <Link href={`/category/${category.id}`} className="mt-4 inline-block text-amber-600 hover:underline">
              View all {category.label} products
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: `app/sale/page.tsx` 교체**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Tag } from "lucide-react";
import { ALL_DUMMY_PRODUCTS } from "@/lib/dummy";
import { ProductCard } from "@/components/ui/ProductCard";

export const metadata: Metadata = {
  title: "Sale — PawPalace",
  description: "Shop discounted pet products. Save big on premium pet supplies.",
};

export default function SalePage() {
  const saleProducts = ALL_DUMMY_PRODUCTS.filter((p) => p.originalPrice);

  return (
    <main className="section-padding">
      <div className="container-site">
        <div className="flex items-center gap-4 mb-10">
          <span className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-100 text-red-500">
            <Tag size={24} />
          </span>
          <div>
            <h1 className="font-display text-4xl font-bold text-slate-900">Sale</h1>
            <p className="text-slate-500 mt-1">{saleProducts.length} discounted products</p>
          </div>
        </div>

        {saleProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {saleProducts.map((p) => <ProductCard key={p.id} product={p} showDiscountBadge />)}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">No sale items at the moment. Check back soon!</p>
            <Link href="/products" className="mt-4 inline-block text-amber-600 hover:underline">Browse all products</Link>
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 5: 커밋**

```bash
git add app/products/page.tsx app/category/ app/sale/page.tsx
git commit -m "refactor: replace inline product cards with ProductCard component"
```

---

### Task 4: Link 태그 통일 (Header, Footer, product detail)

**Files:**
- Modify: `components/layout/Header.tsx`
- Modify: `components/layout/Footer.tsx`
- Modify: `app/products/[id]/page.tsx`

- [ ] **Step 1: `components/layout/Header.tsx` — import에 Link 추가, 내부 href를 Link로 교체**

파일 상단 import에 추가:
```tsx
import Link from "next/link";
```

내부 링크 교체 (로고, 네비게이션, 계정 드롭다운, 모바일 메뉴의 모든 내부 `<a href>` → `<Link href>`):
- `<a href="/" ...>` → `<Link href="/" ...>`
- `<a href={item.href} ...>` → `<Link href={item.href} ...>`
- `<a href={child.href} ...>` → `<Link href={child.href} ...>`
- `<a href="/account" ...>` → `<Link href="/account" ...>`
- `<a href="/account/orders" ...>` → `<Link href="/account/orders" ...>`
- `<a href="/login" ...>` → `<Link href="/login" ...>`
- `<a href="/signup" ...>` → `<Link href="/signup" ...>`

외부 링크(`mailto:`, `tel:`, `#`)는 `<a>` 유지.

- [ ] **Step 2: `components/layout/Footer.tsx` — import에 Link 추가, 내부 href를 Link로 교체**

파일 상단 import에 추가:
```tsx
import Link from "next/link";
```

FOOTER_LINKS의 모든 `<a href=...>` → `<Link href=...>` 교체.
단, `mailto:`, `tel:`, 소셜 링크(`#`)는 `<a>` 유지.

- [ ] **Step 3: `app/products/[id]/page.tsx` — `<a>` → `<Link>` 교체**

```tsx
// 기존 (line 39-41)
<a href="/" className="hover:text-amber-600 transition-colors">Home</a>
// 교체
<Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>

// 기존 (line 41)
<a href={`/products?category=${product.category}`} ...>{product.category}</a>
// 교체
<Link href={`/products?category=${product.category}`} ...>{product.category}</Link>

// 기존 (line 47)
<a href="/products" ...>Back to products</a>
// 교체
<Link href="/products" ...>Back to products</Link>
```

파일 상단 import에 `Link` 추가:
```tsx
import Link from "next/link";
```

- [ ] **Step 4: 커밋**

```bash
git add components/layout/Header.tsx components/layout/Footer.tsx app/products/
git commit -m "fix: replace <a> with Next.js <Link> for client-side navigation"
```

---

### Task 5: robots.ts & sitemap.ts 생성

**Files:**
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`

- [ ] **Step 1: `app/robots.ts` 생성**

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/"],
      },
    ],
    sitemap: "https://pawpalace.com/sitemap.xml",
  };
}
```

- [ ] **Step 2: `app/sitemap.ts` 생성**

```ts
import type { MetadataRoute } from "next";
import { CATEGORIES, NAV_ITEMS } from "@/lib/data";
import { ALL_DUMMY_PRODUCTS } from "@/lib/dummy";

const BASE_URL = "https://pawpalace.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/sale`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${BASE_URL}/category/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const subCategoryPages: MetadataRoute.Sitemap = NAV_ITEMS.flatMap((item) =>
    (item.children ?? []).map((child) => ({
      url: `${BASE_URL}${child.href}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  const productPages: MetadataRoute.Sitemap = ALL_DUMMY_PRODUCTS.map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticPages, ...categoryPages, ...subCategoryPages, ...productPages];
}
```

- [ ] **Step 3: 개발 서버에서 확인**

브라우저에서 `http://localhost:3000/robots.txt` 및 `http://localhost:3000/sitemap.xml` 접속 → 내용 확인.

- [ ] **Step 4: 커밋**

```bash
git add app/robots.ts app/sitemap.ts
git commit -m "feat: add robots.txt and sitemap.xml via Next.js MetadataRoute"
```

---

### Task 6: 누락 메타데이터 보완 + Product JSON-LD

**Files:**
- Modify: `app/(auth)/login/page.tsx`
- Modify: `app/(auth)/signup/page.tsx`
- Modify: `app/products/[id]/page.tsx`

- [ ] **Step 1: `app/(auth)/login/page.tsx` — metadata export 추가**

파일 상단에 추가 (기존 `"use client"` 제거 후 서버 컴포넌트로 전환 가능하지만, 현재는 metadata만 추가):

```tsx
export const metadata = {
  title: "Sign In — PawPalace",
  description: "Sign in to your PawPalace account to track orders and manage your pets' favourites.",
  robots: { index: false, follow: false },
};
```

- [ ] **Step 2: `app/(auth)/signup/page.tsx` — metadata export 추가**

```tsx
export const metadata = {
  title: "Create Account — PawPalace",
  description: "Join PawPalace for exclusive deals, order tracking, and personalised pet recommendations.",
  robots: { index: false, follow: false },
};
```

- [ ] **Step 3: `app/products/[id]/page.tsx` — Product JSON-LD schema 추가**

`generateMetadata` 함수 아래, `export default function` 위에 추가:

```tsx
function buildProductJsonLd(product: ReturnType<typeof FEATURED_PRODUCTS.find>) {
  if (!product) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };
}
```

그리고 `ProductDetailPage` 컴포넌트 내 `<main>` 앞에 추가:

```tsx
const jsonLd = buildProductJsonLd(product);

return (
  <>
    {jsonLd && (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    )}
    <main className="section-padding">
      {/* ... 기존 내용 ... */}
    </main>
  </>
);
```

- [ ] **Step 4: 커밋**

```bash
git add app/\(auth\)/ app/products/
git commit -m "feat: add missing metadata and Product JSON-LD schema"
```

---

## 완료 체크리스트

- [ ] `ProductCard` 컴포넌트 생성됨
- [ ] `lib/dummy/` 카테고리별 더미 데이터 분리됨
- [ ] 4개 페이지에서 중복 ProductCard 코드 제거됨
- [ ] Header/Footer 내부 링크 `<Link>` 사용
- [ ] Product detail 페이지 내부 링크 `<Link>` 사용
- [ ] `/robots.txt` 접근 가능
- [ ] `/sitemap.xml` 접근 가능
- [ ] login/signup 메타데이터 추가됨
- [ ] 제품 상세 페이지 JSON-LD 추가됨
