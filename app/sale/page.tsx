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
