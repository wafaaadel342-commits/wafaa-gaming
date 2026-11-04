import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { initPwa } from "../lib/pwa";
import { OfflineStatusStrip, PwaUpdateBanner } from "../components/common/PwaInstallDialog";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">تعذر تحميل الصفحة</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          حدث خطأ ما. يمكنك المحاولة مرة أخرى أو العودة للرئيسية.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            المحاولة مرة أخرى
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "العب وتعلم" },
      {
        name: "description",
        content:
          "العب وتعلم — منصة ألعاب تعليمية وتفاعلية باللغة العربية: تحدّي المعرفة، ركّب الكلمة، وألعاب ثقافية بالذكاء الاصطناعي",
      },
      // PWA & Mobile Web App Meta Tags
      { name: "theme-color", content: "#101a2c" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "العب وتعلم" },
      { name: "application-name", content: "العب وتعلم" },
      { name: "format-detection", content: "telephone=no" },
      // Open Graph & Social
      { property: "og:title", content: "العب وتعلم — منصة ألعاب تعليمية تفاعلية" },
      {
        property: "og:description",
        content:
          "منصة ألعاب ذهنية وتعليمية باللغة العربية: تحدّي المعرفة، ركّب الكلمة والجملة، وألعاب ثقافية تفاعلية",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/icons/icon-512x512.png" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:image", content: "/icons/icon-512x512.png" },
    ],
    links: [
      // PWA Manifest
      { rel: "manifest", href: "/manifest.webmanifest" },
      // Apple Touch Icon
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
      // Favicons
      { rel: "icon", href: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { rel: "icon", href: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      // Fonts & Styles
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    initPwa();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <OfflineStatusStrip />
      <Outlet />
      <PwaUpdateBanner />
    </QueryClientProvider>
  );
}
