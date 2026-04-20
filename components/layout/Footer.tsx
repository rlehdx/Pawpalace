"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Twitter, Facebook, Youtube, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FOOTER_LINKS = {
  Shop: [
    { label: "All Products",  href: "/products" },
    { label: "Dogs",          href: "/category/dog" },
    { label: "Cats",          href: "/category/cat" },
    { label: "Birds",         href: "/category/bird" },
    { label: "Fish",          href: "/category/fish" },
    { label: "Sale",          href: "/sale" },
  ],
  Help: [
    { label: "FAQ",           href: "/faq" },
    { label: "Track Order",   href: "/track" },
    { label: "Returns",       href: "/returns" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Size Guide",    href: "/size-guide" },
    { label: "Contact Us",    href: "/contact" },
  ],
  Company: [
    { label: "About Us",      href: "/about" },
    { label: "Our Story",     href: "/story" },
    { label: "Blog",          href: "/blog" },
    { label: "Press",         href: "/press" },
    { label: "Careers",       href: "/careers" },
    { label: "Affiliate",     href: "/affiliate" },
  ],
  Legal: [
    { label: "Privacy Policy",    href: "/privacy" },
    { label: "Terms of Service",  href: "/terms" },
    { label: "Cookie Policy",     href: "/cookies" },
    { label: "Accessibility",     href: "/accessibility" },
  ],
};

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#", icon: Instagram, color: "hover:text-pink-500" },
  { label: "TikTok",    href: "#", icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.01a8.24 8.24 0 0 0 4.83 1.55V7.13a4.85 4.85 0 0 1-1.06-.44z"/>
    </svg>
  ), color: "hover:text-slate-900" },
  { label: "Facebook",  href: "#", icon: Facebook,  color: "hover:text-blue-600" },
  { label: "Twitter",   href: "#", icon: Twitter,   color: "hover:text-sky-500" },
  { label: "YouTube",   href: "#", icon: Youtube,   color: "hover:text-red-500" },
];

const TRUST_BADGES = [
  { emoji: "🔒", label: "Secure Payment" },
  { emoji: "📦", label: "Fast Shipping" },
  { emoji: "↩️", label: "Easy Returns" },
  { emoji: "🌱", label: "Eco Packaging" },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">

      {/* Trust Strip */}
      <div className="border-b border-slate-800">
        <div className="container-site py-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {TRUST_BADGES.map(({ emoji, label }) => (
              <div key={label} className="flex items-center gap-2 text-slate-300">
                <span className="text-xl" aria-hidden="true">{emoji}</span>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-site py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-xl">
                🐾
              </span>
              <span className="font-display font-bold text-xl leading-none">
                Paw<span className="text-amber-500">Palace</span>
              </span>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Premium pet supplies delivered to your door. Because your furry family deserves the very best.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={cn(
                    "w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center",
                    "text-slate-400 transition-colors duration-200",
                    color,
                    "hover:bg-slate-700"
                  )}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-200">Get pet care tips & exclusive deals</p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex gap-2"
                aria-label="Newsletter signup"
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  className={cn(
                    "flex-1 min-w-0 px-4 py-2.5 rounded-xl text-sm",
                    "bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500",
                    "focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500",
                    "transition-colors"
                  )}
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors shrink-0"
                  aria-label="Subscribe"
                >
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).slice(0, 3).map(([heading, links]) => (
            <div key={heading} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-amber-400 transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@pawpalace.com"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <Mail size={15} className="shrink-0" aria-hidden="true" />
                  hello@pawpalace.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+18005551234"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <Phone size={15} className="shrink-0" aria-hidden="true" />
                  1-800-555-1234
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-400">
                <MapPin size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
                <span>24/7 Support<br />Mon–Sun, All Hours</span>
              </li>
            </ul>

            {/* Payment Icons */}
            <div className="pt-2 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                We Accept
              </p>
              <div className="flex flex-wrap gap-2">
                {["VISA", "MC", "AMEX", "PayPal", "Apple Pay"].map((method) => (
                  <span
                    key={method}
                    className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-2xs text-slate-400 font-semibold"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container-site py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} PawPalace. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {FOOTER_LINKS.Legal.map((link, i) => (
                <React.Fragment key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                  {i < FOOTER_LINKS.Legal.length - 1 && (
                    <span className="text-slate-700" aria-hidden="true">·</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
