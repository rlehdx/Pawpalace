import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function AccountBackLink() {
  return (
    <Link
      href="/account"
      className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-600 transition-colors mb-6 group"
    >
      <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
      Back to account
    </Link>
  );
}
