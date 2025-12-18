export default function KeyValueRow({
  label,
  value,
  mono = false,
  actions = null,
  className = '',
}) {
  return (
    <div className={`flex items-start justify-between gap-3 ${className}`.trim()}>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p
          className={`mt-0.5 text-xs ${
            mono ? 'font-mono text-slate-200' : 'text-slate-200'
          } break-words`}
        >
          {value ?? '-'}
        </p>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

