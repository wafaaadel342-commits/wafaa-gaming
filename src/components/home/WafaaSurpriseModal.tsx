import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Heart, Maximize2, Sparkles, X } from "lucide-react";

export const WAFAA_SURPRISE_STORAGE_KEY = "wafaa_surprise_seen_v1";

interface FloatingHeart {
  id: number;
  left: string;
  size: number;
  delay: number;
  duration: number;
}

const FLOATING_HEARTS: FloatingHeart[] = [
  { id: 1, left: "8%", size: 16, delay: 0, duration: 6 },
  { id: 2, left: "22%", size: 22, delay: 1.6, duration: 7 },
  { id: 3, left: "42%", size: 14, delay: 0.8, duration: 5.5 },
  { id: 4, left: "68%", size: 20, delay: 2.2, duration: 6.8 },
  { id: 5, left: "82%", size: 16, delay: 1.2, duration: 6.2 },
  { id: 6, left: "94%", size: 12, delay: 2.8, duration: 5 },
];

export function WafaaSurpriseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const hasTriggeredRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Ensure we are in browser environment
    if (typeof window === "undefined") return;

    // Check if already seen
    try {
      const seen = localStorage.getItem(WAFAA_SURPRISE_STORAGE_KEY);
      if (seen) {
        return;
      }
    } catch {
      // In case localStorage is blocked by browser privacy settings
      return;
    }

    // Guard against repeated renders / StrictMode double-execution
    if (hasTriggeredRef.current) return;

    // Wait exactly 1000 milliseconds (1 second) after the homepage has loaded
    const timer = window.setTimeout(() => {
      hasTriggeredRef.current = true;

      // Double-check localStorage before showing
      try {
        if (localStorage.getItem(WAFAA_SURPRISE_STORAGE_KEY)) {
          return;
        }
        // Save the seen status when the popup becomes visible
        localStorage.setItem(WAFAA_SURPRISE_STORAGE_KEY, "true");
      } catch (err) {
        console.warn("Could not write to localStorage:", err);
      }

      setIsOpen(true);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    setIsGalleryOpen(false);
    // Keep seen status saved
    try {
      localStorage.setItem(WAFAA_SURPRISE_STORAGE_KEY, "true");
    } catch {}
    setIsOpen(false);
  };

  // Keyboard accessibility: Escape key to close gallery first, then modal
  useEffect(() => {
    if (!isOpen && !isGalleryOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isGalleryOpen) {
          setIsGalleryOpen(false);
        } else {
          handleClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Prevent background scrolling while modal or gallery is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, isGalleryOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wafaa-surprise-title"
            aria-describedby="wafaa-surprise-desc"
            dir="rtl"
            className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-6 overflow-x-hidden overflow-y-auto"
          >
            {/* Backdrop with soft blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
              onClick={handleClose}
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-md"
              aria-hidden="true"
            />

            {/* Floating subtle romantic hearts */}
            {!shouldReduceMotion && (
              <div
                className="fixed inset-0 pointer-events-none overflow-hidden z-0"
                aria-hidden="true"
              >
                {FLOATING_HEARTS.map((h) => (
                  <motion.div
                    key={h.id}
                    initial={{ y: "100vh", opacity: 0, scale: 0.8 }}
                    animate={{
                      y: "-10vh",
                      opacity: [0, 0.45, 0.45, 0],
                      scale: [0.8, 1.1, 0.9, 1],
                    }}
                    transition={{
                      duration: h.duration,
                      delay: h.delay,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ left: h.left }}
                    className="absolute text-rose-300/40 select-none"
                  >
                    <Heart
                      size={h.size}
                      fill="currentColor"
                      className="drop-shadow-[0_2px_8px_rgba(244,114,182,0.3)]"
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Modal Container */}
            <motion.div
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.92, y: 16 }
              }
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.94, y: 12 }
              }
              transition={{
                duration: shouldReduceMotion ? 0.15 : 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative z-10 w-full max-w-4xl max-h-[min(90vh,820px)] flex flex-col my-auto rounded-[28px] sm:rounded-[34px] p-1 bg-gradient-to-b from-[#f3dfb9] via-[#fcebe4] to-[#f4d1c1] shadow-[0_25px_70px_-15px_rgba(136,19,55,0.28),0_0_40px_rgba(244,114,182,0.18)]"
            >
              {/* Inner Card */}
              <div className="relative w-full h-full rounded-[26px] sm:rounded-[32px] bg-gradient-to-br from-[#fffdfa] via-[#fdf7f2] to-[#fff1f2] border border-white/80 overflow-y-auto overscroll-contain p-5 sm:p-7 md:p-9">
                {/* Close Button (X) */}
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="إغلاق"
                  className="absolute top-3.5 sm:top-5 start-3.5 sm:start-5 z-20 size-9 sm:size-10 rounded-full bg-white/85 hover:bg-rose-100/80 text-stone-500 hover:text-rose-900 border border-amber-200/50 shadow-xs flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <X className="size-4 sm:size-5" />
                </button>

                {/* Modal Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center pt-6 sm:pt-4 md:pt-0">
                  {/* Photo Column - Interactive click to open in gallery lightbox */}
                  <div className="md:col-span-5 flex flex-col items-center">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setIsGalleryOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setIsGalleryOpen(true);
                        }
                      }}
                      aria-label="فتح الصورة في المعرض"
                      className="group cursor-pointer relative w-full max-w-[340px] md:max-w-none mx-auto p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#dfbe82] via-[#faeed9] to-[#d4af37] shadow-lg shadow-rose-950/15 hover:shadow-xl hover:shadow-rose-950/25 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      {/* Inner Picture Container */}
                      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-rose-50/60 aspect-[3/2] w-full">
                        <img
                          src="/icons/wafaa-surprise.webp"
                          alt="إسلام ووفاء"
                          className="w-full h-full object-cover object-center block select-none transition-transform duration-500 group-hover:scale-105"
                          loading="eager"
                          decoding="async"
                        />
                        {/* Delicate subtle inner vignette */}
                        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-amber-900/10 rounded-xl sm:rounded-2xl" />

                        {/* Top-end gallery hint badge */}
                        <div className="absolute top-2 end-2 z-10 transition-transform duration-200 group-hover:scale-105">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-[10px] sm:text-[11px] font-semibold text-white shadow-sm">
                            <Maximize2 className="size-3 text-rose-300" />
                            <span>عرض بالمعرض</span>
                          </span>
                        </div>

                        {/* Gentle decorative bottom badge */}
                        <div className="absolute bottom-2 inset-x-3 flex justify-center pointer-events-none">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-amber-200/70 text-[11px] sm:text-xs font-bold text-rose-950 shadow-sm">
                            <Heart className="size-3 text-rose-500 fill-rose-500" />
                            <span>معاً دائماً وأبداً</span>
                            <Sparkles className="size-3 text-amber-500" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Column */}
                  <div className="md:col-span-7 flex flex-col text-start justify-center">
                    {/* Title Badge / Header */}
                    <div className="mb-3.5 sm:mb-4 flex items-center gap-2">
                      <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                      <h2
                        id="wafaa-surprise-title"
                        className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-rose-950 tracking-tight flex items-center gap-2"
                      >
                        <span>وفاء عادل</span>
                        <span className="text-rose-600 inline-block text-2xl" aria-hidden="true">
                          ❤️
                        </span>
                      </h2>
                    </div>

                    {/* Romantic Message */}
                    <div
                      id="wafaa-surprise-desc"
                      className="space-y-3 sm:space-y-3.5 text-stone-700 text-xs sm:text-sm md:text-[15px] leading-relaxed sm:leading-relaxed font-normal"
                    >
                      <p>
                        عارفة إن الموقع ده مليان ألعاب وتحديات، بس الحقيقة إن أجمل حاجة فيه مش أي لعبة… أجمل حاجة إنه معمول مخصوص علشانك.
                      </p>
                      <p>
                        كل تفصيلة فيه وراها وقت ومجهود، وكل مرة كنت بشتغل فيه كنت بتخيل فرحتك وأنتِ بتفتحيه لأول مرة.
                      </p>
                      <p>
                        يمكن دي مجرد هدية بسيطة، بس أتمنى تفضل تفكرك دايمًا إنك مميزة جدًا عندي.
                      </p>
                      <p className="pt-2 text-sm sm:text-base font-bold text-rose-900 flex items-center gap-1.5">
                        <span>من إسلام.. بكل حب</span>
                        <span className="text-rose-600 inline-block" aria-hidden="true">
                          ❤️
                        </span>
                      </p>
                    </div>

                    {/* Prominent Entrance Button */}
                    <div className="pt-5 sm:pt-6">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-700 hover:via-rose-600 hover:to-amber-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-600/30 hover:shadow-xl hover:shadow-rose-600/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ring-2 ring-amber-300/60 hover:ring-amber-300"
                      >
                        <span>يلا نبدأ المفاجأة</span>
                        <span className="text-white" aria-hidden="true">❤️</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Photo Gallery Lightbox */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="معرض الصور — وفاء وإسلام"
            dir="rtl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onClick={() => setIsGalleryOpen(false)}
            className="fixed inset-0 z-[120] flex items-center justify-center p-3.5 sm:p-6 select-none overflow-hidden bg-black/90 backdrop-blur-xl"
          >
            {/* Gallery Close Button (X) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsGalleryOpen(false);
              }}
              aria-label="إغلاق المعرض"
              className="absolute top-4 sm:top-6 end-4 sm:end-6 z-30 size-11 sm:size-12 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/30 backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <X className="size-6 text-white" />
            </button>

            {/* Gallery Content */}
            <motion.div
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.9, y: 12 }
              }
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.92, y: 10 }
              }
              transition={{
                duration: shouldReduceMotion ? 0.15 : 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-20 max-w-[94vw] max-h-[90vh] flex flex-col items-center"
            >
              {/* Luxury gold frame around high-res image */}
              <div className="p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#dfbe82] via-[#faeed9] to-[#d4af37] shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_50px_rgba(244,114,182,0.2)]">
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-black/40">
                  <img
                    src="/icons/wafaa-surprise.webp"
                    alt="إسلام ووفاء"
                    className="max-w-[90vw] max-h-[76vh] w-auto h-auto object-contain block rounded-xl sm:rounded-2xl"
                    loading="eager"
                  />
                </div>
              </div>

              {/* Romantic Caption */}
              <div className="mt-3.5 flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-rose-100 text-xs sm:text-sm font-semibold tracking-wide drop-shadow-md">
                <Heart className="size-3.5 sm:size-4 text-rose-400 fill-rose-400" />
                <span>أجمل اللحظات معاً.. وفاء وإسلام</span>
                <Heart className="size-3.5 sm:size-4 text-rose-400 fill-rose-400" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
