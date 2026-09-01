'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Rocket } from 'lucide-react';
import { GlowOrbs } from './GlowOrbs';

interface Props {
  title: string;
  description: string;
  button: string;
  href?: string;
}

export function CTASection({ title, description, button, href = '#' }: Props) {
  return (
    <section className="relative py-24 overflow-hidden border-y border-white/[0.06] bg-[#05070D]">
      <GlowOrbs />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-400 text-sm font-medium mb-6 gap-2">
            <Rocket className="w-4 h-4" />
            <span>Ready to start?</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight gradient-text">
            {title}
          </h2>
          
          <p className="text-lg md:text-xl text-[#94A3B8] mb-10 max-w-2xl mx-auto">
            {description}
          </p>
          
          <Link
            href={href}
            className="btn-gradient glow-pulse inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold text-lg shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
          >
            {button}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
