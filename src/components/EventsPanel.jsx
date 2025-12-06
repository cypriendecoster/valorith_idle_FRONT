import React from 'react';

function EventsPanel({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <section className="bg-black/30 border border-slate-700/60 rounded-xl p-3 sm:p-4 md:p-5">
      <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
        <span className="inline-block h-1 w-6 bg-slate-400 rounded-full" />
        Chronique de la forge
      </h2>
      <ul className="text-[10px] sm:text-xs text-slate-300 space-y-1 max-h-40 overflow-y-auto">
        {events.map((e) => (
          <li key={e.id} className="font-mono">
            {e.message}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default EventsPanel;
