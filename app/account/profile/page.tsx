import type { Metadata } from "next";
import { AccountBackLink } from "@/components/account/AccountBackLink";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata: Metadata = {
  title: "Profile — PawPalace",
  description: "Update your contact information and default shipping address.",
};

export default function AccountProfilePage() {
  return (
    <main className="section-padding">
      <div className="container-site max-w-2xl">
        <AccountBackLink />
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Profile</h1>
        <p className="text-slate-500 text-sm mb-8">
          Manage your name, phone, and shipping address—similar to account profile pages on major pet retailers.
        </p>
        <ProfileForm />
      </div>
    </main>
  );
}
