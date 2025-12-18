export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/60 ${className}`.trim()}
    />
  );
}

