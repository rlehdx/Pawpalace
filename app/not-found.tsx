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
          이 페이지는 찾을 수 없어요
        </h2>

        <p className="text-slate-500 text-base mb-8 leading-relaxed">
          주소가 잘못되었거나 페이지가 이동되었을 수 있습니다.<br />
          강아지도 이 길은 모르는 것 같아요 🐕
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors shadow-lg"
          >
            🏠 홈으로 돌아가기
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-amber-200 text-amber-700 font-semibold text-sm hover:bg-amber-50 transition-colors"
          >
            🛍️ 상품 둘러보기
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-amber-100">
          <p className="text-xs text-slate-400 mb-4 font-medium uppercase tracking-wider">
            자주 찾는 페이지
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { href: "/products?category=dog", label: "🐕 강아지" },
              { href: "/products?category=cat", label: "🐈 고양이" },
              { href: "/products?category=bird", label: "🦜 조류" },
              { href: "/login", label: "🔑 로그인" },
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
