// Helpers for formatting very large numbers without losing precision in JS.
// Accepts numbers or numeric strings (including scientific notation).

const SUFFIXES = [
  '',
  'K',  // 1e3
  'M',  // 1e6
  'B',  // 1e9
  'T',  // 1e12
  'Qa', // 1e15
  'Qi', // 1e18
  'Sx', // 1e21
  'Sp', // 1e24
  'Oc', // 1e27
  'No', // 1e30
  'Dc', // 1e33
];

function formatWithSuffixFromParts(mantissa, exponent) {
  if (!Number.isFinite(mantissa) || !Number.isFinite(exponent)) return '0';
  const group = Math.floor(exponent / 3);
  if (group <= 0) {
    const value = mantissa * Math.pow(10, exponent);
    return value.toLocaleString('fr-FR');
  }
  const suffix = SUFFIXES[group] || `e${group * 3}`;
  const scaled = mantissa * Math.pow(10, exponent - group * 3); // 1..999
  const shown =
    scaled >= 100
      ? scaled.toFixed(0)
      : scaled >= 10
        ? scaled.toFixed(1)
        : scaled.toFixed(2);
  return `${shown} ${suffix}`;
}

function formatIntegerString(valueString) {
  const s = valueString.replace(/^0+/, '') || '0';
  if (s.length <= 15) {
    return Number(s).toLocaleString('fr-FR');
  }
  const exponent = s.length - 1;
  const group = Math.floor(exponent / 3);
  const headDigits = s.length - group * 3;
  const head = s.slice(0, headDigits);
  const tail = s.slice(headDigits, headDigits + 2);
  const mantissa = Number(`${head}.${tail || '0'}`);
  return formatWithSuffixFromParts(mantissa, exponent);
}

export function formatAmount(value) {
  if (value == null) return '0';

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '0';
    if (Math.abs(value) < 1e15) {
      return value.toLocaleString('fr-FR');
    }
    const [m, e] = value.toExponential(6).split('e');
    const mantissa = Number(m);
    const exponent = Number(e);
    return formatWithSuffixFromParts(mantissa, exponent);
  }

  const str = String(value).trim();
  if (!str) return '0';

  if (/^\d+$/.test(str)) {
    return formatIntegerString(str);
  }

  const sciMatch = str.match(/^([0-9]+(?:\.[0-9]+)?)[eE]\+?([0-9]+)$/);
  if (sciMatch) {
    const mantissa = Number(sciMatch[1]);
    const exponent = Number(sciMatch[2]);
    return formatWithSuffixFromParts(mantissa, exponent);
  }

  const numeric = Number(str);
  if (Number.isFinite(numeric)) {
    return formatAmount(numeric);
  }

  return str;
}

export function formatPerSecond(value, digits = 2) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return '0';
  if (Math.abs(numeric) < 1e6) {
    return numeric.toLocaleString('fr-FR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }
  return formatAmount(numeric);
}
