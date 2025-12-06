import React from 'react';

function SkillsPanel({ skills, upgradingSkillId, onUpgradeSkill }) {
  if (!skills) return null;

  return (
    <section className="bg-black/30 border border-violet-500/20 rounded-xl p-3 sm:p-4 md:p-5 shadow-[0_0_40px_rgba(139,92,246,0.18)]">
      <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 flex items-center gap-2">
        <span className="inline-block h-1 w-6 bg-violet-400 rounded-full" />
        Compétences
      </h2>

      <ul className="grid gap-3 sm:gap-4 md:grid-cols-2 text-[11px] sm:text-sm">
        {skills.map((skill) => {
          const level = Number(skill.level || 0);
          const maxLevel = Number(skill.maxLevel || skill.max_level || 0);
          const nextCost = skill.nextCost ?? skill.next_cost ?? null;
          const isLocked = Boolean(skill.isLocked);
          const isMax = level >= maxLevel || nextCost === null;

          return (
            <li
              key={skill.skillId}
              className="rounded-lg border px-3 py-2 bg-slate-900/60 border-slate-700/40"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-100">
                  {skill.name}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400">
                  Niveau{' '}
                  <span className="font-semibold text-violet-300">
                    {level}/{maxLevel}
                  </span>
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-400 mb-1">
                {skill.description}
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                {isMax ? (
                  <span className="text-emerald-300">
                    Niveau maximal atteint
                  </span>
                ) : (
                  <>
                    Coût prochain niveau :{' '}
                    <span className="font-mono text-amber-300">
                      {Math.round(nextCost).toLocaleString('fr-FR')}
                    </span>
                  </>
                )}
              </p>

              <button
                type="button"
                onClick={() => onUpgradeSkill(skill.skillId)}
                disabled={isLocked || isMax || upgradingSkillId === skill.skillId}
                className="mt-2 inline-flex items-center rounded-md bg-violet-500/90 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 text-[11px] sm:text-xs font-semibold px-3 py-1 transition-colors"
              >
                {isLocked
                  ? 'Royaume non débloqué'
                  : isMax
                  ? 'Niveau max'
                  : upgradingSkillId === skill.skillId
                  ? 'Amélioration...'
                  : 'Améliorer'}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default SkillsPanel;
