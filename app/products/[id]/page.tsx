import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Star, Truck, RotateCcw, Shield, ChevronLeft } from "lucide-react";
import { FEATURED_PRODUCTS } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { ProductBadge } from "@/components/ui/Badge";

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
          <span aria-hidden="true">/</span>
          <a href={`/category/${product.category}`} className="hover:text-amber-600 transition-colors capitalize">{product.category}</a>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 font-medium truncate">{product.name}</span>
        </nav>

        {/* Back */}
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-600 transition-colors mb-6 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
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
                  <ProductBadge type={product.badge} />
                </div>
              )}
            </div>
            {product.images[1] && (
              <div className="grid grid-cols-2 gap-4">
                {product.images.slice(1).map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 shadow-card cursor-pointer hover:-translate-y-1 transition-transform duration-200"
                  >
                    <Image
                      src={img}
                      alt={`${product.name} 이미지 ${i + 2}`}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
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
              <div className="flex items-center gap-1" aria-label={`별점 ${product.rating}점`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    aria-hidden="true"
                    className={i < Math.floor(product.rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 fill-slate-200"}
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
            <div className="flex flex-wrap gap-2" aria-label="상품 태그">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3 pt-2">
              <Button size="lg" fullWidth icon={<ShoppingCart size={18} aria-hidden="true" />}>
                장바구니에 담기
              </Button>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              {[
                { icon: <Truck size={16} aria-hidden="true" />, label: product.freeShipping ? "무료 배송" : "$49 이상 무료배송" },
                { icon: <RotateCcw size={16} aria-hidden="true" />, label: "30일 반품 보장" },
                { icon: <Shield size={16} aria-hidden="true" />, label: "안전한 결제" },
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
