'use client';

import { motion } from 'framer-motion';
import type { SiteDictionary, PricingPlan, PricingFeature } from '@/lib/i18n/types';
import Link from 'next/link';

const POPULAR_LABEL: Record<string, string> = {
  ar: 'الأكثر شيوعاً',
  en: 'Most Popular',
};

export function PricingTable({ dict }: { dict: SiteDictionary }) {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plans: PricingPlan[] = dict.pricing.plans || [];
  const features: PricingFeature[] = dict.pricing.features || [];

  const popularLabel = POPULAR_LABEL[dict.locale] ?? 'Most Popular';

  const cellValue = (val: string) => {
    if (val === '✓') return <span className="text-cyan-400 font-bold text-base">✓</span>;
    if (val === '✗') return <span className="text-[#4B5567]">✗</span>;
    return <span className="text-[#94A3B8] text-sm">{val}</span>;
  };

  return (
    <div className="space-y-12" dir={dict.dir}>
      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan: PricingPlan, index: number) => {
          const isFeatured = plan.isPopular === true;
          return (
            <motion.div
              key={index}
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 flex flex-col ${isFeatured ? 'glass-card-featured' : 'glass-card'}`}
            >
              {isFeatured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-violet-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                  {popularLabel}
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-[#94A3B8] text-sm">{plan.subtitle}</p>
              </div>
              <div className="mb-8">
                <span className="text-3xl font-bold text-white opacity-60 text-sm">{dict.locale === 'ar' ? 'يُحدَّد قريباً' : 'To be defined'}</span>
              </div>
              <Link
                href={plan.ctaHref}
                className={`w-full text-center py-3 rounded-xl font-semibold transition-all mb-8 block text-sm ${
                  isFeatured
                    ? 'btn-gradient text-white shadow-lg shadow-cyan-500/20'
                    : 'border border-white/[0.08] text-white hover:bg-white/5'
                }`}
              >
                {plan.cta}
              </Link>

              {/* Feature list */}
              <div className="space-y-3 flex-1">
                {features.map((feature: PricingFeature, fi: number) => {
                  const val = index === 0 ? feature.starter : index === 1 ? feature.growth : feature.enterprise;
                  return (
                    <div key={fi} className="flex items-start gap-3 text-sm border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                      <div className="mt-0.5 shrink-0">{cellValue(val)}</div>
                      <span className="text-[#94A3B8]">{feature.name}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default PricingTable;
