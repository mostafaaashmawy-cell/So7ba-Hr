import { getDictionary, locales, type Locale } from '@/lib/i18n';
import type { StatItem, PillarItem, TestimonialItem, StepItem } from '@/lib/i18n/types';
import { MarketingNavbar } from '@/components/marketing/layout/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/layout/MarketingFooter';
import { WhatsAppChatDemo } from '@/components/marketing/shared/WhatsAppChatDemo';
import { ComparisonSection } from '@/components/marketing/shared/ComparisonTable';
import { FAQAccordion } from '@/components/marketing/shared/FAQAccordion';
import { CTASection } from '@/components/marketing/shared/CTASection';
import { GlowOrbs } from '@/components/marketing/shared/GlowOrbs';
import { SectionWrapper, StaggerContainer, StaggerItem } from '@/components/marketing/motion/SectionWrapper';
import { CountUp } from '@/components/marketing/shared/CountUp';
import { Sparkles, ShieldCheck, Cpu, CreditCard, ArrowRight, CheckCircle, Quote } from 'lucide-react';
import Link from 'next/link';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  return { title: dict.home.meta.title, description: dict.home.meta.description };
}

const TRUST_ICONS = [ShieldCheck, Cpu, CreditCard];

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <>
      <MarketingNavbar dict={dict} />

      <main className="flex-1">
        {/* ── 1. Hero ── */}
        <section className="relative overflow-hidden bg-[#05070D] dot-grid-bg min-h-screen flex items-center justify-center pt-24 pb-20">
          <GlowOrbs />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <SectionWrapper>
              <StaggerContainer className="flex flex-col items-center text-center max-w-4xl mx-auto">
                {/* Eyebrow */}
                <StaggerItem>
                  <div className="inline-flex items-center gap-2 border border-cyan-400/30 text-cyan-400 bg-cyan-400/5 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{dict.home.hero.eyebrow}</span>
                  </div>
                </StaggerItem>

                {/* H1 */}
                <StaggerItem>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
                    {dict.home.hero.h1}
                  </h1>
                </StaggerItem>

                {/* Subhead */}
                <StaggerItem>
                  <p className="text-[#94A3B8] text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                    {dict.home.hero.subhead}
                  </p>
                </StaggerItem>

                {/* CTAs */}
                <StaggerItem className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                  <Link
                    href={`/${locale}/contact`}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold btn-gradient glow-pulse text-white text-sm"
                  >
                    {dict.home.hero.cta1}
                  </Link>
                  <a
                    href="#whatsapp-demo"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold border border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.07] transition-all text-sm"
                  >
                    {dict.home.hero.cta2}
                  </a>
                </StaggerItem>

                {/* Trust Badges */}
                <StaggerItem className="w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {dict.home.hero.trustBadges.map((badge, i) => {
                      const Icon = TRUST_ICONS[i] ?? CheckCircle;
                      return (
                        <div key={i} className="bg-[#0D1117]/60 border border-white/[0.06] rounded-2xl px-4 py-3.5 flex items-center gap-3">
                          <Icon className="w-5 h-5 text-cyan-400 shrink-0" />
                          <span className="text-xs text-[#94A3B8] text-start leading-snug">{badge}</span>
                        </div>
                      );
                    })}
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </SectionWrapper>
          </div>
        </section>

        {/* ── 2. Stats ── */}
        <section className="bg-[#0D1117]/40 border-y border-white/[0.06] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionWrapper>
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
                  {dict.home.stats.sectionTitle}
                </h2>
                <p className="text-[#94A3B8] text-sm">{dict.home.stats.sectionSubtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dict.home.stats.items.map((stat: StatItem, index: number) => (
                  <div key={index} className="glass-card rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="text-4xl sm:text-5xl font-extrabold gradient-text">
                      {stat.isNumber && stat.numericValue !== undefined
                        ? <CountUp value={stat.numericValue} suffix="%" />
                        : stat.value}
                    </div>
                    <p className="text-[#94A3B8] text-sm leading-relaxed">{stat.description}</p>
                  </div>
                ))}
              </div>
            </SectionWrapper>
          </div>
        </section>

        {/* ── 3. Three Pillars (Bento Grid) ── */}
        <section className="bg-[#05070D] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionWrapper>
              <div className="text-center mb-16 space-y-3">
                <div className="inline-flex items-center gap-2 border border-cyan-400/30 text-cyan-400 bg-cyan-400/5 text-xs font-semibold px-3 py-1 rounded-full">
                  {dict.home.pillars.badge}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {dict.home.pillars.title}
                </h2>
                <p className="text-[#94A3B8] text-sm sm:text-base max-w-2xl mx-auto">
                  {dict.home.pillars.subtitle}
                </p>
              </div>

              <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column: Pillars 1 & 2 stacked */}
                <div className="flex flex-col gap-6">
                  {dict.home.pillars.items.slice(0, 2).map((item: PillarItem, idx: number) => (
                    <StaggerItem key={idx} className="flex-1">
                      <div className="glass-card rounded-3xl p-8 flex flex-col justify-between h-full">
                        <div className="space-y-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/10 to-violet-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 text-xl font-bold">
                            {item.number}
                          </div>
                          <h3 className="text-xl font-bold text-white">{item.title}</h3>
                          <p className="text-[#94A3B8] text-sm leading-relaxed">{item.description}</p>
                        </div>
                        <div className="pt-5 border-t border-white/[0.06] mt-5">
                          {item.footerHref ? (
                            <Link href={item.footerHref} className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                              <span>{item.footerText}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold">
                              <CheckCircle className="w-4 h-4" />
                              <span>{item.footerText}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </div>

                {/* Right column: Pillar 3 (AI Powered) full height */}
                <StaggerItem>
                  {(() => {
                    const item = dict.home.pillars.items[2] as PillarItem;
                    return (
                      <div className="glass-card-featured rounded-3xl p-8 flex flex-col justify-between h-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-violet-500/10 pointer-events-none" />
                        <div className="relative z-10 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 text-xl font-bold shrink-0">
                              {item.number}
                            </div>
                            {item.badge && (
                              <span className="mt-1 text-[10px] bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-bold px-2.5 py-1 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                          <p className="text-[#94A3B8] text-sm leading-relaxed">{item.description}</p>
                        </div>
                        <div className="relative z-10 pt-6 border-t border-white/[0.06] mt-8">
                          {item.footerHref && (
                            <Link href={item.footerHref} className="inline-flex items-center gap-2 text-sm font-semibold gradient-text hover:opacity-80 transition-opacity">
                              <span>{item.footerText}</span>
                              <ArrowRight className="w-4 h-4 text-cyan-400" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </StaggerItem>
              </StaggerContainer>
            </SectionWrapper>
          </div>
        </section>

        {/* ── 4. WhatsApp Demo ── */}
        <section id="whatsapp-demo" className="bg-[#0D1117]/40 border-y border-white/[0.06] py-20 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionWrapper>
              <div className="text-center mb-12 space-y-3">
                <div className="inline-flex items-center gap-2 border border-cyan-400/30 text-cyan-400 bg-cyan-400/5 text-xs font-semibold px-3 py-1 rounded-full">
                  {dict.home.whatsappDemo.badge}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {dict.home.whatsappDemo.title}
                </h2>
                <p className="text-[#94A3B8] text-sm sm:text-base max-w-2xl mx-auto">
                  {dict.home.whatsappDemo.subtitle}
                </p>
              </div>
              <WhatsAppChatDemo disclaimer={dict.home.whatsappDemo.chatDisclaimer} />
            </SectionWrapper>
          </div>
        </section>

        {/* ── 5. How It Works ── */}
        <section className="bg-[#05070D] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionWrapper>
              <div className="text-center mb-16 space-y-3">
                <div className="inline-flex items-center gap-2 border border-cyan-400/30 text-cyan-400 bg-cyan-400/5 text-xs font-semibold px-3 py-1 rounded-full">
                  {dict.home.howItWorks.badge}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {dict.home.howItWorks.title}
                </h2>
                <p className="text-[#94A3B8] text-sm sm:text-base max-w-2xl mx-auto">
                  {dict.home.howItWorks.subtitle}
                </p>
              </div>

              <div className="relative">
                {/* Connector line */}
                <div className="hidden md:block absolute top-5 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                  {dict.home.howItWorks.steps.map((step: StepItem, index: number) => (
                    <div key={index} className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center font-bold text-white text-sm mb-6 shadow-lg shadow-cyan-500/20">
                        {step.number}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                      <p className="text-[#94A3B8] text-sm leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionWrapper>
          </div>
        </section>

        {/* ── 6. Comparison ── */}
        <ComparisonSection dict={dict} />

        {/* ── 7. Testimonials ── */}
        <section className="bg-[#0D1117]/30 border-t border-white/[0.06] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionWrapper>
              <div className="text-center mb-16 space-y-3">
                <div className="inline-flex items-center gap-2 border border-cyan-400/30 text-cyan-400 bg-cyan-400/5 text-xs font-semibold px-3 py-1 rounded-full">
                  <Quote className="w-3.5 h-3.5" />
                  {dict.home.testimonials.badge}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {dict.home.testimonials.title}
                </h2>
                <p className="text-[#94A3B8] text-sm sm:text-base max-w-2xl mx-auto">
                  {dict.home.testimonials.subtitle}
                </p>
              </div>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dict.home.testimonials.items.map((item: TestimonialItem, index: number) => (
                  <StaggerItem key={index} className="h-full">
                    <div className="glass-card rounded-3xl p-7 flex flex-col justify-between h-full">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-amber-400 text-lg tracking-wider">★★★★★</div>
                          {item.isPilot && (
                            <span className="text-[10px] bg-[#161B27] border border-white/[0.06] text-[#94A3B8] px-2 py-0.5 rounded-full">
                              {dict.home.testimonials.pilotLabel}
                            </span>
                          )}
                        </div>
                        <p className="text-[#94A3B8] text-sm leading-relaxed italic">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                      </div>
                      <div className="pt-5 border-t border-white/[0.06] mt-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {item.initials}
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">{item.name}</div>
                          <div className="text-[#94A3B8] text-xs">{item.role}</div>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </SectionWrapper>
          </div>
        </section>

        {/* ── 8. FAQ ── */}
        <section className="py-20 bg-[#05070D]">
          <FAQAccordion items={dict.shared.faq.items} sectionTitle={dict.shared.faq.sectionTitle} />
        </section>

        {/* ── 9. CTA ── */}
        <CTASection
          title={dict.home.cta.title}
          description={dict.home.cta.description}
          button={dict.home.cta.button}
          href={`/${locale}/contact`}
        />
      </main>

      <MarketingFooter dict={dict} />
    </>
  );
}
