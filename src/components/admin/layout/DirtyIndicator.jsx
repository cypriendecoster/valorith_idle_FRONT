export default function DirtyIndicator({ count = 0, className = '' }) {
  if (!count || Number(count) <= 0) return null;

  return (
    <div
      className={`shrink-0 px-3 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs text-amber-200 ${className}`.trim()}
    >
      Modifications non enregistrées ({count})
    </div>
  );
}

