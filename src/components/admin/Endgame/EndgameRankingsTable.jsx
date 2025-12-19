import A11yDetails from '../../ui/A11yDetails';
import A11yDetailsWrap from '../../ui/A11yDetailsWrap';
import TableShell from '../../ui/TableShell';
import SkeletonCards from '../../ui/SkeletonCards';
import SkeletonTable from '../../ui/SkeletonTable';

export default function EndgameRankingsTable({
  loading = false,
  rankings = [],
  formatDurationSeconds,
}) {
  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="md:hidden">
          <SkeletonCards items={6} />
        </div>
        <div className="hidden md:block">
          <SkeletonTable rows={8} cols={5} titleWidth="w-32" />
        </div>
      </div>
    );
  }

  if (!rankings || rankings.length === 0) {
    return <p className="text-sm text-slate-300">Aucun resultat.</p>;
  }

  return (
    <>
      <div className="md:hidden space-y-2">
        {rankings.map((row, idx) => (
          <A11yDetails
            key={`endgame-rank-card-${row?.id ?? idx}`}
            className="rounded-lg border border-slate-800/70 bg-slate-950/30 p-3"
            summaryClassName="list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none"
            summary={
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-100 font-semibold">
                    {row?.username ? `${row.username} (#${row.user_id})` : row?.user_id ?? '-'}
                  </p>
                  <p className="text-[11px] text-amber-300 font-mono mt-0.5">
                    #{row?.id ?? '-'}
                  </p>
                </div>
                <p className="text-[11px] text-slate-300">
                  {formatDurationSeconds
                    ? formatDurationSeconds(row?.completion_seconds ?? row?.playtime_seconds)
                    : row?.completion_seconds ?? row?.playtime_seconds ?? '-'}
                </p>
              </div>
            }
          >
            <div className="pt-3 space-y-2 text-[11px] text-slate-300">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="uppercase tracking-widest text-slate-500">Complete le</p>
                  <p className="text-slate-200 font-mono">
                    {row?.completed_at
                      ? new Date(row.completed_at).toLocaleString('fr-FR')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="uppercase tracking-widest text-slate-500">Temps (s)</p>
                  <p className="text-slate-200 font-mono">
                    {row?.completion_seconds != null
                      ? `${row.completion_seconds}s`
                      : row?.playtime_seconds != null
                        ? `${row.playtime_seconds}s`
                        : '-'}
                  </p>
                </div>
              </div>

              <A11yDetailsWrap summaryClassName="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-slate-200">
                <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Donnees (JSON)
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-[11px] leading-5 rounded-md border border-slate-800/70 bg-slate-950/40 p-2 max-h-60 overflow-y-auto">
                  {JSON.stringify(row, null, 2)}
                </pre>
              </A11yDetailsWrap>
            </div>
          </A11yDetails>
        ))}
      </div>

      <TableShell className="hidden md:block" asChild>
        <table className="min-w-[900px] w-full text-left text-xs">
          <thead className="text-[11px] uppercase tracking-widest text-slate-400">
            <tr className="border-b border-slate-800/70">
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">User</th>
              <th className="py-2 pr-3">Complete le</th>
              <th className="py-2 pr-3">Temps (s)</th>
              <th className="py-2">Donnees</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((row, idx) => (
              <tr key={`endgame-rank-${row?.id ?? idx}`} className="border-b border-slate-800/60">
                <td className="py-2 pr-3 font-mono text-amber-300">{row?.id ?? '-'}</td>
                <td className="py-2 pr-3 text-slate-300 font-mono">
                  {row?.username ? `${row.username} (#${row.user_id})` : row?.user_id ?? '-'}
                </td>
                <td className="py-2 pr-3 text-slate-300">
                  {row?.completed_at
                    ? new Date(row.completed_at).toLocaleString('fr-FR')
                    : '-'}
                </td>
                <td className="py-2 pr-3 text-slate-300 font-mono">
                  {formatDurationSeconds
                    ? formatDurationSeconds(row?.completion_seconds ?? row?.playtime_seconds)
                    : row?.completion_seconds ?? row?.playtime_seconds ?? '-'}
                  {row?.completion_seconds != null
                    ? ` (${row.completion_seconds}s)`
                    : row?.playtime_seconds != null
                      ? ` (${row.playtime_seconds}s)`
                      : ''}
                </td>
                <td className="py-2 text-slate-300 font-mono">
                  <pre className="whitespace-pre-wrap text-[11px] leading-5 max-w-[680px]">
                    {JSON.stringify(row, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </>
  );
}
