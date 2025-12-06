import React from 'react';

function ResourcesPanel({ resources }) {
  if (!resources) return null;

  return (
    <section className="bg-black/30 border border-emerald-500/20 rounded-xl p-3 sm:p-4 md:p-5 shadow-[0_0_40px_rgba(16,185,129,0.12)]">
      <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 flex items-center gap-2">
        <span className="inline-block h-1 w-6 bg-emerald-400 rounded-full" />
        Ressources
      </h2>
      <ul className="space-y-2 text-xs sm:text-sm">
        {resources.map((r) => (
          <li
            key={r.resource_id}
            className="flex items-center justify-between bg-slate-900/60 rounded-lg px-3 py-2 border border-slate-700/40"
          >
            <span className="text-slate-200">{r.name}</span>
            <span className="font-mono text-emerald-300">
              {Number(r.amount).toLocaleString('fr-FR')}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ResourcesPanel;
