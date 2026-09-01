import Link from 'next/link';
import { Sparkles, Linkedin, Facebook, Instagram, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import type { SiteDictionary } from '@/lib/i18n/types';

export function MarketingFooter({ dict }: { dict: SiteDictionary }) {
  const homeHref = dict.locale === 'ar' ? '/ar' : '/en';
  const securityHref = dict.locale === 'ar' ? '/ar/security' : '/en/security';
  const contactHref = dict.locale === 'ar' ? '/ar/contact' : '/en/contact';

  return (
    <footer className="bg-[#0D1117] dot-grid-bg border-t border-white/[0.06] pt-16 pb-8" dir={dict.dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/[0.06]">

          {/* Col 1-2: Brand */}
          <div className="lg:col-span-2 space-y-5">
            <Link href={homeHref} className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-white">Hum</span>
                <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">Ai</span>
              </span>
            </Link>
            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-sm">
              {dict.footer.tagline}
            </p>
            <div className="flex items-center gap-3 pt-1">
              {[
                { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
                { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
                { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-[#161B27] border border-white/[0.06] flex items-center justify-center text-[#94A3B8] hover:border-cyan-400/30 hover:text-cyan-400 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-semibold tracking-wider">{dict.footer.quickLinksTitle}</h3>
            <ul className="space-y-3">
              {dict.nav.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[#94A3B8] hover:text-cyan-400 transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-semibold tracking-wider">{dict.footer.legalTitle}</h3>
            <ul className="space-y-3">
              {dict.footer.legalLinks.map((label) => (
                <li key={label}>
                  <Link href={securityHref} className="text-[#94A3B8] hover:text-cyan-400 transition-colors text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-semibold tracking-wider">{dict.footer.contactTitle}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <a href={`mailto:${dict.footer.email}`} className="text-[#94A3B8] hover:text-cyan-400 transition-colors" dir="ltr">
                  {dict.footer.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <a href="https://wa.me/201000000000" target="_blank" rel="noreferrer" className="text-[#94A3B8] hover:text-cyan-400 transition-colors" dir="ltr">
                  {dict.footer.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <span className="text-[#94A3B8]">{dict.footer.location}</span>
              </li>
            </ul>
            <Link
              href={contactHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors pt-1"
            >
              <span>{dict.footer.bookDemo}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4B5567]">
          <p>{dict.footer.copyright}</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[#94A3B8] text-sm font-medium">{dict.footer.statusText}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
