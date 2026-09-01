'use client';

import { motion } from 'framer-motion';
import type { SiteDictionary, ComparisonRow } from '@/lib/i18n/types';

export function ComparisonSection({ dict }: { dict: SiteDictionary }) {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rows: ComparisonRow[] = dict.home.comparison.rows || [];
  const headers = dict.home.comparison.headers || ['المعيار', 'Excel', 'أنظمة تقليدية', 'HumAi'];

  return (
    <section className="py-24 relative z-10 bg-[#0D1117]/40 border-y border-white/[0.06]" dir={dict.dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-3">
          <span className="inline-flex items-center gap-2 bg-cyan-400/5 text-cyan-400 px-4 py-1.5 rounded-full text-xs font-semibold border border-cyan-400/20">
            {dict.home.comparison.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F0F4FF] tracking-tight">
            {dict.home.comparison.title}
          </h2>
          <p className="text-[#94A3B8] text-sm sm:text-base max-w-2xl mx-auto">
            {dict.home.comparison.subtitle}
          </p>
        </div>

        {/* Header row */}
        <div className="hidden md:grid grid-cols-4 gap-4 px-6 py-3 mb-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
          <div>{headers[0]}</div>
          <div>{headers[1]}</div>
          <div>{headers[2]}</div>
          <div className="text-cyan-400">{headers[3]}</div>
        </div>

        <div className="space-y-2">
          {rows.map((row: ComparisonRow, index: number) => (
            <motion.div
              key={index}
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="glass-card rounded-xl px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 items-center"
            >
              <div className="font-semibold text-[#F0F4FF] col-span-2 md:col-span-1 text-sm">
                {row.criteria}
              </div>
              <div className="hidden md:block text-[#4B5567] text-sm">{row.excel}</div>
              <div className="text-[#4B5567] text-sm">{row.legacy}</div>
              <div className="bg-gradient-to-b from-cyan-400/5 to-violet-500/5 border border-cyan-400/20 rounded-xl px-3 py-2 flex items-center gap-2">
                <span className="text-cyan-400 font-semibold text-sm">{row.humai}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Also export as default for backward compat
export default ComparisonSection;
