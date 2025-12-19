import { useId, useState } from 'react';

export default function ActionMenu({
  ariaLabel = 'Actions',
  disabled = false,
  items = [],
  triggerLabel = '\u2026',
  dangerHelpText = 'Action dangereuse. Cette operation est irreversible.',
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const dangerHelpId = useId();
  const hasDanger = items.some((item) => item?.danger);

  const close = () => setOpen(false);

  if (!items || items.length === 0) return null;

  return (
    <details
      className="relative"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        className="list-none [&::-webkit-details-marker]:hidden select-none cursor-pointer px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70 disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
          }
        }}
      >
        {triggerLabel}
      </summary>

      <div
        id={menuId}
        role="menu"
        className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-800/70 bg-slate-950/95 shadow-[0_10px_30px_rgba(0,0,0,0.45)] p-1 z-10"
      >
        {hasDanger ? (
          <span id={dangerHelpId} className="sr-only">
            {dangerHelpText}
          </span>
        ) : null}
        {items.map((item) => (
          <button
            key={item.key || item.label}
            type="button"
            role="menuitem"
            disabled={!!item.disabled}
            aria-describedby={item.danger ? dangerHelpId : undefined}
            onClick={() => {
              close();
              item.onClick?.();
            }}
            className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              item.danger
                ? 'text-red-200 hover:bg-red-900/30'
                : 'text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </details>
  );
}
