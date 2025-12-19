export default function UnlockCostsEditor({
  realmId,
  unlockCostsByRealmId,
  unlockCosts,
  resources = [],
  className = '',
  emptyText = '-',
  itemClassName = 'text-[11px] text-slate-200',
}) {
  const map = unlockCostsByRealmId instanceof Map ? unlockCostsByRealmId : new Map();
  const costs =
    Array.isArray(unlockCosts) && unlockCosts.length > 0
      ? unlockCosts
      : map.get(Number(realmId)) || [];

  if (!costs || costs.length === 0) {
    return <span className="text-slate-500">{emptyText}</span>;
  }

  return (
    <ul className={`space-y-0.5 ${className}`.trim()}>
      {costs.map((cost) => {
        const resourceId = Number(cost.resourceId ?? cost.resource_id);
        const amount = Number(cost.amount ?? 0);
        const label =
          cost.resourceName ||
          cost.resource_name ||
          resources.find((res) => Number(res.id) === resourceId)?.name ||
          resources.find((res) => Number(res.id) === resourceId)?.code ||
          cost.resourceCode ||
          cost.resource_code ||
          `#${resourceId}`;

        return (
          <li
            key={`realm-cost-${realmId}-${resourceId}-${amount}`}
            className={itemClassName}
          >
            <span className="font-mono text-amber-200">{amount}</span>{' '}
            <span className="text-slate-300">{label}</span>
          </li>
        );
      })}
    </ul>
  );
}
