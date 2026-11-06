import { CheckCircle2, HelpCircle, X } from "lucide-react";
import React from "react";

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl text-foreground flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="font-extrabold text-base sm:text-lg">كيف تلعب خمن الكلمة؟</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-foreground/90">
          <p>
            خمّن الكلمة السرية المكونة من <strong>٥ حروف عربية</strong> في <strong>٦ محاولات</strong> فقط.
          </p>

          <p className="text-muted-foreground text-xs">
            كل تخمين يجب أن يكون كلمة عربية مقبولة. بعد إدخال الكلمة، ستتلون المربعات لتوضح مدى قرب تخمينك:
          </p>

          {/* Examples */}
          <div className="space-y-3 pt-1">
            {/* Green Example */}
            <div className="bg-muted/40 p-3 rounded-2xl border border-border/50 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 dir-rtl">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-base">
                  م
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold flex items-center justify-center border border-border text-base">
                  د
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold flex items-center justify-center border border-border text-base">
                  ر
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold flex items-center justify-center border border-border text-base">
                  س
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold flex items-center justify-center border border-border text-base">
                  ة
                </div>
              </div>
              <p className="text-xs">
                حرف <span className="font-bold text-emerald-600">الميم (م)</span> صحيح وموجود في مكانه الصحيح تماماً.
              </p>
            </div>

            {/* Yellow Example */}
            <div className="bg-muted/40 p-3 rounded-2xl border border-border/50 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 dir-rtl">
                <div className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold flex items-center justify-center border border-border text-base">
                  ك
                </div>
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white font-black flex items-center justify-center text-base">
                  ت
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold flex items-center justify-center border border-border text-base">
                  ا
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold flex items-center justify-center border border-border text-base">
                  ب
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold flex items-center justify-center border border-border text-base">
                  ة
                </div>
              </div>
              <p className="text-xs">
                حرف <span className="font-bold text-amber-500">التاء (ت)</span> موجود في الكلمة السرية، لكن في موضع آخر.
              </p>
            </div>

            {/* Gray Example */}
            <div className="bg-muted/40 p-3 rounded-2xl border border-border/50 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 dir-rtl">
                <div className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold flex items-center justify-center border border-border text-base">
                  ش
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold flex items-center justify-center border border-border text-base">
                  ا
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-500 text-white font-black flex items-center justify-center text-base">
                  ر
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold flex items-center justify-center border border-border text-base">
                  ع
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold flex items-center justify-center border border-border text-base">
                  ن
                </div>
              </div>
              <p className="text-xs">
                حرف <span className="font-bold text-slate-500">الراء (ر)</span> غير موجود في الكلمة السرية على الإطلاق.
              </p>
            </div>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>فهمت القواعد، فلنبدأ!</span>
        </button>
      </div>
    </div>
  );
};

