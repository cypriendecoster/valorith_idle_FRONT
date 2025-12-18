export default function Badge({ children, tone = 'neutral', className = '' }) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-500/40 text-emerald-200 bg-emerald-500/10'
      : tone === 'warning'
        ? 'border-amber-500/40 text-amber-200 bg-amber-500/10'
        : tone === 'danger'
          ? 'border-red-500/40 text-red-200 bg-red-500/10'
          : 'border-slate-700 text-slate-200 bg-slate-950/40';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ${toneClass} ${className}`.trim()}
    >
      {children}
    </span>
  );
}

