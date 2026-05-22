export default function NewsCard({ headline, visible }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6">
      <div className="max-w-lg text-center animate-[fadeIn_0.5s_ease-out]">
        <p className="text-sm uppercase tracking-widest text-amber-400 mb-4">
          Breaking News
        </p>
        <h2 className="text-2xl sm:text-4xl font-bold leading-tight text-white">
          {headline}
        </h2>
      </div>
    </div>
  );
}
