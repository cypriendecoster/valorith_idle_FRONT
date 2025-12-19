const toneStyles = {
  amber: 'border-amber-500/40 text-amber-200 bg-amber-500/10',
  emerald: 'border-emerald-500/40 text-emerald-200 bg-emerald-500/10',
  sky: 'border-sky-500/40 text-sky-200 bg-sky-500/10',
  rose: 'border-rose-500/40 text-rose-200 bg-rose-500/10',
};

export default function SectionHeader({ label, icon, tone = 'amber' }) {
  if (!label) return null;
  const toneClass = toneStyles[tone] || toneStyles.amber;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold ${toneClass}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="text-xs uppercase tracking-[0.25em] text-slate-400">
        {label}
      </span>
    </div>
  );
}
