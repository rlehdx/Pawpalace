import React from "react";
import { Truck, Shield, Clock, RotateCcw, Leaf, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Truck,
    title: "Free Fast Shipping",
    description: "Free 2-day shipping on all orders over $49. Same-day dispatch for orders placed before 2pm.",
    color: "amber",
    emoji: "📦",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "256-bit SSL encryption. We accept Visa, Mastercard, PayPal, Apple Pay, and more.",
    color: "emerald",
    emoji: "🔒",
  },
  {
    icon: Clock,
    title: "24/7 Pet Experts",
    description: "Our team of certified pet care specialists is available around the clock to help you.",
    color: "amber",
    emoji: "💬",
  },
  {
    icon: RotateCcw,
    title: "Easy 30-Day Returns",
    description: "Not satisfied? Return any item within 30 days for a full refund — no questions asked.",
    color: "emerald",
    emoji: "↩️",
  },
] as const;

const SOCIAL_PROOF = [
  { value: "50,000+", label: "Happy Customers" },
  { value: "4.9/5",   label: "Average Rating" },
  { value: "500+",    label: "Products" },
  { value: "2 Days",  label: "Average Delivery" },
];

export function FeaturesSection() {
  return (
    <section
      className="section-padding bg-white relative overflow-hidden"
      aria-labelledby="features-heading"
    >
      {/* Background decoration */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-50 blur-3xl opacity-60 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-50 blur-3xl opacity-60 pointer-events-none"
        aria-hidden="true"
      />

      <div className="container-site relative">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="section-label mx-auto mb-5">
            <span aria-hidden="true">✦</span> Why PawPalace
          </div>
          <h2
            id="features-heading"
            className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mb-5"
          >
            Shopping made{" "}
            <span className="text-gradient italic">effortless</span>
            {" "}for pet lovers
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            We handle the details so you can focus on what matters most — quality time with your pet.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            const isAmber = feature.color === "amber";
            return (
              <article
                key={feature.title}
                className={cn(
                  "group relative p-7 rounded-2xl border",
                  "transition-all duration-300 hover:-translate-y-2",
                  "overflow-hidden",
                  isAmber
                    ? "bg-amber-50 border-amber-100 hover:border-amber-200 hover:shadow-warm"
                    : "bg-emerald-50 border-emerald-100 hover:border-emerald-200 hover:shadow-[0_8px_32px_-4px_rgba(16,185,129,0.2)]"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background emoji decoration */}
                <div
                  className="absolute -bottom-4 -right-4 text-7xl opacity-10 select-none pointer-events-none group-hover:opacity-20 transition-opacity duration-300"
                  aria-hidden="true"
                >
                  {feature.emoji}
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-5",
                    "transition-transform duration-300 group-hover:scale-110",
                    isAmber
                      ? "bg-amber-500 text-white shadow-warm"
                      : "bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
                  )}
                  aria-hidden="true"
                >
                  <Icon size={22} strokeWidth={2} />
                </div>

                {/* Content */}
                <h3 className="font-display font-bold text-lg text-slate-900 mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>

        {/* Social Proof Strip */}
        <div
          className={cn(
            "bg-slate-900 rounded-3xl p-8 sm:p-10",
            "grid grid-cols-2 lg:grid-cols-4 gap-8",
          )}
          role="region"
          aria-label="Our achievements"
        >
          {SOCIAL_PROOF.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "text-center",
                i < SOCIAL_PROOF.length - 1 && "lg:border-r lg:border-slate-700"
              )}
            >
              <p className="font-display text-3xl sm:text-4xl font-bold text-amber-400 mb-1">
                {stat.value}
              </p>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Trust badges row */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          {[
            { icon: Award, text: "Vet Recommended" },
            { icon: Leaf,  text: "Eco-Friendly Packaging" },
            { icon: Shield, text: "100% Satisfaction Guarantee" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 text-slate-500 text-sm"
            >
              <Icon size={16} className="text-amber-500" aria-hidden="true" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
