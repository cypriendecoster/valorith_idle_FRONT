import Skeleton from './Skeleton';

export default function SkeletonCards({ items = 6 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, idx) => (
        <div
          key={`sk-card-${idx}`}
          className="rounded-lg border border-slate-800/70 bg-slate-950/30 p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

