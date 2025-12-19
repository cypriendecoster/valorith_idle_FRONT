const toneStyles = {
  info: 'border-slate-500/40 bg-slate-950/40 text-slate-200',
  success: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200',
  warning: 'border-amber-500/40 bg-amber-950/30 text-amber-200',
  danger: 'border-red-500/40 bg-red-950/30 text-red-200',
};

export default function InfoBanner({
  tone = 'info',
  className = '',
  children,
}) {
  const toneClass = toneStyles[tone] || toneStyles.info;
  return (
    <div
      role="status"
      className={`rounded-lg border px-3 py-2 text-xs ${toneClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
