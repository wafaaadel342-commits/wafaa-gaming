export function BackgroundBlobs({ theme = "default" }: { theme?: "default" | "quiz" | "words" }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* Subtle warm ambient lighting from top */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] max-w-[100vw] h-[380px] bg-gradient-to-b from-primary/6 via-accent/4 to-transparent blur-3xl opacity-70" />

      {/* Gentle side tone accents */}
      <div className="absolute top-1/4 -start-48 w-[420px] h-[420px] rounded-full bg-accent/3 blur-[140px]" />
      <div className="absolute top-2/3 -end-48 w-[460px] h-[460px] rounded-full bg-primary/4 blur-[150px]" />

      {/* Subtle fine dot grid texture for editorial precision */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
        style={{
          backgroundImage: `radial-gradient(currentColor 0.75px, transparent 0.75px)`,
          backgroundSize: "28px 28px",
          color: "var(--color-foreground)",
        }}
      />
    </div>
  );
}
