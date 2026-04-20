import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/data";

export const metadata: Metadata = {
  title: "All Categories — PawPalace",
  description: "Browse all pet categories at PawPalace.",
};

export default function CategoriesPage() {
  return (
    <main className="section-padding">
      <div className="container-site">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold text-slate-900">All Categories</h1>
          <p className="text-slate-500 mt-2">Find everything your pet needs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="group relative overflow-hidden rounded-3xl min-h-[220px] shadow-card hover:shadow-lifted transition-shadow duration-300 block"
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-3xl block mb-1" aria-hidden="true">{cat.emoji}</span>
                <h2 className="font-display text-2xl font-bold text-white">{cat.label}</h2>
                <p className="text-amber-300 text-sm font-semibold mt-1">{cat.productCount} products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
