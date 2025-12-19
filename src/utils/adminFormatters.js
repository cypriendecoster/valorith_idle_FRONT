export function normalizeText(value) {
  return String(value ?? '').trim();
}

export function toNumberOrNull(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function toNonNegativeIntOrNull(value) {
  const n = toNumberOrNull(value);
  if (n == null) return null;
  if (n < 0) return null;
  return Math.floor(n);
}

export function toBooleanInt(value) {
  return value ? 1 : 0;
}

export function formatDurationSeconds(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) return '-';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function clampInt(value, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  const i = Math.trunc(n);
  return Math.min(max, Math.max(min, i));
}

export function normalizeSortDir(value, fallback = 'DESC') {
  const dir = String(value ?? '').trim().toUpperCase();
  return dir === 'ASC' || dir === 'DESC' ? dir : fallback;
}

export function parseBigIntLoose(value) {
  if (value == null) return null;
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return BigInt(Math.trunc(value));
  }
  const raw = String(value).trim();
  if (!raw) return null;
  const sign = raw.startsWith('-') ? '-' : '';
  const digitsOnly = raw.replace(/[^\d]/g, '');
  if (!digitsOnly) return null;
  try {
    return BigInt(`${sign}${digitsOnly}`);
  } catch {
    return null;
  }
}

export function formatIntegerFull(value, locale = 'fr-FR') {
  const n = parseBigIntLoose(value);
  if (n == null) return String(value ?? '-');
  try {
    return new Intl.NumberFormat(locale).format(n);
  } catch {
    return n.toString();
  }
}

export function formatIntegerCompact(value, locale = 'fr-FR') {
  const n = parseBigIntLoose(value);
  if (n == null) return '-';
  const sign = n < 0n ? '-' : '';
  const abs = n < 0n ? -n : n;
  const thousand = 1000n;
  const units = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
  let unitIndex = 0;
  let div = 1n;
  while (unitIndex < units.length - 1 && abs >= div * thousand) {
    div *= thousand;
    unitIndex += 1;
  }
  if (unitIndex === 0) return formatIntegerFull(abs, locale);

  const scaledTimes10 = (abs * 10n) / div;
  const whole = scaledTimes10 / 10n;
  const dec = scaledTimes10 % 10n;
  const decSep = locale.startsWith('fr') ? ',' : '.';
  const wholeStr = formatIntegerFull(whole, locale);
  const decStr = dec === 0n ? '' : `${decSep}${dec.toString()}`;
  return `${sign}${wholeStr}${decStr}${units[unitIndex]}`;
}
