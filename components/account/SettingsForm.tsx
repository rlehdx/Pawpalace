"use client";

import { useEffect, useState } from "react";
import {
  defaultAccountSettings,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  type StoredAccountSettings,
} from "@/lib/accountPreferences";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
  footer,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  footer?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <label htmlFor={id} className="font-medium text-slate-900 cursor-pointer">
          {label}
        </label>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        {footer && (
          <p className="text-xs text-slate-500 mt-2">{footer}</p>
        )}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2",
          checked ? "bg-amber-500" : "bg-slate-200",
        ].join(" ")}
      >
        <span
          className={[
            "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition",
            checked ? "translate-x-5" : "translate-x-0.5",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

export function SettingsForm() {
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoredAccountSettings>(defaultAccountSettings);

  useEffect(() => {
    setSettings(loadSettingsFromStorage());
    setReady(true);
  }, []);

  function patch<K extends keyof StoredAccountSettings>(key: K, value: StoredAccountSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      saveSettingsToStorage(settings);
      toast({ type: "success", title: "Preferences saved", message: "Your settings apply on this device." });
    } catch {
      toast({ type: "error", title: "Could not save", message: "Try again in a moment." });
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return <div className="bg-white rounded-2xl shadow-card p-8 h-48 animate-pulse" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="font-semibold text-slate-900">Email &amp; notifications</h2>
        <p className="text-sm text-slate-500 mt-0.5 mb-2">
          Control what we send—similar to account notification centers on Chewy or PetSmart.
        </p>
        <ToggleRow
          id="order-ship"
          label="Order & shipping updates"
          description="Confirmations, tracking, and delivery exceptions."
          checked={settings.orderShipEmails}
          onChange={(v) => patch("orderShipEmails", v)}
        />
        <ToggleRow
          id="back-stock"
          label="Back in stock alerts"
          description="When a saved or wishlisted item is available again."
          checked={settings.backInStockAlerts}
          onChange={(v) => patch("backInStockAlerts", v)}
        />
        <ToggleRow
          id="deals"
          label="Deals & personalized offers"
          description="Sales, coupons, and recommendations based on your pets."
          checked={settings.dealsAndMarketing}
          onChange={(v) => patch("dealsAndMarketing", v)}
        />
        <ToggleRow
          id="tips"
          label="Pet care tips & articles"
          description="Seasonal care, nutrition guides, and vet-authored tips."
          checked={settings.petCareTips}
          onChange={(v) => patch("petCareTips", v)}
        />
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="font-semibold text-slate-900">SMS &amp; pharmacy</h2>
        <p className="text-sm text-slate-500 mt-0.5 mb-2">Optional; standard message rates may apply.</p>
        <ToggleRow
          id="sms"
          label="SMS order updates"
          description="Short texts for out-for-delivery and delays."
          checked={settings.smsOrderUpdates}
          onChange={(v) => patch("smsOrderUpdates", v)}
          footer="Add a mobile number on your profile for real SMS in production."
        />
        <ToggleRow
          id="rx"
          label="Prescription refill reminders"
          description="For future pharmacy / vet-approved items (demo toggle)."
          checked={settings.prescriptionReminders}
          onChange={(v) => patch("prescriptionReminders", v)}
        />
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Region &amp; display</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="language" className="block text-sm font-semibold text-slate-700">
              Language
            </label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => patch("language", e.target.value)}
              className="w-full font-body text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-US">Español (US)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="currency" className="block text-sm font-semibold text-slate-700">
              Currency
            </label>
            <select
              id="currency"
              value={settings.currency}
              onChange={(e) => patch("currency", e.target.value)}
              className="w-full font-body text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
            >
              <option value="USD">USD ($)</option>
              <option value="CAD">CAD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Currency selection is stored for your session; full multi-currency checkout can be wired to Stripe later.
        </p>
      </section>

      <Button type="submit" loading={saving} size="lg">
        Save preferences
      </Button>
    </form>
  );
}
