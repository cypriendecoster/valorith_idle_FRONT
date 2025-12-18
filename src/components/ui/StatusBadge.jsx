import Badge from './Badge';

export default function StatusBadge({ status, className = '' }) {
  const normalized = String(status || '').toUpperCase();
  const tone =
    normalized === 'OPEN'
      ? 'warning'
      : normalized === 'CLOSED'
        ? 'success'
        : 'neutral';

  return (
    <Badge tone={tone} className={className}>
      {normalized || '-'}
    </Badge>
  );
}

