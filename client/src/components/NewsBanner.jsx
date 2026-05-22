export default function NewsBanner({ headline, newsIndex, totalNews }) {
  if (!headline) return null;

  const text = `BREAKING: ${headline}  •  `;

  return (
    <div className="sticky top-0 z-50 shrink-0 overflow-hidden border-b border-amber-500/50 bg-amber-950 safe-top">
      {totalNews > 0 && (
        <p className="text-center text-[10px] text-amber-400/90 py-0.5 bg-amber-900/50">
          News {newsIndex}/{totalNews}
        </p>
      )}
      <div
        key={headline}
        className="flex whitespace-nowrap animate-news-scroll py-2 sm:py-2.5"
      >
        <span className="mx-3 text-xs sm:text-sm font-semibold text-amber-100">
          📰 {text}
        </span>
        <span className="mx-3 text-xs sm:text-sm font-semibold text-amber-100" aria-hidden>
          📰 {text}
        </span>
      </div>
    </div>
  );
}
