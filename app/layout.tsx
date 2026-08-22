import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HumAi - Smart HR & Operations Platform",
  description: "HumAi - Smart Multi-Tenant HR & Operations Management Platform",
  manifest: "/manifest.json",
};

import { LanguageProvider } from "@/lib/context/LanguageContext";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { SidebarProvider } from "@/lib/context/SidebarContext";
import { SettingsProvider } from "@/lib/context/SettingsContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-(--bg) text-(--text-primary) antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <SettingsProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </SettingsProvider>
          </LanguageProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SW registered:', reg.scope);
                  }).catch(function(err) {
                    console.warn('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
