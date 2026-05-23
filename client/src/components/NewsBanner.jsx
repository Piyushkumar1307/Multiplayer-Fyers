export default function NewsBanner({ headline, newsIndex, totalNews }) {
  if (!headline) return null;

  const text = `BREAKING: ${headline}  •  `;

  return (
    <div className="sticky top-0 z-50 shrink-0 overflow-hidden border-b-2 border-amber-500/60 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 safe-top shadow-lg shadow-amber-950/40">
      {totalNews > 0 && (
        <p className="text-center text-xs sm:text-sm font-semibold text-amber-300 py-1.5 bg-amber-900/60 tracking-wide">
          News {newsIndex}/{totalNews}
        </p>
      )}
      <div
        key={headline}
        className="flex whitespace-nowrap animate-news-scroll py-3.5 sm:py-4"
      >
        <span className="mx-4 text-sm sm:text-base md:text-lg font-bold text-amber-50">
          📰 {text}
        </span>
        <span className="mx-4 text-sm sm:text-base md:text-lg font-bold text-amber-50" aria-hidden>
          📰 {text}
        </span>
      </div>
    </div>
  );
}
