import { getDictionary, locales, type Locale } from '@/lib/i18n';
import { MarketingNavbar } from '@/components/marketing/layout/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/layout/MarketingFooter';
import { GlowOrbs } from '@/components/marketing/shared/GlowOrbs';
import { CTASection } from '@/components/marketing/shared/CTASection';
import { SectionWrapper, StaggerContainer, StaggerItem } from '@/components/marketing/motion/SectionWrapper';
import { Briefcase, Store, Building, CheckCircle2, Zap, Sliders, Scale } from 'lucide-react';

export async function generateStaticParams() {
  return locales.map(l => ({ locale: l }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  return { title: dict.blueprints.meta.title, description: dict.blueprints.meta.description };
}

export default async function BlueprintsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const dir = dict.dir;

  const icons = [Briefcase, Store, Building];
  const whyIcons = [Zap, Sliders, Scale];

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
                {dict.locale === 'ar' ? 'مكتبة القوالب' : 'HR Blueprints'}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                {dict.blueprints.hero.title}
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {dict.blueprints.hero.description}
              </p>
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Blueprint Cards */}
      <section className="py-20 bg-[#0D1117]">
        <div className="container mx-auto px-6 relative z-10">
          <StaggerContainer>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dict.blueprints.items.map((item, i: number) => {
                const Icon = icons[i % icons.length];
                return (
                  <StaggerItem key={i}>
                    <div className="glass-card rounded-3xl p-8 flex flex-col h-full border border-white/[0.06] hover:border-cyan-500/20 transition-all duration-300">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/10 to-violet-500/10 flex items-center justify-center text-cyan-400 mb-6">
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-cyan-400 text-sm font-medium mb-6">{item.benefit}</p>
                      <ul className="space-y-3 mt-auto flex-1">
                        {item.features.map((feature: string, j: number) => (
                          <li key={j} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                            <span className="text-slate-300 text-sm leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </StaggerItem>
                );
              })}
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Why Use Blueprints */}
      <section className="py-20 bg-[#05070D]">
        <div className="container mx-auto px-6 relative z-10">
          <SectionWrapper>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-center mb-12">
              {dict.blueprints.whyTitle}
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {dict.blueprints.whyItems.map((item, i: number) => {
                const Icon = whyIcons[i % whyIcons.length];
                return (
                  <div key={i} className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4 border border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/10 to-violet-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection 
        title={dict.blueprints.cta.title} 
        description={dict.blueprints.cta.description} 
        button={dict.blueprints.cta.button} 
        href={'/' + locale + '/contact'} 
      />

      <MarketingFooter dict={dict} />
    </main>
  );
}
