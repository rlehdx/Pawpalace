import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — PawPalace",
  description:
    "Join PawPalace for exclusive deals, order tracking, and personalised pet recommendations.",
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
