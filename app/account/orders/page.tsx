import type { Metadata } from "next";
import Link from "next/link";
import { Package, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "My Orders — PawPalace",
};

export default function OrdersPage() {
  return (
    <main className="section-padding">
      <div className="container-site max-w-2xl">
        <Link href="/account" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-600 transition-colors mb-6 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to account
        </Link>

        <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">My Orders</h1>

        <div className="text-center py-16 bg-white rounded-2xl shadow-card">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-amber-100 text-amber-500 mx-auto mb-4">
            <Package size={28} />
          </div>
          <h2 className="font-semibold text-slate-900 text-lg mb-2">No orders yet</h2>
          <p className="text-slate-500 text-sm mb-6">When you place an order, it will appear here.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-colors"
          >
            Start shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
