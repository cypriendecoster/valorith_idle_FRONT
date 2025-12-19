import { useId, useState } from 'react';

export default function A11yDetails({
  summary,
  className = '',
  summaryClassName = '',
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const contentId = useId();

  return (
    <details
      className={className}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary
        aria-expanded={open}
        aria-controls={contentId}
        className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${summaryClassName}`}
      >
        {summary}
      </summary>
      <div id={contentId}>{children}</div>
    </details>
  );
}
