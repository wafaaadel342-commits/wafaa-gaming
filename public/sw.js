/**
 * Service Worker — "العب وتعلم"
 * Complete Progressive Web App (PWA)
 * Version: 1.0.0
 */

const CACHE_VERSION = "al3ab-v1.0.0";
const PRECACHE_ASSETS = [
  "/",
  "/quiz",
  "/words",
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/logogame.png",
  "/apple-touch-icon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-192x192.png",
  "/icons/icon-maskable-512x512.png",
  "/icons/apple-touch-icon.png",
  "/games/knowledge-challenge.webp",
  "/word-builder.webp",
  "/games/proverbs.jpg",
  "/games/true-or-false.jpg",
  "/games/memory-cards.jpg",
  "/games/guess-word.jpg",
];

// Domains/URLs that must NEVER be cached (Security & Privacy rules)
const NEVER_CACHE_HOSTS = ["openrouter.ai", "api.openai.com", "generativelanguage.googleapis.com"];

// Install: Pre-cache core shell & assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn("[SW] Precache partial error (some assets will load on demand):", err);
        });
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate: Clean up old versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_VERSION) {
              console.log("[SW] Removing outdated cache:", key);
              return caches.delete(key);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch: Strategy router
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // 1. SECURITY RULE: Never intercept or cache AI APIs or external auth endpoints
  if (
    NEVER_CACHE_HOSTS.some((host) => url.hostname.includes(host)) ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // 2. Navigation requests (HTML pages) -> Network first, fallback to cache, then offline.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // If valid response, update cache clone
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to offline page
          const offlinePage = await caches.match("/offline.html");
          return (
            offlinePage ||
            new Response("لا يوجد اتصال بالإنترنت", {
              headers: { "Content-Type": "text/html; charset=utf-8" },
            })
          );
        }),
    );
    return;
  }

  // 3. Static assets (JS, CSS, Images, Fonts, Audio) -> Stale While Revalidate
  const isStaticAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/games/") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => null);

        // Return cached immediately if found, or wait for network
        return cached || fetchPromise;
      }),
    );
    return;
  }

  // 4. Default: Network with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request)),
  );
});

// Message listener for skip waiting & updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

