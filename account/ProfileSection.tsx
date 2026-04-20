"use client";

import { User } from "lucide-react";

export function ProfileSection() {
  return (
    <section className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <User size={18} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Profile</h2>
          <p className="text-sm text-slate-500">Manage your personal information.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs text-slate-500 mb-1">Name</p>
          <p className="text-sm font-medium text-slate-900">Guest User</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs text-slate-500 mb-1">Email</p>
          <p className="text-sm font-medium text-slate-900">Not set</p>
        </div>
      </div>
    </section>
  );
}
