/**
 * PWA Management Module — "العب وتعلم"
 * Handles Service Worker registration, install prompts, platform detection, and updates.
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface WindowWithMSStream extends Window {
  MSStream?: unknown;
}

export interface PwaState {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  updateAvailable: boolean;
  isOnline: boolean;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let swRegistration: ServiceWorkerRegistration | null = null;
const listeners = new Set<(state: PwaState) => void>();

let pwaState: PwaState = {
  canInstall: false,
  isInstalled: false,
  isStandalone: false,
  isIOS: false,
  updateAvailable: false,
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
};

function notify() {
  for (const listener of listeners) {
    try {
      listener(pwaState);
    } catch (err) {
      console.error("[PWA] Listener error:", err);
    }
  }
}

export function getPwaState(): PwaState {
  return pwaState;
}

export function subscribePwaState(listener: (state: PwaState) => void): () => void {
  listeners.add(listener);
  listener(pwaState);
  return () => {
    listeners.delete(listener);
  };
}

/** Check if running inside standalone PWA mode */
export function checkIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const isStandaloneMatch = window.matchMedia("(display-mode: standalone)").matches;
  const isIosStandalone = (window.navigator as NavigatorWithStandalone).standalone === true;
  return isStandaloneMatch || isIosStandalone;
}

/** Check if current device is iOS */
export function checkIsIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) && !(window as WindowWithMSStream).MSStream;
}

/** Trigger native installation prompt (Android / Chrome / Edge) */
export async function promptPwaInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }
  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    pwaState = {
      ...pwaState,
      canInstall: false,
      isInstalled: outcome === "accepted",
    };
    notify();
    return outcome === "accepted";
  } catch (err) {
    console.warn("[PWA] Install prompt failed:", err);
    return false;
  }
}

/** Trigger Service Worker skip waiting to activate latest update */
export function updatePwa(): void {
  if (!swRegistration || !swRegistration.waiting) {
    window.location.reload();
    return;
  }
  swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
}

/** Initialize PWA listeners & Service Worker registration */
export function initPwa(): void {
  if (typeof window === "undefined") return;

  const isStandalone = checkIsStandalone();
  const isIOS = checkIsIOS();

  pwaState = {
    ...pwaState,
    isStandalone,
    isInstalled: isStandalone,
    isIOS,
    isOnline: navigator.onLine,
  };
  notify();

  // 1. Online / Offline listeners
  window.addEventListener("online", () => {
    pwaState = { ...pwaState, isOnline: true };
    notify();
  });
  window.addEventListener("offline", () => {
    pwaState = { ...pwaState, isOnline: false };
    notify();
  });

  // 2. Standalone change listener
  window.matchMedia("(display-mode: standalone)").addEventListener("change", (e) => {
    pwaState = {
      ...pwaState,
      isStandalone: e.matches,
      isInstalled: e.matches,
      canInstall: e.matches ? false : pwaState.canInstall,
    };
    notify();
  });

  // 3. Android / Chromium beforeinstallprompt event
  window.addEventListener("beforeinstallprompt", (event) => {
    const e = event as BeforeInstallPromptEvent;
    e.preventDefault();
    deferredPrompt = e;
    pwaState = {
      ...pwaState,
      canInstall: true,
      isInstalled: false,
    };
    notify();
  });

  // 4. appinstalled event
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    pwaState = {
      ...pwaState,
      canInstall: false,
      isInstalled: true,
    };
    notify();
  });

  // 5. Register Service Worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        swRegistration = reg;

        // Check for updates periodically
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              pwaState = { ...pwaState, updateAvailable: true };
              notify();
            }
          });
        });

        // Auto reload when the new worker takes control
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
      } catch (err) {
        console.warn("[PWA] Service worker registration failed:", err);
      }
    });
  }
}
