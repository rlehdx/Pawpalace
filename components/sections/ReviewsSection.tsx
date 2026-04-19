"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CheckCircle, Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { REVIEWS } from "@/lib/data";
import { StarRating } from "@/components/ui/Card";

export function ReviewsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollToIndex(index: number) {
    setActiveIndex(index);
    if (scrollRef.current) {
      const cards = scrollRef.current.children;
      if (cards[index]) {
        cards[index].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }

  function prev() {
    scrollToIndex(Math.max(0, activeIndex - 1));
  }

  function next() {
    scrollToIndex(Math.min(REVIEWS.length - 1, activeIndex + 1));
  }

  return (
    <section
      className="section-padding overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FDFAF4 0%, #FEF3C7 40%, #FDFAF4 100%)"
      }}
      aria-labelledby="reviews-heading"
    >
      <div className="container-site">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
          <div className="max-w-lg">
            <div className="section-label mb-5">
              <span aria-hidden="true">✦</span> Real Reviews
            </div>
            <h2
              id="reviews-heading"
              className="font-display text-4xl sm:text-5xl font-bold text-slate-900"
            >
              Loved by{" "}
              <span className="text-gradient italic">50,000+ pets</span>
              {" "}& their humans
            </h2>
          </div>

          {/* Overall Rating */}
          <div
            className="bg-white rounded-2xl p-5 shadow-card border border-amber-100 shrink-0"
            aria-label="Overall customer rating"
          >
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="font-display text-4xl font-bold text-amber-500 leading-none">4.9</p>
                <div className="flex gap-0.5 mt-1 justify-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="text-amber-400 fill-amber-400"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">50K+ reviews</p>
              </div>
              <div className="h-16 w-px bg-amber-200" aria-hidden="true" />
              <div className="space-y-1.5 min-w-[100px]">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const pct = [85, 10, 3, 1, 1][5 - stars];
                  return (
                    <div key={stars} className="flex items-center gap-1.5">
                      <span className="text-2xs text-slate-500 w-3 text-right">{stars}</span>
                      <Star size={9} className="text-amber-400 fill-amber-400 shrink-0" aria-hidden="true" />
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${pct}%` }}
                          aria-label={`${pct}%`}
                        />
                      </div>
                      <span className="text-2xs text-slate-400 w-6">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          {/* Scroll container */}
          <div
            ref={scrollRef}
            className={cn(
              "flex gap-5 overflow-x-auto",
              "snap-x snap-mandatory scroll-smooth",
              "pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
              "scrollbar-none"
            )}
            role="list"
            aria-label="Customer reviews"
          >
            {REVIEWS.map((review, index) => (
              <ReviewCard
                key={review.id}
                review={review}
                isActive={index === activeIndex}
                onClick={() => scrollToIndex(index)}
              />
            ))}
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center justify-between mt-8">
            {/* Dots */}
            <div className="flex items-center gap-2" role="tablist" aria-label="Review navigation">
              {REVIEWS.map((review, i) => (
                <button
                  key={review.id}
                  role="tab"
                  aria-selected={i === activeIndex}
                  aria-label={`Review ${i + 1}`}
                  onClick={() => scrollToIndex(i)}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === activeIndex
                      ? "w-6 h-2 bg-amber-500"
                      : "w-2 h-2 bg-amber-200 hover:bg-amber-300"
                  )}
                />
              ))}
            </div>

            {/* Arrow Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                disabled={activeIndex === 0}
                className={cn(
                  "w-10 h-10 rounded-xl border flex items-center justify-center",
                  "transition-all duration-200",
                  activeIndex === 0
                    ? "border-slate-200 text-slate-300 cursor-not-allowed"
                    : "border-slate-300 text-slate-700 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50"
                )}
                aria-label="Previous review"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={next}
                disabled={activeIndex === REVIEWS.length - 1}
                className={cn(
                  "w-10 h-10 rounded-xl border flex items-center justify-center",
                  "transition-all duration-200",
                  activeIndex === REVIEWS.length - 1
                    ? "border-slate-200 text-slate-300 cursor-not-allowed"
                    : "border-slate-300 text-slate-700 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50"
                )}
                aria-label="Next review"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* UGC Photo Grid */}
        <div className="mt-20" aria-labelledby="ugc-heading">
          <div className="text-center mb-10">
            <h3
              id="ugc-heading"
              className="font-display text-3xl font-bold text-slate-900 mb-3"
            >
              Tag us{" "}
              <span className="text-amber-500">@PawPalace</span>
              {" "}on Instagram
            </h3>
            <p className="text-slate-500 text-sm">
              Share your pet's joy and get featured on our page!
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {REVIEWS.map((review, index) =>
              review.photo ? (
                <a
                  key={review.id}
                  href="#"
                  className={cn(
                    "group relative aspect-square overflow-hidden",
                    "rounded-xl sm:rounded-2xl",
                    index === 0 ? "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2" : ""
                  )}
                  aria-label={`Photo by ${review.author} of their ${review.petType}`}
                >
                  <Image
                    src={review.photo}
                    alt={`${review.petName ?? "Pet"} by ${review.author}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 33vw, 17vw"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-amber-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-center text-white px-2">
                      <p className="text-xs font-bold">{review.author}</p>
                      {review.petName && (
                        <p className="text-2xs mt-0.5 text-white/80">{review.petName} 🐾</p>
                      )}
                    </div>
                  </div>
                </a>
              ) : null
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   REVIEW CARD
   ============================================ */
interface ReviewCardProps {
  review: (typeof REVIEWS)[0];
  isActive: boolean;
  onClick: () => void;
}

function ReviewCard({ review, isActive, onClick }: ReviewCardProps) {
  return (
    <article
      role="listitem"
      onClick={onClick}
      className={cn(
        "snap-start shrink-0",
        "w-[300px] sm:w-[340px]",
        "bg-white rounded-2xl p-6",
        "border border-slate-100 shadow-card",
        "flex flex-col gap-4",
        "cursor-pointer select-none",
        "transition-all duration-300",
        isActive && "border-amber-200 shadow-warm ring-1 ring-amber-100"
      )}
    >
      {/* Quote icon */}
      <Quote
        size={28}
        className="text-amber-200 shrink-0"
        aria-hidden="true"
      />

      {/* Rating */}
      <StarRating rating={review.rating} showCount={false} size="sm" />

      {/* Review text */}
      <p className="text-slate-700 text-sm leading-relaxed flex-1">
        &ldquo;{review.text}&rdquo;
      </p>

      {/* Photo (if available) */}
      {review.photo && (
        <div className="w-full h-36 relative rounded-xl overflow-hidden bg-slate-100">
          <Image
            src={review.photo}
            alt={review.petName ?? "Pet photo"}
            fill
            className="object-cover"
            sizes="340px"
          />
          {review.petName && (
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-0.5">
              <p className="text-xs font-bold text-slate-700">{review.petName} 🐾</p>
            </div>
          )}
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        <div className="relative">
          <Image
            src={review.avatar}
            alt={review.author}
            width={40}
            height={40}
            className="rounded-full object-cover ring-2 ring-amber-100"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">{review.author}</p>
          <p className="text-2xs text-slate-500">
            {new Date(review.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        {review.verified && (
          <div className="flex items-center gap-1 shrink-0" title="Verified purchase">
            <CheckCircle size={14} className="text-emerald-500" aria-hidden="true" />
            <span className="text-2xs text-emerald-600 font-semibold">Verified</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default ReviewsSection;
