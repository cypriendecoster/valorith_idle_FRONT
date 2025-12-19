import { Children, cloneElement, isValidElement, useId, useState } from 'react';

export default function A11yDetailsWrap({
  className = '',
  summaryClassName = '',
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const contentId = useId();

  const childArray = Children.toArray(children);
  const summaryChild = childArray.find(
    (child) => isValidElement(child) && child.type === 'summary'
  );
  const contentChildren = childArray.filter(
    (child) => !(isValidElement(child) && child.type === 'summary')
  );
  const enhancedSummary =
    summaryChild && isValidElement(summaryChild)
      ? cloneElement(summaryChild, {
          'aria-expanded': open,
          'aria-controls': contentId,
          className: `focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${summaryClassName} ${summaryChild.props.className || ''}`.trim(),
        })
      : null;

  return (
    <details
      className={className}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      {enhancedSummary}
      <div id={contentId}>{contentChildren}</div>
    </details>
  );
}
