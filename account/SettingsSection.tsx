"use client";

import { Settings } from "lucide-react";

const preferences = [
  { label: "Email notifications", value: "Enabled" },
  { label: "Order status updates", value: "Enabled" },
  { label: "Marketing emails", value: "Disabled" },
];

export function SettingsSection() {
  return (
    <section className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <Settings size={18} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Settings</h2>
          <p className="text-sm text-slate-500">Review your account preferences.</p>
        </div>
      </div>

      <div className="space-y-2">
        {preferences.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
            <p className="text-sm text-slate-700">{item.label}</p>
            <span className="text-xs font-semibold text-slate-500">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
