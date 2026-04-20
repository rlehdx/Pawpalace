import type { Metadata } from "next";
import Link from "next/link";
import { User, Package, Heart, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "My Account — PawPalace",
};

export default function AccountPage() {
  return (
    <main className="section-padding">
      <div className="container-site max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">My Account</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Package, label: "My Orders", desc: "Track and manage your orders", href: "/account/orders" },
            { icon: Heart, label: "Wishlist", desc: "Items you've saved", href: "#" },
            { icon: User, label: "Profile", desc: "Update your personal details", href: "#" },
            { icon: Settings, label: "Settings", desc: "Manage your preferences", href: "#" },
          ].map(({ icon: Icon, label, desc, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-card hover:shadow-lifted transition-shadow duration-200 group"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-100 text-amber-600 shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Icon size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">{label}</p>
                <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-amber-600 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
