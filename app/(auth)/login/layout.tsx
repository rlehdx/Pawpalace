import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — PawPalace",
  description:
    "Sign in to your PawPalace account to track orders and manage your pets' favourites.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
