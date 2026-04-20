import type { Metadata } from "next";
import { AccountBackLink } from "@/components/account/AccountBackLink";
import { SettingsForm } from "@/components/account/SettingsForm";

export const metadata: Metadata = {
  title: "Account settings — PawPalace",
  description: "Email, SMS, and display preferences for your PawPalace account.",
};

export default function AccountSettingsPage() {
  return (
    <main className="section-padding">
      <div className="container-site max-w-2xl">
        <AccountBackLink />
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500 text-sm mb-8">
          Choose what we send you and how prices are shown—modeled after notification settings on pet supply sites.
        </p>
        <SettingsForm />
      </div>
    </main>
  );
}
