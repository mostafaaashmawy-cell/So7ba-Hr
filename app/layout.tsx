import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HumAi | نظام إدارة موارد بشرية ذكي مدعوم بمساعد واتساب — لشركات مصر والشرق الأوسط",
  description: "أدر الحضور والانصراف، الإجازات، والرواتب من لوحة تحكم واحدة، أو مباشرة عبر واتساب. نظام HR سحابي مصمم خصيصاً للشركات الصغيرة والمتوسطة في مصر والمنطقة العربية.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ibmPlexArabic.variable} font-sans h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-teal-500 selection:text-white font-[family-name:var(--font-ibm-plex-arabic)]">
        {children}
      </body>
    </html>
  );
}
