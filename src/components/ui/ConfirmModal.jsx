export default function ConfirmModal({
  open,
  title,
  message,
  danger = true,
  confirmLabel = 'Confirmer',
  expectedText,
  inputValue,
  onInputChange,
  details,
  loading = false,
  error,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onCancel}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Confirmation'}
        className="relative w-full max-w-lg"
      >
        <div
          className={`rounded-2xl border bg-slate-950/90 shadow-[0_0_40px_rgba(0,0,0,0.55)] ${
            danger ? 'border-red-500/40' : 'border-amber-500/30'
          }`}
        >
          <div className="px-5 py-4 border-b border-slate-800/60">
            <h2
              className={`text-lg font-semibold ${
                danger ? 'text-red-100' : 'text-amber-100'
              }`}
            >
              {title}
            </h2>
            {message ? (
              <p className="mt-2 text-sm text-slate-200/90 whitespace-pre-line">
                {message}
              </p>
            ) : null}
          </div>

          <div className="px-5 py-4 space-y-3">
            {Array.isArray(details) && details.length > 0 ? (
              <div className="rounded-lg border border-slate-800/70 bg-black/20 p-3">
                <p className="text-xs text-slate-300 font-semibold mb-2">
                  Aperçu des changements
                </p>
                <div className="max-h-56 overflow-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] uppercase tracking-widest text-slate-400">
                      <tr className="border-b border-slate-800/70">
                        <th className="py-2 pr-3">Champ</th>
                        <th className="py-2 pr-3">Avant</th>
                        <th className="py-2">Après</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.map((c, idx) => (
                        <tr
                          key={`confirm-diff-${idx}-${c.field}`}
                          className="border-b border-slate-800/60"
                        >
                          <td className="py-2 pr-3 text-slate-200 font-mono">
                            {c.field}
                          </td>
                          <td className="py-2 pr-3 text-slate-300">
                            <span className="whitespace-pre-wrap break-words">
                              {c.before}
                            </span>
                          </td>
                          <td className="py-2 text-slate-100">
                            <span className="whitespace-pre-wrap break-words">
                              {c.after}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {expectedText ? (
              <div className="space-y-1">
                <label className="text-xs text-slate-300">
                  Confirmation (à taper)
                </label>
                <input
                  className="w-full rounded-md bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                  value={inputValue || ''}
                  onChange={(e) => onInputChange?.(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onConfirm?.();
                    if (e.key === 'Escape') onCancel?.();
                  }}
                  autoFocus
                  placeholder={expectedText}
                  disabled={loading}
                />
              </div>
            ) : null}

            {error ? (
              <div className="rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-3 py-2 rounded-md border border-slate-700 text-slate-200 hover:border-slate-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`px-3 py-2 rounded-md font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  danger
                    ? 'bg-red-500 hover:bg-red-400 text-slate-900'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                }`}
              >
                {loading ? 'En cours…' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

