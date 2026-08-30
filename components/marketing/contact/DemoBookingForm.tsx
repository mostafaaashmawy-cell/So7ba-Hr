'use client';

import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Users, 
  MessageSquare,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

export function DemoBookingForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    employeeCount: '1-15',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'يرجى إدخال الاسم الكامل';
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'يرجى إدخال اسم الشركة';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'يرجى إدخال البريد الإلكتروني';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'يرجى إدخال بريد إلكتروني صحيح';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'يرجى إدخال رقم الهاتف أو واتساب';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate async submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  if (isSubmitted) {
    return (
      <div className="bg-slate-900 border border-teal-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-5 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">تم استلام طلبك بنجاح!</h3>
          <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
            شكراً لك <span className="font-semibold text-teal-400">{formData.fullName}</span>. سيتواصل معك أحد مستشارينا عبر واتساب أو الهاتف خلال أقل من ساعتين عمل لتحديد موعد العرض التوضيحي المخصص لشركة <span className="font-semibold text-white">{formData.companyName}</span>.
          </p>
        </div>
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://wa.me/201000000000"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2"
          >
            <span>تواصل فوراً عبر واتساب</span>
            <ArrowLeft className="w-4 h-4" />
          </a>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                fullName: '',
                companyName: '',
                email: '',
                phone: '',
                employeeCount: '1-15',
                message: '',
              });
            }}
            className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            إرسال طلب آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6"
    >
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <span>بيانات حجز العرض التوضيحي</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          جلسة مجانية تفاعلية لمدة 30 دقيقة للإجابة على كافة استفساراتكم
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-teal-400" />
            <span>الاسم الكامل <span className="text-rose-400">*</span></span>
          </label>
          <input
            type="text"
            placeholder="مثال: أحمد محمود"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${
              errors.fullName ? 'border-rose-500' : 'border-slate-800'
            }`}
          />
          {errors.fullName && (
            <p className="text-[11px] text-rose-400">{errors.fullName}</p>
          )}
        </div>

        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>اسم الشركة <span className="text-rose-400">*</span></span>
          </label>
          <input
            type="text"
            placeholder="مثال: شركة الأمل للتجارة"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${
              errors.companyName ? 'border-rose-500' : 'border-slate-800'
            }`}
          />
          {errors.companyName && (
            <p className="text-[11px] text-rose-400">{errors.companyName}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-teal-400" />
            <span>البريد الإلكتروني <span className="text-rose-400">*</span></span>
          </label>
          <input
            type="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all dir-ltr text-right ${
              errors.email ? 'border-rose-500' : 'border-slate-800'
            }`}
          />
          {errors.email && (
            <p className="text-[11px] text-rose-400">{errors.email}</p>
          )}
        </div>

        {/* Phone / WhatsApp */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-teal-400" />
            <span>رقم الهاتف / واتساب <span className="text-rose-400">*</span></span>
          </label>
          <input
            type="tel"
            placeholder="010XXXXXXXX"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all dir-ltr text-right ${
              errors.phone ? 'border-rose-500' : 'border-slate-800'
            }`}
          />
          {errors.phone && (
            <p className="text-[11px] text-rose-400">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Employee Count */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-teal-400" />
          <span>عدد الموظفين في الشركة</span>
        </label>
        <select
          value={formData.employeeCount}
          onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
        >
          <option value="1-15">من 1 إلى 15 موظف (باقة Starter)</option>
          <option value="16-50">من 16 إلى 50 موظف (باقة Growth)</option>
          <option value="50+">أكثر من 50 موظف (باقة Enterprise)</option>
        </select>
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
          <span>رسالة أو استفسار خاص (اختياري)</span>
        </label>
        <textarea
          rows={3}
          placeholder="أخبرنا عن طبيعة نشاطك أو أي تحديات تواجهها حالياً في إدارة الحضور أو الرواتب..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all resize-none"
        ></textarea>
      </div>

      {/* Submit Button */}
      <div className="pt-2 space-y-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl text-base font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          {isSubmitting ? (
            <span>جاري إرسال طلبك...</span>
          ) : (
            <>
              <span>احجز عرضك التوضيحي المجاني</span>
              <Send className="w-4 h-4 rotate-180" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>بياناتك محمية تماماً ولن تتم مشاركتها مع أي طرف ثالث.</span>
        </div>
      </div>
    </form>
  );
}
