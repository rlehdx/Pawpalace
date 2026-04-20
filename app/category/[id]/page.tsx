import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { getDummyByCategory } from "@/lib/dummy";
import { ProductCard } from "@/components/ui/ProductCard";

interface Props {
  params: { id: string };
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = CATEGORIES.find((c) => c.id === params.id);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.label} — PawPalace`,
    description: `Shop ${category.productCount} products for ${category.label.toLowerCase()}.`,
  };
}

export default function CategoryPage({ params }: Props) {
  const category = CATEGORIES.find((c) => c.id === params.id);
  if (!category) notFound();

  const products = getDummyByCategory(params.id);

  return (
    <main className="section-padding">
      <div className="container-site">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 font-medium capitalize">{category.label}</span>
        </nav>

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-600 transition-colors mb-6 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
          Back to home
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <span className="text-5xl" aria-hidden="true">{category.emoji}</span>
          <div>
            <h1 className="font-display text-4xl font-bold text-slate-900">{category.label}</h1>
            <p className="text-slate-500 mt-1">{products.length} products</p>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">No products found in this category yet.</p>
            <Link href="/" className="mt-4 inline-block text-amber-600 hover:underline">Back to home</Link>
          </div>
        )}
      </div>
    </main>
  );
}
