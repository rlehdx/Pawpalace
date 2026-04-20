"use client";

import { CartContext, useCartState } from "@/lib/cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cartState = useCartState();
  return (
    <CartContext.Provider value={cartState}>
      {children}
    </CartContext.Provider>
  );
}
