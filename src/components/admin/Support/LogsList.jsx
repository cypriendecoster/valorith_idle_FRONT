import SkeletonCards from '../../ui/SkeletonCards';
import SkeletonTable from '../../ui/SkeletonTable';
import TableShell from '../../ui/TableShell';

export default function LogsList({
  logsLoading = false,
  filteredLogs = [],
}) {
  if (logsLoading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="md:hidden">
          <SkeletonCards items={6} />
        </div>
        <div className="hidden md:block">
          <SkeletonTable rows={10} cols={6} titleWidth="w-24" />
        </div>
      </div>
    );
  }

  if (!filteredLogs || filteredLogs.length === 0) {
    return <p className="text-sm text-slate-300">Aucun log.</p>;
  }

  return (
    <>
      <div className="md:hidden space-y-2">
        {filteredLogs.map((log) => (
          <div
            key={`log-card-${log.id}`}
            className="rounded-lg border border-slate-800/70 bg-slate-950/30 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] text-slate-400 font-mono">
                {log.created_at ? new Date(log.created_at).toLocaleString('fr-FR') : '-'}
              </p>
              <p className="text-[11px] text-slate-300 font-mono">
                user:{' '}
                <span className="text-slate-200">{log.user_id ?? '-'}</span>
              </p>
            </div>

            <p className="mt-1 text-sm text-slate-100 font-semibold">
              {log.action_type || '-'}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-300">
              {log.target_table || '-'}{' '}
              <span className="text-slate-500 font-mono">#{log.target_id ?? '-'}</span>
            </p>

            {log.description ? (
              <p className="mt-2 text-[11px] text-slate-200 whitespace-pre-wrap">
                {log.description}
              </p>
            ) : (
              <p className="mt-2 text-[11px] text-slate-400">-</p>
            )}
          </div>
        ))}
      </div>

      <TableShell className="hidden md:block" asChild>
        <table className="min-w-[900px] w-full text-left text-xs">
          <thead className="text-[11px] uppercase tracking-widest text-slate-400">
            <tr className="border-b border-slate-800/70">
              <th className="py-2 pr-3">Date</th>
              <th className="py-2 pr-3">User</th>
              <th className="py-2 pr-3">Type</th>
              <th className="py-2 pr-3">Table</th>
              <th className="py-2 pr-3">Target</th>
              <th className="py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={`log-${log.id}`} className="border-b border-slate-800/60">
                <td className="py-2 pr-3 text-slate-400">
                  {log.created_at ? new Date(log.created_at).toLocaleString('fr-FR') : '-'}
                </td>
                <td className="py-2 pr-3 text-slate-300 font-mono">
                  {log.user_id ?? '-'}
                </td>
                <td className="py-2 pr-3 text-slate-200">
                  {log.action_type || '-'}
                </td>
                <td className="py-2 pr-3 text-slate-300">
                  {log.target_table || '-'}
                </td>
                <td className="py-2 pr-3 text-slate-300 font-mono">
                  {log.target_id ?? '-'}
                </td>
                <td className="py-2 text-slate-300">{log.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </>
  );
}
