"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  defaultStoredProfile,
  loadProfileFromStorage,
  saveProfileToStorage,
  type PreferredPet,
  type StoredProfile,
} from "@/lib/accountPreferences";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

function metaString(meta: Record<string, unknown> | undefined, key: string): string {
  const v = meta?.[key];
  return typeof v === "string" ? v : "";
}

export function ProfileForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [emailReadOnly, setEmailReadOnly] = useState(false);
  const [form, setForm] = useState<StoredProfile>(defaultStoredProfile);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const stored = loadProfileFromStorage();
      const { data: { user } } = await supabase.auth.getUser();

      if (cancelled) return;

      if (user) {
        setHasSession(true);
        const meta = user.user_metadata as Record<string, unknown> | undefined;
        setEmailReadOnly(true);
        setForm({
          firstName: metaString(meta, "first_name") || metaString(meta, "firstName") || stored.firstName,
          lastName: metaString(meta, "last_name") || metaString(meta, "lastName") || stored.lastName,
          email: user.email ?? stored.email,
          phone: metaString(meta, "phone") || stored.phone,
          preferredPet: (metaString(meta, "preferred_pet") as PreferredPet) || stored.preferredPet,
          addressLine1: metaString(meta, "address_line1") || metaString(meta, "addressLine1") || stored.addressLine1,
          addressLine2: metaString(meta, "address_line2") || metaString(meta, "addressLine2") || stored.addressLine2,
          city: metaString(meta, "city") || stored.city,
          state: metaString(meta, "state") || stored.state,
          zip: metaString(meta, "zip") || stored.zip,
        });
      } else {
        setHasSession(false);
        setEmailReadOnly(false);
        setForm(stored);
      }

      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof StoredProfile>(key: K, value: StoredProfile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
      // supabase.auth.updateUser only mutates the current session's user — customers cannot edit others' accounts.
      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: {
            first_name: form.firstName.trim(),
            last_name: form.lastName.trim(),
            phone: form.phone.trim(),
            preferred_pet: form.preferredPet,
            address_line1: form.addressLine1.trim(),
            address_line2: form.addressLine2.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            zip: form.zip.trim(),
          },
        });
        if (error) throw error;
        saveProfileToStorage(form);
        toast({ type: "success", title: "Profile saved", message: "Your account details are updated." });
      } else {
        saveProfileToStorage(form);
        toast({
          type: "success",
          title: "Profile saved on this device",
          message: "Sign in to sync your details across devices.",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save profile.";
      toast({ type: "error", title: "Save failed", message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-8 animate-pulse space-y-4">
        <div className="h-6 bg-slate-100 rounded w-1/3" />
        <div className="h-10 bg-slate-100 rounded" />
        <div className="h-10 bg-slate-100 rounded" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {!hasSession && (
        <p className="text-sm text-slate-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          You&apos;re browsing as a guest. Your profile is saved in this browser until you{" "}
          <a href="/login?redirect=/account/profile" className="font-semibold text-amber-700 hover:underline">
            sign in
          </a>{" "}
          to sync across devices.
        </p>
      )}

      <section className="bg-white rounded-2xl shadow-card p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-slate-900">Contact</h2>
          <p className="text-sm text-slate-500 mt-0.5">How we reach you about orders and deliveries.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First name"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            autoComplete="given-name"
            required
          />
          <Input
            label="Last name"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            autoComplete="family-name"
            required
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          autoComplete="email"
          required
          hint={emailReadOnly ? "Email is tied to your login. Change it from account security settings (coming soon)." : undefined}
          disabled={emailReadOnly}
          className={emailReadOnly ? "opacity-70" : undefined}
        />
        <Input
          label="Mobile phone"
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          autoComplete="tel"
          placeholder="(555) 123-4567"
          hint="Used for delivery updates and SMS preferences if enabled."
        />

        <div className="space-y-1.5">
          <label htmlFor="preferred-pet" className="block text-sm font-semibold text-slate-700">
            Primary pet you shop for
          </label>
          <select
            id="preferred-pet"
            value={form.preferredPet}
            onChange={(e) => update("preferredPet", e.target.value as PreferredPet)}
            className="w-full font-body text-sm text-slate-900 bg-white border border-slate-200 rounded-xl px-4 py-3 transition-all duration-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
          >
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="bird">Bird</option>
            <option value="fish">Fish &amp; aquarium</option>
            <option value="small-pet">Small pet (hamster, rabbit…)</option>
            <option value="multiple">Multiple / mixed household</option>
          </select>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-slate-900">Default shipping address</h2>
          <p className="text-sm text-slate-500 mt-0.5">Used at checkout. Same pattern as major pet retailers (Chewy, Petco).</p>
        </div>
        <Input
          label="Street address"
          value={form.addressLine1}
          onChange={(e) => update("addressLine1", e.target.value)}
          autoComplete="address-line1"
          placeholder="123 Main St"
        />
        <Input
          label="Apt, suite, unit (optional)"
          value={form.addressLine2}
          onChange={(e) => update("addressLine2", e.target.value)}
          autoComplete="address-line2"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="City"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            autoComplete="address-level2"
          />
          <Input
            label="State"
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
            autoComplete="address-level1"
            placeholder="CA"
          />
          <Input
            label="ZIP code"
            value={form.zip}
            onChange={(e) => update("zip", e.target.value)}
            autoComplete="postal-code"
          />
        </div>
      </section>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button type="submit" loading={saving} size="lg">
          Save changes
        </Button>
        <p className="text-xs text-slate-500">Changes apply immediately after you save.</p>
      </div>
    </form>
  );
}
