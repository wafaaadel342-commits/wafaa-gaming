import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const WordGuessingGamePage = lazyRouteComponent(
  () => import("@/games/word-guessing/WordGuessingGamePage"),
  "default",
);

export const Route = createFileRoute("/guess-word")({
  head: () => ({
    meta: [
      { title: "خمن الكلمة — العب وتعلم" },
      {
        name: "description",
        content:
          "لعبة تخمين الكلمة السرية في ست محاولات باللغة العربية، مع إشارات لونية ذكية وإحصائيات دقيقة.",
      },
    ],
  }),
  component: WordGuessingGamePage,
  pendingComponent: WordGuessingPending,
});

function WordGuessingPending() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-8 py-7 text-center shadow-sm">
        <div className="size-9 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
        <p className="text-sm font-bold text-foreground">جارٍ تحميل لعبة خمن الكلمة…</p>
        <p className="text-xs text-muted-foreground">الكلمات المعدة والوحدات الجاهزة</p>
      </div>
    </div>
  );
}
