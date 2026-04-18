"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export function NewsletterSection() {
  const [email, setEmail]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <section
      className="relative overflow-hidden bg-slate-900"
      aria-labelledby="newsletter-heading"
    >
      {/* Decorative elements */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="container-site relative py-20 sm:py-28">
        <div className="max-w-2xl mx-auto text-center">

          {/* Icon */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 mb-6"
            aria-hidden="true"
          >
            <Mail size={28} className="text-amber-400" />
          </div>

          {/* Heading */}
          <h2
            id="newsletter-heading"
            className="font-display text-4xl sm:text-5xl font-bold text-white mb-5"
          >
            Join the{" "}
            <span className="text-amber-400 italic">PawPalace</span>
            {" "}family
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Get weekly pet care tips, exclusive deals, and be the first to know about new arrivals.
            Plus, <strong className="text-amber-400">15% off</strong> your first order!
          </p>

          {/* Form */}
          {submitted ? (
            <div
              className="flex flex-col items-center gap-4 animate-scale-in"
              role="alert"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <p className="text-white text-xl font-bold">You&rsquo;re in! 🎉</p>
              <p className="text-slate-400 text-sm">
                Check your inbox for your 15% discount code. Happy shopping!
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              aria-label="Newsletter signup form"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Your email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className={cn(
                  "flex-1 px-5 py-3.5 rounded-xl text-sm",
                  "bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500",
                  "focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30",
                  "transition-all duration-200"
                )}
                aria-required="true"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className={cn(
                  "flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl",
                  "bg-amber-500 text-white text-sm font-bold",
                  "hover:bg-amber-600 transition-all duration-200",
                  "shadow-warm hover:shadow-glow",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "shrink-0"
                )}
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    Get 15% Off <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Fine print */}
          {!submitted && (
            <p className="text-slate-600 text-xs mt-4">
              No spam, ever. Unsubscribe anytime. We respect your privacy.
            </p>
          )}

          {/* Social proof */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            {[
              { emoji: "📬", value: "120K+", label: "Subscribers" },
              { emoji: "🎁", value: "15%",   label: "First Order Off" },
              { emoji: "📰", value: "Weekly", label: "Pet Tips" },
            ].map(({ emoji, value, label }) => (
              <div key={label} className="text-center">
                <span className="text-2xl block mb-1" aria-hidden="true">{emoji}</span>
                <p className="font-bold text-lg text-amber-400">{value}</p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;
