import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { CartProvider } from "@/components/providers/CartProvider";

/* ============================================
   SEO METADATA
   ============================================ */
export const metadata: Metadata = {
  metadataBase: new URL("https://pawpalace.com"),
  title: {
    default: "PawPalace — Premium Pet Supplies Delivered",
    template: "%s | PawPalace",
  },
  description:
    "Shop premium pet food, toys, beds, and accessories for dogs, cats, birds, and more. Free shipping over $49. 30-day easy returns.",
  keywords: [
    "pet supplies", "dog food", "cat toys", "pet accessories",
    "pet store", "dog bed", "cat tree", "bird seed", "aquarium",
    "pet health", "natural pet food", "organic pet treats",
  ],
  authors: [{ name: "PawPalace" }],
  creator: "PawPalace",
  publisher: "PawPalace",
  formatDetection: { email: false, address: false, telephone: false },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pawpalace.com",
    siteName: "PawPalace",
    title: "PawPalace — Premium Pet Supplies",
    description: "Your trusted source for premium pet supplies. Free shipping over $49.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PawPalace — Premium Pet Supplies",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PawPalace — Premium Pet Supplies",
    description: "Your trusted source for premium pet supplies. Free shipping over $49.",
    images: ["/og-image.jpg"],
    creator: "@pawpalace",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },

  manifest: "/site.webmanifest",

  alternates: {
    canonical: "https://pawpalace.com",
  },
};

export const viewport: Viewport = {
  themeColor: "#F59E0B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/* ============================================
   ROOT LAYOUT
   ============================================ */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />

        {/* Structured Data — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "OnlineStore",
              name: "PawPalace",
              url: "https://pawpalace.com",
              description: "Premium pet supplies for dogs, cats, birds, fish, and more.",
              logo: "https://pawpalace.com/logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+1-800-555-1234",
                contactType: "customer service",
                availableLanguage: "English",
                hoursAvailable: "Mo-Su 00:00-23:59",
              },
              sameAs: [
                "https://instagram.com/pawpalace",
                "https://facebook.com/pawpalace",
                "https://twitter.com/pawpalace",
              ],
            }),
          }}
        />
      </head>
      <body className="font-body bg-brand-cream text-slate-900 antialiased">
        <ToastProvider>
          <CartProvider>
            {/* Skip to main content (accessibility) */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-white focus:rounded-lg focus:font-semibold"
            >
              Skip to main content
            </a>

            <Header />

            <main id="main-content" tabIndex={-1}>
              {children}
            </main>

            <Footer />
            <CartDrawer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
