"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { ShoppingCart, Heart, Eye, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ProductBadge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/Card";
import { FEATURED_PRODUCTS } from "@/lib/data";
import { formatPrice, calcDiscount } from "@/lib/utils";
import type { Product, PetCategory } from "@/lib/types";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

const FILTER_TABS: { label: string; value: PetCategory | "all" }[] = [
  { label: "All",      value: "all" },
  { label: "🐕 Dogs",  value: "dog" },
  { label: "🐈 Cats",  value: "cat" },
  { label: "🦜 Birds", value: "bird" },
  { label: "🐠 Fish",  value: "fish" },
];

export function ProductShowcase() {
  const [activeFilter, setActiveFilter]   = useState<PetCategory | "all">("all");
  const [wishlist, setWishlist]           = useState<Set<string>>(new Set());
  const [addedToCart, setAddedToCart]     = useState<Set<string>>(new Set());
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const filteredProducts = activeFilter === "all"
    ? FEATURED_PRODUCTS
    : FEATURED_PRODUCTS.filter((p) => p.category === activeFilter);

  function toggleWishlist(id: string) {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

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

  return (
    <section
      className="section-padding bg-white"
      aria-labelledby="products-heading"
    >
      <div className="container-site">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-10">
          <div className="max-w-lg">
            <div className="section-label mb-5">
              <span aria-hidden="true">✦</span> Featured Products
            </div>
            <h2
              id="products-heading"
              className="font-display text-4xl sm:text-5xl font-bold text-slate-900"
            >
              Our pets{" "}
              <span className="text-gradient italic">can't get enough</span>
            </h2>
          </div>
          <a
            href="/products"
            className="group flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors shrink-0"
          >
            View all products
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </div>

        {/* Filter Tabs */}
        <div
          className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none"
          role="tablist"
          aria-label="Filter products by category"
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={activeFilter === tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                "shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold",
                "transition-all duration-200",
                activeFilter === tab.value
                  ? "bg-amber-500 text-white shadow-warm"
                  : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 xl:gap-8"
          role="list"
          aria-label="Products"
        >
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-medium">No products found in this category.</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <a
            href="/products"
            className={cn(
              "inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl",
              "bg-slate-900 text-white text-sm font-bold",
              "hover:bg-slate-800 transition-colors shadow-deep",
            )}
          >
            Browse All 500+ Products
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   PRODUCT CARD
   ============================================ */
interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  isAddedToCart: boolean;
  isHovered: boolean;
  onWishlistToggle: () => void;
  onAddToCart: () => void;
  onHover: (id: string | null) => void;
  style?: React.CSSProperties;
}

function ProductCard({
  product,
  isWishlisted,
  isAddedToCart,
  isHovered,
  onWishlistToggle,
  onAddToCart,
  onHover,
  style,
}: ProductCardProps) {
  const discount = product.originalPrice
    ? calcDiscount(product.originalPrice, product.price)
    : null;

  // On hover, show second image if available
  const displayImage = isHovered && product.images[1]
    ? product.images[1]
    : product.images[0];

  return (
    <article
      role="listitem"
      className={cn(
        "group relative bg-white rounded-2xl overflow-hidden",
        "border border-slate-100",
        "shadow-card hover:shadow-lifted hover:border-amber-100",
        "transition-all duration-300 hover:-translate-y-1.5",
        "flex flex-col"
      )}
      style={style}
      onMouseEnter={() => onHover(product.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <Image
          src={displayImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-600 ease-smooth group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <ProductBadge type={product.badge} />
          </div>
        )}

        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
            -{discount}%
          </div>
        )}

        {/* Hover actions overlay */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-end justify-start p-3 gap-2",
            "transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0"
          )}
          aria-hidden="true"
        >
          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); onWishlistToggle(); }}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center",
              "backdrop-blur-sm shadow-sm border",
              "transition-all duration-200",
              isWishlisted
                ? "bg-red-500 border-red-400 text-white"
                : "bg-white/90 border-white/50 text-slate-600 hover:text-red-500"
            )}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
          </button>

          {/* Quick view */}
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/90 backdrop-blur-sm border border-white/50 text-slate-600 hover:text-amber-600 shadow-sm transition-all duration-200"
            aria-label="Quick view"
          >
            <Eye size={16} />
          </button>
        </div>

        {/* Free shipping badge */}
        {product.freeShipping && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-2 py-1 bg-emerald-500 text-white text-2xs font-bold rounded-lg">
              Free Ship
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category */}
        <p className="text-2xs font-bold text-amber-600 uppercase tracking-widest mb-1.5">
          {product.category}
        </p>

        {/* Product Name */}
        <h3 className="font-body font-semibold text-slate-900 text-sm leading-snug mb-2 line-clamp-2">
          <a
            href={`/products/${product.slug}`}
            className="hover:text-amber-600 transition-colors"
          >
            {product.name}
          </a>
        </h3>

        {/* Rating */}
        <div className="mb-3">
          <StarRating
            rating={product.rating}
            reviewCount={product.reviewCount}
            size="sm"
          />
        </div>

        {/* Price Row + CTA */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-lg text-slate-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onAddToCart}
            className={cn(
              "flex items-center justify-center gap-1.5",
              "px-3 py-2 rounded-xl text-xs font-bold",
              "transition-all duration-200 shrink-0",
              isAddedToCart
                ? "bg-emerald-500 text-white"
                : "bg-amber-500 text-white hover:bg-amber-600 shadow-warm"
            )}
            aria-label={isAddedToCart ? "Added to cart" : `Add ${product.name} to cart`}
          >
            {isAddedToCart ? (
              <>
                <Check size={13} aria-hidden="true" /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={13} aria-hidden="true" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductShowcase;
