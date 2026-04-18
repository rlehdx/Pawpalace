"use client";

/**
 * Cart State Management
 * Simple in-memory cart with localStorage persistence.
 * In production, integrate with Stripe via /app/api/checkout/route.ts
 */

import { useState, useEffect, useCallback } from "react";
import type { CartItem, Product } from "./types";

const CART_STORAGE_KEY = "paw-palace-cart";

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    setItems(loadCartFromStorage());
  }, []);

  // Persist on change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const freeShippingThreshold = 49;
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return {
    items,
    isOpen,
    setIsOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    qualifiesForFreeShipping,
    amountToFreeShipping,
  };
}

/* ============================================
   STRIPE CHECKOUT SKELETON
   Replace these with real Stripe integration:

   1. Install: npm install @stripe/stripe-js stripe
   2. Add env vars: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY
   3. Create /app/api/checkout/route.ts
   4. Use loadStripe() + redirectToCheckout()
   ============================================ */
export async function createCheckoutSession(items: CartItem[]): Promise<string> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((item) => ({
        productId: item.product.id,
        name:      item.product.name,
        price:     item.product.price,
        quantity:  item.quantity,
        image:     item.product.images[0],
      })),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create checkout session");
  }

  const { url } = await response.json();
  return url;
}
