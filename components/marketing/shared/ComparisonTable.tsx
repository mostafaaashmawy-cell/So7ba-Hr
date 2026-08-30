import { Sparkles } from 'lucide-react';

export function ComparisonSection() {
  const rows = [
    {
      metric: 'وقت الإعداد',
      excel: 'أيام لكل دورة رواتب',
      traditional: 'أسابيع للتنفيذ والتدريب',
      humai: 'دقائق معدودة',
      highlight: true,
    },
    {
      metric: 'التكلفة الإجمالية',
      excel: 'مجاني ظاهرياً لكنه مكلّف جداً بالوقت والجهد',
      traditional: 'مرتفعة، غير مناسبة لإمكانيات الـ SMEs',
      humai: 'مصممة خصيصاً لميزانية الشركات الصغيرة والمتوسطة',
      highlight: true,
    },
    {
      metric: 'دعم عربي ومصري كامل',
      excel: 'جزئي وغير منظم',
      traditional: 'نادر ويتطلب تعريب معقد',
      humai: 'كامل (لغة، قنوات دفع: InstaPay، ممارسات العمل)',
      highlight: true,
    },
    {
      metric: 'تحكم واستعلام عبر واتساب',
      excel: 'غير متاح ✗',
      traditional: 'غير متاح ✗',
      humai: 'متاح ومدمج بالذكاء الاصطناعي ✓',
      highlight: true,
      badge: 'ميزة حصرية',
    },
    {
      metric: 'احتمالية الخطأ البشري',
      excel: 'مرتفعة (معادلات يدوية وتعديل غير مراقب)',
      traditional: 'متوسطة (تعتمد على إدخال البيانات اليدوي)',
      humai: 'منخفضة للغاية (تأكيد مزدوج + سجل رقابة كامل)',
      highlight: true,
    },
  ];

  return (
    <section className="py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>المقارنة الشاملة</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            ليه HumAi وملهوش غيره؟
          </h2>
          <p className="mt-3 text-slate-400 text-base">
            اكتشف الفرق بين الاعتماد على الطرق التقليدية أو ملفات الإكسيل وبين إدارة شركتك بمنظومة ذكية مؤتمتة بالكامل.
          </p>
        </div>

        {/* Comparison Table for Desktop / Tablet */}
        <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-sm">
                <th className="py-5 px-6 font-bold text-slate-200 w-1/4">المعيار</th>
                <th className="py-5 px-6 font-semibold text-slate-400 w-1/4">ملفات Excel يدوية</th>
                <th className="py-5 px-6 font-semibold text-slate-400 w-1/4">أنظمة HR تقليدية</th>
                <th className="py-5 px-6 font-bold text-teal-400 w-1/4 bg-teal-950/30 border-r border-l border-teal-500/20">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>منظومة HumAi</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-200">
                    <div className="flex items-center gap-2">
                      <span>{row.metric}</span>
                      {row.badge && (
                        <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-bold border border-teal-500/30">
                          {row.badge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400">{row.excel}</td>
                  <td className="py-4 px-6 text-slate-400">{row.traditional}</td>
                  <td className="py-4 px-6 font-semibold text-white bg-teal-950/20 border-r border-l border-teal-500/20">
                    <span className="text-teal-300">{row.humai}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards */}
        <div className="md:hidden space-y-4">
          {rows.map((row, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-sm">{row.metric}</span>
                {row.badge && (
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-bold">
                    {row.badge}
                  </span>
                )}
              </div>
              <div className="bg-teal-950/40 border border-teal-500/30 rounded-xl p-3">
                <div className="text-xs font-bold text-teal-400 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>HumAi:</span>
                </div>
                <p className="text-xs text-white font-medium">{row.humai}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Excel:</span>
                  <span className="text-slate-300">{row.excel}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">أنظمة تقليدية:</span>
                  <span className="text-slate-300">{row.traditional}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
