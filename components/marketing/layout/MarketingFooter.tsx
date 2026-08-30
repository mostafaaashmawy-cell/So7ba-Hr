import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Facebook, 
  Instagram,
  ArrowUpLeft
} from 'lucide-react';

export function MarketingFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
          {/* Col 1: Brand & About (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group inline-flex">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-teal-500/20">
                <Sparkles className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-sans">
                Hum<span className="text-teal-400">Ai</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              المنصة الرائدة في أتمتة إدارة الموارد البشرية والعمليات للمؤسسات والشركات في مصر والشرق الأوسط، مدعومة بمساعد ذكاء اصطناعي عبر واتساب.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-teal-400 hover:border-teal-500/50 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-teal-400 hover:border-teal-500/50 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-teal-400 hover:border-teal-500/50 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white tracking-wider">روابط سريعة</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-teal-400 transition-colors inline-flex items-center gap-1">
                  <span>النظام الأساسي</span>
                </Link>
              </li>
              <li>
                <Link href="/blueprints" className="hover:text-teal-400 transition-colors inline-flex items-center gap-1">
                  <span>قوالب التشغيل</span>
                </Link>
              </li>
              <li>
                <Link href="/whatsapp-assistant" className="hover:text-teal-400 transition-colors inline-flex items-center gap-1">
                  <span>مساعد واتساب الذكي</span>
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-teal-400 transition-colors inline-flex items-center gap-1">
                  <span>الأمان والخصوصية</span>
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-teal-400 transition-colors inline-flex items-center gap-1">
                  <span>الأسعار والباقات</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-teal-400 transition-colors inline-flex items-center gap-1">
                  <span>تواصل معنا</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white tracking-wider">روابط قانونية</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/security" className="hover:text-teal-400 transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-teal-400 transition-colors">
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-teal-400 transition-colors">
                  سياسة ملفات تعريف الارتباط
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-teal-400 transition-colors">
                  اتفاقية مستوى الخدمة (SLA)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white tracking-wider">تواصل معنا</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                {/* TODO: replace with real contact email */}
                <a href="mailto:info@humai.app" className="hover:text-teal-400 transition-colors dir-ltr text-right">
                  info@humai.app
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                {/* TODO: replace with real phone number */}
                <a href="https://wa.me/201000000000" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors dir-ltr text-right">
                  +20 100 000 0000
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                <span>القاهرة، جمهورية مصر العربية</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
              >
                <span>احجز عرضاً توضيحياً مجاناً</span>
                <ArrowUpLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>جميع الحقوق محفوظة © 2026 HumAi Platform.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              جميع الأنظمة السحابية تعمل بكفاءة
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
