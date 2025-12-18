export default function TableShell({
  className = '',
  tableClassName = '',
  headClassName = 'text-[11px] uppercase tracking-widest text-slate-400',
  head,
  children,
}) {
  return (
    <div className={`overflow-x-auto ${className}`.trim()}>
      <table className={`w-full text-left text-xs ${tableClassName}`.trim()}>
        {head ? <thead className={headClassName}>{head}</thead> : null}
        {children}
      </table>
    </div>
  );
}
