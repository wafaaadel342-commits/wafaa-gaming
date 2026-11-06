import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const MemoryCardsGamePage = lazyRouteComponent(
  () => import("@/games/memory-cards/MemoryCardsGamePage"),
  "default",
);

export const Route = createFileRoute("/memory-cards")({
  head: () => ({
    meta: [
      { title: "ذاكرة الكروت — العب وتعلم" },
      {
        name: "description",
        content:
          "لعبة ذاكرة الكروت المصرية الأصيلة: مطابقة بصرية للرموز والمعالم والتراث المصري، ومطابقة معرفية للأسئلة والإجابات الموثقة.",
      },
    ],
  }),
  component: MemoryCardsGamePage,
  pendingComponent: MemoryCardsPending,
});

function MemoryCardsPending() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-8 py-7 text-center shadow-sm">
        <div className="size-9 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
        <p className="text-sm font-bold text-foreground">جارٍ تحميل لعبة ذاكرة الكروت…</p>
        <p className="text-xs text-muted-foreground">الكروت والتراث المصري يُجهّزان الآن</p>
      </div>
    </div>
  );
}

