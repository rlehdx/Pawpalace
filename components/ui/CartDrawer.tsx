"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart, createCheckoutSession } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    qualifiesForFreeShipping,
    amountToFreeShipping,
  } = useCart();

  const [checkingOut, setCheckingOut] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Close on ESC key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, setIsOpen]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  async function handleCheckout() {
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
      const url = await createCheckoutSession(items);
      window.location.href = url;
    } catch {
      toast({ type: "error", title: "Checkout failed", message: "Please sign in and try again." });
    } finally {
      setCheckingOut(false);
    }
  }

  const freeShippingProgress = Math.min((subtotal / 49) * 100, 100);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-white z-50",
          "flex flex-col shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-amber-500" />
            <h2 className="font-display text-xl font-bold text-slate-900">
              Your Cart
            </h2>
            {totalItems > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free shipping progress */}
        {!qualifiesForFreeShipping && items.length > 0 && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
            <p className="text-xs text-amber-700 mb-1.5">
              Add{" "}
              <span className="font-bold">
                ${amountToFreeShipping.toFixed(2)}
              </span>{" "}
              more for free shipping!
            </p>
            <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}
        {qualifiesForFreeShipping && items.length > 0 && (
          <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100">
            <p className="text-xs text-emerald-700 font-semibold">
              🎉 You qualify for free shipping!
            </p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                <ShoppingCart size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">
                Your cart is empty
              </p>
              <Link
                href="/products"
                onClick={() => setIsOpen(false)}
                className="text-sm text-amber-600 font-semibold hover:underline"
              >
                Continue shopping →
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-4">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🐾
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-tight">
                      {product.name}
                    </p>
                    <p className="text-sm font-bold text-amber-600 mt-1">
                      ${(product.price * quantity).toFixed(2)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(product.id, quantity - 1)
                        }
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(product.id, quantity + 1)
                        }
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors shrink-0"
                    aria-label={`Remove ${product.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600 text-sm">Subtotal</span>
              <span className="font-bold text-slate-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            {qualifiesForFreeShipping ? (
              <p className="text-xs text-emerald-600 font-medium mb-4">
                Shipping: Free 🎉
              </p>
            ) : (
              <p className="text-xs text-slate-400 mb-4">
                Shipping calculated at checkout
              </p>
            )}
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "py-3.5 rounded-2xl text-sm font-bold",
                "bg-amber-500 text-white",
                "hover:bg-amber-600 transition-all duration-200",
                "shadow-warm hover:shadow-glow",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {checkingOut ? (
                "Processing..."
              ) : (
                <>
                  Checkout <ArrowRight size={16} />
                </>
              )}
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
