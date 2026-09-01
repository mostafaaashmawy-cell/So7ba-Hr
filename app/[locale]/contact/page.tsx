import { getDictionary, locales, type Locale } from '@/lib/i18n';
import { MarketingNavbar } from '@/components/marketing/layout/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/layout/MarketingFooter';
import { GlowOrbs } from '@/components/marketing/shared/GlowOrbs';
import { SectionWrapper } from '@/components/marketing/motion/SectionWrapper';
import { DemoBookingForm } from '@/components/marketing/contact/DemoBookingForm';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export async function generateStaticParams() {
  return locales.map(l => ({ locale: l }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  return { title: dict.contact.meta.title, description: dict.contact.meta.description };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const dir = dict.dir;

  return (
    <main dir={dir} className="min-h-screen bg-[#05070D] text-slate-200 font-sans selection:bg-cyan-500/30">
      <MarketingNavbar dict={dict} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-16 bg-[#05070D]">
        <div className="absolute inset-0 dot-grid-bg opacity-30"></div>
        <GlowOrbs />
        <div className="container mx-auto px-6 relative z-10">
          <SectionWrapper>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center border border-cyan-400/30 text-cyan-400 bg-cyan-400/5 text-xs font-semibold px-3 py-1 rounded-full">
                {dict.locale === 'ar' ? 'احجز عرضاً توضيحياً' : 'Book a Live Demo'}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                <span className="gradient-text">{dict.contact.hero.title}</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {dict.contact.hero.description}
              </p>
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 pb-24 bg-[#05070D]">
        <div className="container mx-auto px-6 relative z-10 max-w-6xl">
          <SectionWrapper>
            <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
              
              {/* Form Side */}
              <div className="md:w-2/3">
                <DemoBookingForm dict={dict} />
              </div>
              
              {/* Benefits & WhatsApp Side */}
              <div className="md:w-1/3 flex flex-col gap-8 pt-4 md:pt-0">
                <div className="glass-card rounded-3xl p-8 border border-white/[0.06]">
                  <h3 className="text-xl font-bold text-white mb-6">
                    {dict.locale === 'ar' ? 'ماذا ستحصل في العرض التوضيحي؟' : 'Why Book a Demo?'}
                  </h3>
                  <ul className="space-y-4">
                    {dict.contact.benefits.map((benefit: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="glass-card rounded-3xl p-8 border border-white/[0.06] text-center">
                  <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] mx-auto mb-4">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  <p className="text-slate-300 text-sm mb-6">
                    {dict.contact.whatsappLabel}
                  </p>
                  <Link 
                    href={dict.contact.whatsappNumber}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp</span>
                  </Link>
                </div>
              </div>
              
            </div>
          </SectionWrapper>
        </div>
      </section>

      <MarketingFooter dict={dict} />
    </main>
  );
}
