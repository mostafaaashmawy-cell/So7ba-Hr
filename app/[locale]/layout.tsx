import type { Metadata } from 'next';
import { Cairo, Montserrat } from 'next/font/google';
import { getDictionary, locales, type Locale } from '@/lib/i18n';
import '../globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    manifest: '/manifest.json',
    icons: { icon: '/favicon.ico' },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const dict = getDictionary(locale);
  const isAr = locale === 'ar';
  const fontVariable = isAr ? cairo.variable : montserrat.variable;
  const fontFamily = isAr
    ? 'font-[family-name:var(--font-cairo)]'
    : 'font-[family-name:var(--font-montserrat)]';

  return (
    <html
      lang={locale}
      dir={dict.dir}
      className={`${fontVariable} h-full antialiased scroll-smooth`}
    >
      <body
        className={`min-h-full flex flex-col ${fontFamily}`}
        style={{ background: 'var(--bg-deep)', color: 'var(--text-primary)' }}
      >
        {children}
      </body>
    </html>
  );
}
