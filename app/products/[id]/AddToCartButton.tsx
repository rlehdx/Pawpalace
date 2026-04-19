"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem, setIsOpen } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, 1);
    setIsOpen(true);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      onClick={handleAdd}
      className={cn(
        "flex items-center justify-center gap-2.5",
        "w-full py-4 rounded-2xl text-base font-bold",
        "transition-all duration-200 shadow-warm",
        added
          ? "bg-emerald-500 text-white"
          : "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-glow"
      )}
      aria-label={added ? "Added to cart" : `Add ${product.name} to cart`}
    >
      {added ? (
        <><Check size={20} aria-hidden="true" /> Added to Cart!</>
      ) : (
        <><ShoppingCart size={20} aria-hidden="true" /> Add to Cart</>
      )}
    </button>
  );
}
