import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Locale is applied by app/[locale]/layout.tsx
  // This root layout is intentionally minimal
  return children as React.ReactElement;
}
