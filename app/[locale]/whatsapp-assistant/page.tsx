import { getDictionary, locales, type Locale } from '@/lib/i18n';
import { MarketingNavbar } from '@/components/marketing/layout/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/layout/MarketingFooter';
import { GlowOrbs } from '@/components/marketing/shared/GlowOrbs';
import { CTASection } from '@/components/marketing/shared/CTASection';
import { SectionWrapper } from '@/components/marketing/motion/SectionWrapper';
import { WhatsAppChatDemo } from '@/components/marketing/shared/WhatsAppChatDemo';
import { ShieldCheck, Lock, Database } from 'lucide-react';
import Link from 'next/link';

export async function generateStaticParams() {
  return locales.map(l => ({ locale: l }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  return { title: dict.whatsapp.meta.title, description: dict.whatsapp.meta.description };
}

export default async function WhatsAppPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const dir = dict.dir;

  const securityIcons = [ShieldCheck, Lock, Database];

  return (
    <main dir={dir} className="min-h-screen bg-[#05070D] text-slate-200 font-sans selection:bg-cyan-500/30">
      <MarketingNavbar dict={dict} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 bg-[#05070D]">
        <div className="absolute inset-0 dot-grid-bg opacity-30"></div>
        <GlowOrbs />
        <div className="container mx-auto px-6 relative z-10">
          <SectionWrapper>
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center border border-cyan-400/30 text-cyan-400 bg-cyan-400/5 text-xs font-semibold px-3 py-1 rounded-full">
                {dict.locale === 'ar' ? 'مساعد واتساب الذكي' : 'WhatsApp AI Assistant'}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                {dict.whatsapp.hero.title}
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {dict.whatsapp.hero.description}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={'/' + locale + '/contact'} className="w-full sm:w-auto px-8 py-3.5 rounded-xl btn-gradient glow-pulse text-white font-semibold text-sm">
                  {dict.whatsapp.cta.button}
                </Link>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Chat Demo */}
      <section className="py-20 bg-[#0D1117]">
        <div className="container mx-auto px-6 relative z-10">
          <SectionWrapper>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                {dict.whatsapp.capabilitiesTitle}
              </h2>
            </div>
            <div className="max-w-2xl mx-auto">
              <WhatsAppChatDemo disclaimer={dict.whatsapp.chatDisclaimer} />
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 bg-[#0D1117]/40">
        <div className="container mx-auto px-6 relative z-10">
          <SectionWrapper>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-center mb-12">
              {dict.whatsapp.security.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {dict.whatsapp.security.items.map((item, i: number) => {
                const Icon = securityIcons[i % securityIcons.length];
                return (
                  <div key={i} className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4 border border-white/[0.06]">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/10 to-violet-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Plans Table */}
      <section className="py-20 bg-[#05070D]">
        <div className="container mx-auto px-6 relative z-10 max-w-3xl">
          <SectionWrapper>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-center mb-12">
              {dict.whatsapp.plans.title}
            </h2>
            <div className="glass-card rounded-2xl p-6 overflow-hidden border border-white/[0.06]">
              <div className="divide-y divide-white/[0.06]">
                {dict.whatsapp.plans.items.map((plan, i: number) => (
                  <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-5 first:pt-2 last:pb-2 gap-2">
                    <div className={`text-lg font-semibold ${i === dict.whatsapp.plans.items.length - 1 ? 'gradient-text' : 'text-white'}`}>
                      {plan.plan}
                    </div>
                    <div className="text-slate-300 font-medium">
                      {plan.limit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* CTA */}
      <CTASection 
        title={dict.whatsapp.cta.title} 
        description={dict.whatsapp.cta.description} 
        button={dict.whatsapp.cta.button} 
        href={'/' + locale + '/contact'} 
      />

      <MarketingFooter dict={dict} />
    </main>
  );
}
