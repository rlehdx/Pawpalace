import type { Metadata } from "next";
import { AccountBackLink } from "@/components/account/AccountBackLink";
import { WishlistContent } from "@/components/account/WishlistContent";

export const metadata: Metadata = {
  title: "Wishlist — PawPalace",
  description: "Products you have saved while shopping.",
};

export default function AccountWishlistPage() {
  return (
    <main className="section-padding">
      <div className="container-site max-w-2xl">
        <AccountBackLink />
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Wishlist</h1>
        <p className="text-slate-500 text-sm mb-8">
          Items you save with the heart icon appear here and stay in sync on this device.
        </p>
        <WishlistContent />
      </div>
    </main>
  );
}
