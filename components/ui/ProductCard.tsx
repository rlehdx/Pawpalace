import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductBadge } from "@/components/ui/Badge";

interface ProductCardProps {
  product: Product;
  /**
   * true일 때: 이미지 우측 상단에 할인율 배지 표시 + 가격 텍스트를 빨간색으로 강조
   * false(기본값): 가격 영역에 할인율(%) 텍스트는 여전히 표시되나 색상 강조 없음
   */
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
          src={product.images[0] ?? "/images/placeholder.png"}
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
          <span className="sr-only">Rating: {product.rating} out of 5</span>
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
