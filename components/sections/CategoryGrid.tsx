"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/data";

export function CategoryGrid() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section
      className="section-padding bg-brand-cream"
      aria-labelledby="categories-heading"
    >
      <div className="container-site">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
          <div className="max-w-lg">
            <div className="section-label mb-5">
              <span aria-hidden="true">✦</span> Browse By Pet
            </div>
            <h2
              id="categories-heading"
              className="font-display text-4xl sm:text-5xl font-bold text-slate-900"
            >
              Shop by{" "}
              <span className="text-gradient italic">furry friend</span>
            </h2>
          </div>
          <a
            href="/categories"
            className="group flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors shrink-0"
          >
            View all categories
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform duration-200"
              aria-hidden="true"
            />
          </a>
        </div>

        {/* Grid Layout */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-6 2xl:gap-8"
          role="list"
          aria-label="Pet categories"
        >
          {/* Large featured card — Dogs */}
          <a
            href={`/category/${CATEGORIES[0].id}`}
            role="listitem"
            onMouseEnter={() => setHoveredId(CATEGORIES[0].id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              "group relative col-span-2 md:col-span-2 md:row-span-1 lg:col-span-2 lg:row-span-2",
              "overflow-hidden rounded-3xl",
              "min-h-[280px] lg:min-h-[400px]",
              "block",
              "shadow-card hover:shadow-lifted transition-shadow duration-300"
            )}
            aria-label={`${CATEGORIES[0].label} — ${CATEGORIES[0].productCount} products`}
          >
            <Image
              src={CATEGORIES[0].image}
              alt={CATEGORIES[0].label}
              fill
              className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-108"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="text-4xl block mb-2" aria-hidden="true">
                {CATEGORIES[0].emoji}
              </span>
              <h3 className="font-display text-3xl font-bold text-white mb-1">
                {CATEGORIES[0].label}
              </h3>
              <p className="text-amber-300 text-sm font-semibold mb-4">
                {CATEGORIES[0].productCount} products
              </p>
              <div
                className={cn(
                  "flex items-center gap-2 text-white text-sm font-semibold",
                  "transition-all duration-300",
                  hoveredId === CATEGORIES[0].id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                )}
                aria-hidden="true"
              >
                Shop now <ArrowRight size={14} />
              </div>
            </div>

            {/* Color overlay on hover */}
            <div
              className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
              aria-hidden="true"
            />
          </a>

          {/* Smaller category cards */}
          {CATEGORIES.slice(1).map((cat) => (
            <a
              key={cat.id}
              href={`/category/${cat.id}`}
              role="listitem"
              onMouseEnter={() => setHoveredId(cat.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "group relative overflow-hidden rounded-2xl",
                "min-h-[160px] sm:min-h-[180px]",
                "shadow-card hover:shadow-lifted",
                "transition-all duration-300 hover:-translate-y-1",
                "block"
              )}
              aria-label={`${cat.label} — ${cat.productCount} products`}
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                className="object-cover transition-transform duration-600 ease-smooth group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 to-slate-900/10" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-2xl block mb-1" aria-hidden="true">
                  {cat.emoji}
                </span>
                <h3 className="font-display font-bold text-white text-base leading-tight">
                  {cat.label}
                </h3>
                <p className="text-white/70 text-xs mt-0.5">
                  {cat.productCount} items
                </p>
              </div>

              {/* Color accent overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `${cat.color}25` }}
                aria-hidden="true"
              />
            </a>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <a
            href="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors"
          >
            View All Categories <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;
