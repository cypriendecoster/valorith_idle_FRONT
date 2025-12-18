import Skeleton from './Skeleton';

export default function SkeletonTable({ rows = 8, cols = 5, titleWidth = 'w-40' }) {
  return (
    <div className="rounded-lg border border-slate-800/70 bg-slate-950/30 overflow-hidden">
      <div className="px-3 py-3 border-b border-slate-800/70">
        <Skeleton className={`h-4 ${titleWidth}`} />
      </div>
      <div className="p-3 space-y-2">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={`sk-row-${rIdx}`} className="flex items-center gap-2">
            {Array.from({ length: cols }).map((__, cIdx) => (
              <Skeleton
                key={`sk-cell-${rIdx}-${cIdx}`}
                className={`h-3 ${cIdx === 0 ? 'w-14' : 'flex-1'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

