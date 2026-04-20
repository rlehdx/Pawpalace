import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CATEGORIES, NAV_ITEMS } from "@/lib/data";
import { getDummyByCategorySub } from "@/lib/dummy";
import { ProductCard } from "@/components/ui/ProductCard";

interface Props {
  params: { id: string; sub: string };
}

function getSubLabel(categoryId: string, sub: string): string | null {
  const navItem = NAV_ITEMS.find((n) => n.href === `/category/${categoryId}`);
  const child = navItem?.children?.find((c) => c.href === `/category/${categoryId}/${sub}`);
  return child?.label ?? null;
}

export async function generateStaticParams() {
  const params: { id: string; sub: string }[] = [];
  for (const navItem of NAV_ITEMS) {
    if (navItem.children) {
      for (const child of navItem.children) {
        const parts = child.href.split("/").filter(Boolean);
        if (parts.length === 3) params.push({ id: parts[1], sub: parts[2] });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = CATEGORIES.find((c) => c.id === params.id);
  const subLabel = getSubLabel(params.id, params.sub);
  if (!category || !subLabel) return { title: "Category not found" };
  return {
    title: `${subLabel} — ${category.label} | PawPalace`,
    description: `Shop ${subLabel.toLowerCase()} for ${category.label.toLowerCase()} at PawPalace.`,
  };
}

export default function CategorySubPage({ params }: Props) {
  const category = CATEGORIES.find((c) => c.id === params.id);
  const subLabel = getSubLabel(params.id, params.sub);
  if (!category || !subLabel) notFound();

  const products = getDummyByCategorySub(params.id, params.sub);

  return (
    <main className="section-padding">
      <div className="container-site">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/category/${category.id}`} className="hover:text-amber-600 transition-colors capitalize">
            {category.label}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 font-medium">{subLabel}</span>
        </nav>

        <Link href={`/category/${category.id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-600 transition-colors mb-6 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
          Back to {category.label}
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <span className="text-5xl" aria-hidden="true">{category.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-amber-600 mb-1">{category.label}</p>
            <h1 className="font-display text-4xl font-bold text-slate-900">{subLabel}</h1>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">No products found in this subcategory yet.</p>
            <Link href={`/category/${category.id}`} className="mt-4 inline-block text-amber-600 hover:underline">
              View all {category.label} products
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
