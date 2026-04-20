"use client";
import React from "react";
import LoginClient from "./LoginClient";

export default function Page() {
  return <LoginClient />;
}
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast({ type: "error", title: "Login failed", message: "Please check your email or password." });
      return;
    }
    toast({ type: "success", title: "Logged in successfully" });
    const redirectTo = searchParams.get("redirect") ?? "/";
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-3xl shadow-card p-8">
      <h1 className="font-display text-2xl font-bold text-slate-900 mb-6">Sign In</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
            placeholder="hello@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
          Sign In
        </Button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-6">
        Don't have an account?{" "}
        <a href="/signup" className="text-amber-600 font-semibold hover:underline">Create account</a>
      </p>
    </div>
  );
}
