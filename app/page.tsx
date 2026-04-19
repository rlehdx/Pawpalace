import type { Metadata } from "next";
import { HeroSection }      from "@/components/sections/HeroSection";
import { MarqueeBanner }    from "@/components/sections/MarqueeBanner";
import { FeaturesSection }  from "@/components/sections/FeaturesSection";
import { CategoryGrid }     from "@/components/sections/CategoryGrid";
import { ProductShowcase }  from "@/components/sections/ProductShowcase";
import { ReviewsSection }   from "@/components/sections/ReviewsSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";

/* ============================================
   PAGE-LEVEL SEO METADATA
   ============================================ */
export const metadata: Metadata = {
  title: "PawPalace — Premium Pet Supplies, Free Shipping Over $49",
  description:
    "Shop 500+ premium pet products for dogs, cats, birds, fish & more. Free 2-day shipping, easy returns, vet-recommended. Your pets deserve the best.",
  openGraph: {
    title: "PawPalace — Premium Pet Supplies",
    description: "500+ premium pet products. Free shipping over $49. Loved by 50,000+ pets.",
  },
};

/* ============================================
   HOME PAGE
   Customer Journey Order:
   1. Hero        — Grab attention, set brand tone
   2. Marquee     — Reinforce trust signals (subtle)
   3. Features    — Build credibility
   4. Categories  — Guide discovery
   5. Products    — Drive purchase intent
   6. Reviews     — Social proof & UGC
   7. Newsletter  — Capture leads & lifetime value
   ============================================ */
export default function HomePage() {
  return (
    <>
      {/* 1. Hero — First impression & primary CTA */}
      <HeroSection />

      {/* 2. Ticker — Trust signals always visible */}
      <MarqueeBanner variant="dark" />

      {/* 3. Features — Why shop with us */}
      <FeaturesSection />

      {/* 4. Category Grid — Help users find their pet's section */}
      <CategoryGrid />

      {/* 5. Product Showcase — Featured items, drive to cart */}
      <ProductShowcase />

      {/* 6. Reviews & UGC — Social proof, Instagram-style grid */}
      <ReviewsSection />

      {/* 7. Newsletter — Email capture, retention play */}
      <NewsletterSection />
    </>
  );
}
