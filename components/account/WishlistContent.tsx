"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { getProductById } from "@/lib/data";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function WishlistContent() {
  const { ids, remove } = useWishlist();
  const { addItem, setIsOpen } = useCart();
  const { toast } = useToast();

  const products = ids
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => p != null);

  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-card px-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-amber-100 text-amber-500 mx-auto mb-4">
          <Heart size={28} />
        </div>
        <h2 className="font-semibold text-slate-900 text-lg mb-2">Your wishlist is empty</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
          Tap the heart on any product while you shop—we&apos;ll keep your favorites here, like a typical pet supply store account.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-colors"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3" aria-label="Wishlist items">
      {products.map((product) => (
        <li
          key={product.id}
          className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white rounded-2xl shadow-card border border-slate-100"
        >
          <Link href={`/products/${product.slug}`} className="flex gap-4 min-w-0 flex-1 group">
            <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100">
              <Image
                src={product.images[0] ?? ""}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="96px"
              />
            </div>
            <div className="min-w-0 py-0.5">
              <p className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                {product.name}
              </p>
              <p className="text-sm text-slate-500 mt-1 capitalize">{product.category.replace("-", " ")}</p>
              <p className="text-base font-bold text-slate-900 mt-2">{formatPrice(product.price)}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-stretch sm:w-40">
            <Button
              type="button"
              size="sm"
              className="flex-1 sm:flex-none"
              icon={<ShoppingCart size={16} />}
              onClick={() => {
                addItem(product, 1);
                toast({ type: "success", title: "Added to cart", message: product.name });
                setIsOpen(true);
              }}
            >
              Add to cart
            </Button>
            <button
              type="button"
              onClick={() => {
                remove(product.id);
                toast({ type: "info", title: "Removed", message: `${product.name} removed from wishlist.` });
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Trash2 size={16} aria-hidden />
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
