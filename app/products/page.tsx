import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/lib/data";
import { ALL_DUMMY_PRODUCTS, getDummyByCategory } from "@/lib/dummy";
import { ProductCard } from "@/components/ui/ProductCard";

export const metadata: Metadata = {
  title: "All Products — PawPalace",
  description: "Shop 500+ premium pet products for dogs, cats, birds, fish & more.",
};

interface Props {
  searchParams: { category?: string };
}

export default function ProductsPage({ searchParams }: Props) {
  const activeCategory = searchParams.category ?? null;
  const products = activeCategory
    ? getDummyByCategory(activeCategory)
    : ALL_DUMMY_PRODUCTS;

  return (
    <main className="section-padding">
      <div className="container-site">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold text-slate-900 mb-2">
            {activeCategory
              ? (CATEGORIES.find((c) => c.id === activeCategory)?.label ?? "Products")
              : "All Products"}
          </h1>
          <p className="text-slate-500">{products.length} products</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/products"
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              !activeCategory
                ? "bg-amber-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600"
            }`}
          >
            All
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat.id
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600"
              }`}
            >
              {cat.emoji} {cat.label}
            </Link>
          ))}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">No products found.</p>
            <Link href="/products" className="mt-4 inline-block text-amber-600 hover:underline">View all products</Link>
          </div>
        )}
      </div>
    </main>
  );
}
