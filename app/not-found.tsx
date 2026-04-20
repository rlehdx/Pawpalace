import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4" style={{ background: "#FDFAF4" }}>
      <div className="text-center max-w-lg mx-auto">
        {/* Paw icon */}
        <div className="text-8xl mb-6 select-none">🐾</div>

        {/* 404 */}
        <h1 className="font-display text-7xl font-bold text-amber-500 mb-2 leading-none">
          404
        </h1>

        <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">
          Page not found
        </h2>

        <p className="text-slate-500 text-base mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.<br />
          Even our pups couldn't sniff it out 🐕
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors shadow-lg"
          >
            🏠 Go home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-amber-200 text-amber-700 font-semibold text-sm hover:bg-amber-50 transition-colors"
          >
            🛍️ Browse products
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-amber-100">
          <p className="text-xs text-slate-400 mb-4 font-medium uppercase tracking-wider">
            Quick links
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { href: "/products?category=dog", label: "🐕 Dogs" },
              { href: "/products?category=cat", label: "🐈 Cats" },
              { href: "/products?category=bird", label: "🦜 Birds" },
              { href: "/login", label: "🔑 Sign in" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-sm hover:border-amber-300 hover:text-amber-700 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
