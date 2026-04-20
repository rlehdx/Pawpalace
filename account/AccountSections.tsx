"use client";

import { useMemo, useState } from "react";
import { Heart, Settings, User } from "lucide-react";
import { ProfileSection } from "@/components/account/ProfileSection";
import { WishlistSection } from "@/components/account/WishlistSection";
import { SettingsSection } from "@/components/account/SettingsSection";

type AccountTab = "profile" | "wishlist" | "settings";

const accountTabs: Array<{ id: AccountTab; label: string; description: string; icon: typeof User }> = [
  { id: "profile", label: "Profile", description: "Update your personal details", icon: User },
  { id: "wishlist", label: "Wishlist", description: "Items you've saved", icon: Heart },
  { id: "settings", label: "Settings", description: "Manage your preferences", icon: Settings },
];

export function AccountSections() {
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");

  const ActiveSection = useMemo(() => {
    if (activeTab === "wishlist") return WishlistSection;
    if (activeTab === "settings") return SettingsSection;
    return ProfileSection;
  }, [activeTab]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="tablist" aria-label="My account sections">
        {accountTabs.map(({ id, label, description, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(id)}
              className={[
                "text-left rounded-2xl p-4 border transition-all duration-200",
                isActive
                  ? "bg-amber-50 border-amber-300 shadow-card"
                  : "bg-white border-slate-200 hover:border-amber-200 hover:shadow-card",
              ].join(" ")}
            >
              <div className="w-9 h-9 mb-3 flex items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Icon size={18} />
              </div>
              <p className="font-semibold text-slate-900">{label}</p>
              <p className="text-xs text-slate-500 mt-1">{description}</p>
            </button>
          );
        })}
      </div>

      <ActiveSection />
    </div>
  );
}
