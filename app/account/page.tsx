import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { AccountNav } from "@/components/account/AccountNav";

export const metadata: Metadata = {
  title: "My Account — PawPalace",
};

export default function AccountPage() {
  return (
    <main className="section-padding">
      <div className="container-site max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">My Account</h1>

        <Link
          href="/account/orders"
          className="mb-4 flex items-center justify-between gap-3 p-5 bg-white rounded-2xl shadow-card hover:shadow-lifted transition-shadow duration-200 group"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-100 text-amber-600 shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Package size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">My Orders</p>
              <p className="text-sm text-slate-500 mt-0.5">Track and manage your orders</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
        </Link>

        <AccountNav />

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-amber-600 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
