import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const TrueFalseGamePage = lazyRouteComponent(
  () => import("@/games/true-false/TrueFalseGamePage"),
  "default",
);

export const Route = createFileRoute("/true-or-false")({
  head: () => ({
    meta: [
      { title: "صح أم خطأ — العب وتعلم" },
      {
        name: "description",
        content:
          "لعبة صح أم خطأ سريعة باللغة العربية: حقائق علمية وتاريخية وجغرافية موثقة بمصادر، مع تفسير فوري ونتائج تفصيلية.",
      },
    ],
  }),
  component: TrueFalseGamePage,
  pendingComponent: TrueFalsePending,
});

function TrueFalsePending() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-8 py-7 text-center shadow-sm">
        <div className="size-9 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
        <p className="text-sm font-bold text-foreground">جارٍ تحميل لعبة صح أم خطأ…</p>
        <p className="text-xs text-muted-foreground">الأسئلة الموثقة تُجهّز الآن</p>
      </div>
    </div>
  );
}
