"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Play, Star, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const HERO_SLIDES = [
  {
    id: 1,
    tag: "New Collection 2026",
    headline: "Your Pet Deserves\nThe Very Best",
    subheadline: "Premium pet supplies chosen by vets, loved by pets — delivered to your door in 2 days.",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=85",
    imageAlt: "Happy golden retriever with premium pet products",
    accent: "amber",
    cta: { label: "Shop Dogs",  href: "/category/dog" },
    secondaryCta: { label: "Watch Story", href: "#" },
    stats: [
      { value: "50K+", label: "Happy Pets" },
      { value: "4.9★", label: "Avg. Rating" },
      { value: "2-Day", label: "Delivery" },
    ],
  },
  {
    id: 2,
    tag: "Feline Collection",
    headline: "Spoil Your Cat\nBeyond Purr-fection",
    subheadline: "Curated cat essentials — from gourmet treats to luxury beds. Because every cat is royalty.",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&q=85",
    imageAlt: "Elegant cat with premium cat products",
    accent: "emerald",
    cta: { label: "Shop Cats",  href: "/category/cat" },
    secondaryCta: { label: "View Lookbook", href: "#" },
    stats: [
      { value: "186+", label: "Cat Products" },
      { value: "Free", label: "Over $49" },
      { value: "30-Day", label: "Returns" },
    ],
  },
];

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(interval);
  }, [activeSlide]);

  function nextSlide() {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      setIsTransitioning(false);
    }, 300);
  }

  function goToSlide(index: number) {
    if (index === activeSlide) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSlide(index);
      setIsTransitioning(false);
    }, 300);
  }

  const slide = HERO_SLIDES[activeSlide];

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-900"
      aria-label="Hero banner"
    >
      {/* Background Image */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}
      >
        <Image
          src={slide.image}
          alt={slide.imageAlt}
          fill
          priority
          quality={90}
          className="object-cover object-center scale-105"
          sizes="100vw"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
      </div>

      {/* Decorative orb */}
      <div
        className={cn(
          "absolute top-1/2 right-16 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none",
          slide.accent === "amber" ? "bg-amber-400" : "bg-emerald-400"
        )}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative container-site min-h-[90vh] flex flex-col justify-center py-24">
        <div className="max-w-2xl space-y-8">

          {/* Label */}
          <div
            className={cn(
              "section-label animate-fade-down animate-fill-both",
              slide.accent === "emerald" && "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
            )}
          >
            <span aria-hidden="true">✦</span>
            {slide.tag}
          </div>

          {/* Headline */}
          <h1
            className={cn(
              "font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05]",
              "whitespace-pre-line",
              "animate-fade-up animate-fill-both animate-delay-100"
            )}
          >
            {slide.headline.split("\n").map((line, i) => (
              <span key={i} className="block">
                {i === 1 ? (
                  <span
                    className={cn(
                      "italic",
                      slide.accent === "amber" ? "text-amber-400" : "text-emerald-400"
                    )}
                  >
                    {line}
                  </span>
                ) : line}
              </span>
            ))}
          </h1>

          {/* Subheadline */}
          <p
            className={cn(
              "text-slate-300 text-lg sm:text-xl leading-relaxed max-w-lg",
              "animate-fade-up animate-fill-both animate-delay-200"
            )}
          >
            {slide.subheadline}
          </p>

          {/* CTAs */}
          <div
            className={cn(
              "flex flex-wrap items-center gap-4",
              "animate-fade-up animate-fill-both animate-delay-300"
            )}
          >
            <Button
              size="lg"
              variant={slide.accent === "emerald" ? "secondary" : "primary"}
              icon={<ArrowRight size={18} />}
              iconPosition="right"
              className="font-bold shadow-deep"
              onClick={() => { window.location.href = slide.cta.href; }}
            >
              {slide.cta.label}
            </Button>

            <button
              className="flex items-center gap-2.5 text-white/90 hover:text-white transition-colors group"
              onClick={() => { window.location.href = slide.secondaryCta.href; }}
            >
              <span
                className={cn(
                  "w-11 h-11 rounded-full border-2 border-white/30 flex items-center justify-center",
                  "group-hover:border-amber-400 group-hover:bg-amber-400/20 transition-all duration-300",
                  "backdrop-blur-sm"
                )}
              >
                <Play size={16} fill="currentColor" className="ml-0.5" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold">{slide.secondaryCta.label}</span>
            </button>
          </div>

          {/* Stats */}
          <div
            className={cn(
              "flex items-center gap-8 pt-4",
              "animate-fade-up animate-fill-both animate-delay-400"
            )}
          >
            {slide.stats.map((stat, i) => (
              <React.Fragment key={stat.label}>
                <div>
                  <p
                    className={cn(
                      "text-2xl font-bold leading-none",
                      slide.accent === "amber" ? "text-amber-400" : "text-emerald-400"
                    )}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{stat.label}</p>
                </div>
                {i < slide.stats.length - 1 && (
                  <div className="h-8 w-px bg-white/15" aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
        role="tablist"
        aria-label="Hero slides"
      >
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === activeSlide}
            aria-label={`Slide ${i + 1}`}
            onClick={() => goToSlide(i)}
            className={cn(
              "transition-all duration-400 rounded-full",
              i === activeSlide
                ? "w-8 h-2 bg-amber-400"
                : "w-2 h-2 bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>

      {/* Bottom trust bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-slate-900/60 backdrop-blur-sm">
        <div className="container-site py-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Truck size={14} className="text-amber-400" aria-hidden="true" />
              <span>Free delivery over $49</span>
            </div>
            <div className="hidden sm:block h-3 w-px bg-white/20" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" aria-hidden="true" />
              <span>30-day returns</span>
            </div>
            <div className="hidden sm:block h-3 w-px bg-white/20" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-amber-400 fill-amber-400" aria-hidden="true" />
              <span>4.9/5 from 50,000+ reviews</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
