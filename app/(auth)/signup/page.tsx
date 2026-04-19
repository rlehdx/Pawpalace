"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast({ type: "warning", title: "비밀번호는 8자 이상이어야 합니다." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);

    if (error) {
      toast({ type: "error", title: "회원가입 실패", message: error.message });
      return;
    }
    toast({ type: "success", title: "회원가입 완료", message: "이메일을 확인해주세요." });
    router.push("/login");
  }

  return (
    <div className="bg-white rounded-3xl shadow-card p-8">
      <h1 className="font-display text-2xl font-bold text-slate-900 mb-6">회원가입</h1>
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">이름</label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
            placeholder="홍길동"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">이메일</label>
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
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">비밀번호 (8자 이상)</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm"
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
          가입하기
        </Button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-6">
        이미 계정이 있으신가요?{" "}
        <a href="/login" className="text-amber-600 font-semibold hover:underline">로그인</a>
      </p>
    </div>
  );
}
