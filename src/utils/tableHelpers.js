import { normalizeText } from './adminFormatters';

export function mergedRow(type, row, edits) {
  const key = `${type}:${row.id}`;
  return { ...row, ...(edits[key] || {}) };
}

export function getRowDiffs(type, row, edits) {
  const id = row?.id;
  if (id == null) return [];

  const key = `${type}:${id}`;
  const rowEdits = edits[key];
  if (!rowEdits) return [];

  const merged = mergedRow(type, row, edits);

  return Object.keys(rowEdits)
    .map((field) => {
      const before = row?.[field];
      const after = merged?.[field];
      const beforeText = normalizeText(before);
      const afterText = normalizeText(after);
      if (beforeText === afterText) return null;
      return {
        field,
        before: beforeText || '-',
        after: afterText || '-',
      };
    })
    .filter(Boolean);
}

export function matchesSearch(row, search) {
  const q = normalizeText(search).toLowerCase();
  if (!q) return true;

  const parts = [];

  for (const value of Object.values(row || {})) {
    if (value == null) continue;
    const t = typeof value;
    if (t === 'string' || t === 'number' || t === 'boolean') {
      parts.push(value);
    }
  }

  if (Array.isArray(row?.unlockCosts)) {
    for (const c of row.unlockCosts) {
      if (!c) continue;
      parts.push(c.amount, c.resource_code, c.resource_name, c.realm_code);
    }
  }

  const hay = parts.map((p) => String(p ?? '').toLowerCase()).join(' ');
  return hay.includes(q);
}
