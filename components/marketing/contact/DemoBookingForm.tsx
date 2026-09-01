'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SiteDictionary } from '@/lib/i18n/types';

export function DemoBookingForm({ dict }: { dict: SiteDictionary }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const f = dict.contact.form;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const inputClass = 'bg-[#161B27] border border-white/[0.06] rounded-xl px-4 py-3 text-[#F0F4FF] focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 w-full outline-none transition-all placeholder:text-[#4B5567] text-sm';
  const labelClass = 'text-sm font-medium text-[#94A3B8] mb-1.5 block';

  const successTitle = dict.locale === 'ar' ? 'شكراً لك!' : 'Thank You!';
  const successMsg = dict.locale === 'ar' ? 'سنتواصل معك في أقرب وقت ممكن.' : 'We will be in touch shortly.';

  return (
    <div className="glass-card rounded-2xl p-8 w-full relative overflow-hidden" dir={dict.dir}>
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>{f.name}</label>
                <input required type="text" placeholder={f.name} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{f.company}</label>
                <input required type="text" placeholder={f.company} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>{f.email}</label>
              <input required type="email" placeholder={f.email} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>{f.phone}</label>
              <input type="tel" placeholder={f.phone} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>{f.employees}</label>
              <select required className={inputClass}>
                <option value="">—</option>
                <option value="1-10">1–10</option>
                <option value="11-25">11–25</option>
                <option value="26-50">26–50</option>
                <option value="51-100">51–100</option>
                <option value="100+">100+</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>{f.message}</label>
              <textarea rows={4} placeholder={f.message} className={inputClass} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gradient w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>...</span>
                </>
              ) : f.submit}
            </button>

            <div className="pt-4 border-t border-white/[0.06]">
              <a
                href={dict.contact.whatsappNumber}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-full py-3 px-4 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 rounded-xl hover:bg-[#25D366]/20 transition-all font-semibold text-sm gap-2"
              >
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span>{dict.contact.whatsappLabel}</span>
              </a>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 bg-cyan-400/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{successTitle}</h3>
            <p className="text-[#94A3B8]">{successMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DemoBookingForm;
