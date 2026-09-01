import { getDictionary, locales, type Locale } from '@/lib/i18n';
import { MarketingNavbar } from '@/components/marketing/layout/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/layout/MarketingFooter';
import { GlowOrbs } from '@/components/marketing/shared/GlowOrbs';
import { CTASection } from '@/components/marketing/shared/CTASection';
import { SectionWrapper, StaggerContainer, StaggerItem } from '@/components/marketing/motion/SectionWrapper';
import { Shield, Lock, UserCheck, Database, FileText, MessageSquare } from 'lucide-react';

export async function generateStaticParams() {
  return locales.map(l => ({ locale: l }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  return { title: dict.security.meta.title, description: dict.security.meta.description };
}

export default async function SecurityPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const dir = dict.dir;

  const pillarIcons = [Shield, Lock, UserCheck, Database, FileText, MessageSquare];

  return (
    <main dir={dir} className="min-h-screen bg-[#05070D] text-slate-200 font-sans selection:bg-cyan-500/30">
      <MarketingNavbar dict={dict} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 bg-[#05070D]">
        <div className="absolute inset-0 dot-grid-bg opacity-30"></div>
        <GlowOrbs />
        <div className="container mx-auto px-6 relative z-10">
          <SectionWrapper>
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center border border-cyan-400/30 text-cyan-400 bg-cyan-400/5 text-xs font-semibold px-3 py-1 rounded-full">
                {dict.locale === 'ar' ? 'الأمان والخصوصية' : 'Security & Privacy'}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                {dict.security.hero.title}
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {dict.security.hero.description}
              </p>
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Security Pillars */}
      <section className="py-20 bg-[#0D1117]/40">
        <div className="container mx-auto px-6 relative z-10">
          <StaggerContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dict.security.pillars.map((item, i: number) => {
                const Icon = pillarIcons[i % pillarIcons.length];
                return (
                  <StaggerItem key={i}>
                    <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 border border-white/[0.06] hover:bg-white/[0.02] transition-colors h-full">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/10 to-violet-500/10 flex items-center justify-center text-cyan-400 mb-2">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </StaggerItem>
                );
              })}
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <CTASection 
        title={dict.security.cta.title} 
        description={dict.security.cta.description} 
        button={dict.security.cta.button} 
        href={'/' + locale + '/contact'} 
      />

      <MarketingFooter dict={dict} />
    </main>
  );
}
