import { Children, cloneElement, isValidElement, useState } from 'react';

export default function A11yDetailsWrap({
  className = '',
  summaryClassName = '',
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(!!defaultOpen);

  const enhanced = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    if (child.type !== 'summary') return child;
    return cloneElement(child, {
      'aria-expanded': open,
      className: `focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${summaryClassName} ${child.props.className || ''}`.trim(),
    });
  });

  return (
    <details
      className={className}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      {enhanced}
    </details>
  );
}

