import React from 'react';

function GameHeader({ user, stats, onLogout }) {
  return (
    <header className="border-b border-amber-500/30 bg-black/40 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-wide">
            ASHKAR <span className="text-amber-400">FORGE</span> IDLE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Forgeron : <span className="text-amber-300">{user.username}</span>
          </p>
        </div>

        <div className="flex flex-col items-stretch sm:flex-row sm:items-center gap-2 sm:gap-4">
          {stats && (
            <div className="flex gap-3 sm:gap-4 text-[11px] sm:text-xs md:text-sm text-slate-300">
              <div>
                <p className="uppercase tracking-widest text-slate-500">
                  Niveau max usine
                </p>
                <p className="font-semibold text-amber-300">
                  {stats.max_factory_level_reached ?? '-'}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-widest text-slate-500">
                  Royaume max
                </p>
                <p className="font-semibold text-amber-300">
                  {stats.max_realm_unlocked ?? '-'}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-widest text-slate-500">
                  Sessions
                </p>
                <p className="font-semibold text-amber-300">
                  {stats.login_count ?? '-'}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="text-xs sm:text-sm px-3 py-1 rounded-md border border-slate-600 text-slate-200 hover:bg-slate-800/60 transition-colors self-end sm:self-auto"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </header>
  );
}

export default GameHeader;
