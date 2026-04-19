import { LayoutDashboard, Package, ShoppingBag, Users, Tag, ChevronRight } from "lucide-react";
import Link from "next/link";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "대시보드" },
  { href: "/admin/products", icon: Package, label: "상품 관리" },
  { href: "/admin/orders", icon: ShoppingBag, label: "주문 관리" },
  { href: "/admin/members", icon: Users, label: "회원 관리" },
  { href: "/admin/coupons", icon: Tag, label: "쿠폰 관리" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <Link href="/" className="font-display text-xl font-bold">
            Paw<span className="text-amber-400">Palace</span>
          </Link>
          <p className="text-slate-400 text-xs mt-1">관리자 패널</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="flex flex-col gap-1">
            {NAV.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-150 text-sm font-medium group"
                >
                  <Icon size={18} className="shrink-0" />
                  {label}
                  <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            ← 사이트로 돌아가기
          </Link>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
