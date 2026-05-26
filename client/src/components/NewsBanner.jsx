export default function NewsBanner({ headline, newsIndex, totalNews }) {
  if (!headline) return null;

  return (
    <div
      className="sticky top-0 z-50 shrink-0 safe-top border-b-4 border-red-500 shadow-[0_6px_24px_rgba(220,38,38,0.45)] bg-zinc-950"
      role="region"
      aria-label="Breaking news"
    >
      <div className="flex items-center justify-between gap-3 bg-red-600 px-3 py-2 sm:px-4 sm:py-2.5">
        <p className="text-sm sm:text-base font-black uppercase tracking-wide text-white shrink-0">
          Breaking News
        </p>
        {totalNews > 0 && (
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-red-100 shrink-0">
            {newsIndex} / {totalNews}
          </p>
        )}
      </div>

      <div
        key={headline}
        className="px-3 py-3 sm:px-4 sm:py-4 bg-gradient-to-b from-zinc-900 to-zinc-950 animate-[fadeIn_0.35s_ease-out]"
      >
        <p className="text-base sm:text-lg md:text-xl font-bold text-white leading-snug sm:leading-relaxed text-pretty">
          {headline}
        </p>
      </div>
    </div>
  );
}
