import Link from "next/link";
import { ChevronRight, Heart, Settings, User } from "lucide-react";

const links = [
  {
    href: "/account/profile",
    label: "Profile",
    description: "Name, contact & shipping address",
    icon: User,
  },
  {
    href: "/account/wishlist",
    label: "Wishlist",
    description: "Saved items & favorites",
    icon: Heart,
  },
  {
    href: "/account/settings",
    label: "Settings",
    description: "Notifications, language & preferences",
    icon: Settings,
  },
] as const;

export function AccountNav() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {links.map(({ href, label, description, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex items-start justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-card hover:border-amber-200 hover:shadow-lifted transition-all duration-200 group"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>
            </div>
          </div>
          <ChevronRight size={18} className="shrink-0 text-slate-400 group-hover:text-amber-600 transition-colors mt-1" />
        </Link>
      ))}
    </div>
  );
}
