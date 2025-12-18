import { useState } from 'react';

async function copyToClipboard(value) {
  const text = String(value ?? '');
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function CopyButton({
  value,
  label = 'Copier',
  ariaLabel,
  disabled = false,
  onCopied,
  className = '',
}) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      aria-label={ariaLabel || label}
      disabled={disabled || busy}
      onClick={async () => {
        if (disabled || busy) return;
        setBusy(true);
        const ok = await copyToClipboard(value);
        setBusy(false);
        onCopied?.(ok);
      }}
      className={`px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${className}`.trim()}
    >
      {label}
    </button>
  );
}
