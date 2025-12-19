export default function MaintenanceCard({
  maintenanceLoading = false,
  maintenanceSaving = false,
  maintenanceMessage,
  setMaintenanceMessage = () => {},
  maintenanceRetryAfter,
  setMaintenanceRetryAfter = () => {},
  maintenanceEnabled = false,
  saveMaintenance,
}) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-black/40 p-4 shadow-[0_0_40px_rgba(251,191,36,0.10)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Systeme</p>
          <h2 className="text-lg font-heading text-slate-100">Maintenance</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Active/desactive l'acces a l'API pour les joueurs. Les admins restent
            autorises.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={maintenanceLoading || maintenanceSaving}
            onClick={() => saveMaintenance && saveMaintenance(true)}
            className="px-3 py-2 rounded-md border border-amber-500/50 text-amber-200 hover:bg-amber-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-xs"
          >
            Activer
          </button>
          <button
            type="button"
            disabled={maintenanceLoading || maintenanceSaving}
            onClick={() => saveMaintenance && saveMaintenance(false)}
            className="px-3 py-2 rounded-md border border-slate-700 text-slate-200 hover:bg-white/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-xs"
          >
            Desactiver
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-[11px] uppercase tracking-widest text-slate-400 mb-1">
            Message (optionnel)
          </label>
          <input
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            placeholder="Serveur en maintenance. Merci de reessayer plus tard."
            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
            disabled={maintenanceLoading || maintenanceSaving}
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-slate-400 mb-1">
            Reessayer dans (s)
          </label>
          <input
            value={maintenanceRetryAfter}
            onChange={(e) => setMaintenanceRetryAfter(e.target.value)}
            placeholder="ex: 60"
            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
            disabled={maintenanceLoading || maintenanceSaving}
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          Etat :{' '}
          <span className={maintenanceEnabled ? 'text-amber-200' : 'text-emerald-200'}>
            {maintenanceEnabled ? 'activee' : 'desactivee'}
          </span>
        </p>
        <button
          type="button"
          disabled={maintenanceLoading || maintenanceSaving}
          onClick={() => saveMaintenance && saveMaintenance()}
          className="px-3 py-2 rounded-md border border-amber-400/60 text-amber-200 hover:bg-amber-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-xs"
        >
          {maintenanceSaving ? '...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
