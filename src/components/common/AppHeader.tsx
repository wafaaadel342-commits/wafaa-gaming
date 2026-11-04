import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Home, Moon, Settings as SettingsIcon, Sun, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sound } from "@/lib/sound";
import { THEME_KEY } from "@/lib/quiz";
import { getPwaState, subscribePwaState, type PwaState } from "@/lib/pwa";
import { PwaInstallDialog } from "./PwaInstallDialog";

interface AppHeaderProps {
  onOpenSettings?: () => void;
  showHomeButton?: boolean;
  gameTitle?: string;
}

export function AppHeader({ onOpenSettings, showHomeButton = false, gameTitle }: AppHeaderProps) {
  const [dark, setDark] = useState(false);
  const [muted, setMuted] = useState(false);
  const [pwaState, setPwaState] = useState<PwaState>(() => getPwaState());
  const [installDialogOpen, setInstallDialogOpen] = useState(false);

  useEffect(() => {
    const unsubPwa = subscribePwaState(setPwaState);
    return unsubPwa;
  }, []);

  useEffect(() => {
    const isDark = typeof window !== "undefined" && localStorage.getItem(THEME_KEY) === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    setMuted(sound.isMuted());

    // Auto unlock audio on first interaction
    const unlockAudio = () => {
      sound.unlock();
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  const toggleTheme = () => {
    sound.unlock();
    sound.playClick();
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      // ignore
    }
  };

  const toggleSound = () => {
    sound.unlock();
    const nextMuted = sound.toggleMute();
    setMuted(nextMuted);
    if (!nextMuted) {
      sound.playClick();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          {showHomeButton && (
            <Link
              to="/"
              aria-label="العودة للرئيسية"
              onClick={() => {
                sound.unlock();
                sound.playSwoosh();
              }}
              className="inline-flex items-center justify-center size-9 rounded-lg border border-border/80 bg-card hover:bg-accent/15 text-foreground transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <Home className="size-4" />
            </Link>
          )}

          <Link
            to="/"
            onClick={() => {
              sound.unlock();
              sound.playClick();
            }}
            className="flex items-center gap-3 group cursor-pointer select-none"
          >
            <div className="relative size-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/15 border border-border/80 flex items-center justify-center p-1 shadow-2xs group-hover:border-primary/40 transition-colors">
              <img
                src="/logogame.png"
                alt="شعار العب وتعلم"
                className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-200"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  العب وتعلم
                </span>
                <span className="hidden sm:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  منصة تعليمية
                </span>
              </div>
              {gameTitle ? (
                <span className="text-xs font-medium text-muted-foreground -mt-0.5">
                  {gameTitle}
                </span>
              ) : (
                <span className="hidden sm:block text-[11px] text-muted-foreground">
                  ألعاب تفاعلية وثقافية
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Global Controls */}
        <nav aria-label="أدوات التحكم" className="flex items-center gap-2">
          {!pwaState.isStandalone && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sound.unlock();
                sound.playClick();
                setInstallDialogOpen(true);
              }}
              aria-label="تثبيت التطبيق"
              title="تثبيت تطبيق العب وتعلم"
              className="h-9 px-2.5 sm:px-3 rounded-lg border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all font-bold text-xs gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="size-4 shrink-0" />
              <span className="hidden sm:inline">تثبيت التطبيق</span>
            </Button>
          )}

          {onOpenSettings && (
            <Button
              variant="outline"
              size="icon"
              aria-label="إعدادات الذكاء الاصطناعي"
              title="إعدادات المنصة والذكاء الاصطناعي"
              onClick={() => {
                sound.unlock();
                sound.playClick();
                onOpenSettings();
              }}
              className="size-9 rounded-lg border-border/80 bg-card/80 hover:bg-accent/15 text-foreground transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <SettingsIcon className="size-4 text-foreground/80" />
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            aria-label={muted ? "تشغيل المؤثرات الصوتية" : "كتم المؤثرات الصوتية"}
            title={muted ? "تشغيل الصوت" : "كتم الصوت"}
            onClick={toggleSound}
            className={`size-9 rounded-lg border-border/80 bg-card/80 hover:bg-accent/15 transition-all active:scale-95 cursor-pointer shadow-2xs ${
              muted ? "text-muted-foreground/60" : "text-primary"
            }`}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            aria-label={dark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
            title={dark ? "الوضع النهاري" : "الوضع الليلي"}
            onClick={toggleTheme}
            className="size-9 rounded-lg border-border/80 bg-card/80 hover:bg-accent/15 text-foreground transition-all active:scale-95 cursor-pointer shadow-2xs"
          >
            {dark ? (
              <Sun className="size-4 text-amber-500" />
            ) : (
              <Moon className="size-4 text-foreground/80" />
            )}
          </Button>
        </nav>
      </div>

      <PwaInstallDialog
        open={installDialogOpen}
        onOpenChange={setInstallDialogOpen}
      />
    </header>
  );
}
