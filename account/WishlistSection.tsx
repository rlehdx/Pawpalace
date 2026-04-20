"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export function WishlistSection() {
  return (
    <section className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <Heart size={18} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Wishlist</h2>
          <p className="text-sm text-slate-500">Products you have saved for later.</p>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center">
        <p className="text-sm text-slate-600 mb-3">Your wishlist is currently empty.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors"
        >
          Browse products
        </Link>
      </div>
    </section>
  );
}
