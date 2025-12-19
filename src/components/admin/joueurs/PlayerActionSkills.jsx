export default function PlayerActionSkills({
  inputClass = '',
  skills = [],
  playerSkillId,
  setPlayerSkillId = () => {},
  playerSkillLevel,
  setPlayerSkillLevel = () => {},
  playerSkillLevelById = new Map(),
  playerResourceSaving = false,
  handlePlayerSetSkillLevel,
}) {
  return (
    <div className="grid gap-2 md:grid-cols-4">
      <div className="md:col-span-2">
        <p className="text-[11px] uppercase tracking-widest text-slate-400">
          Competence
        </p>
        <select
          className={inputClass}
          aria-label="Competence"
          value={playerSkillId}
          onChange={(e) => {
            const nextId = e.target.value;
            setPlayerSkillId(nextId);
            if (!nextId) {
              setPlayerSkillLevel('');
              return;
            }
            const current = playerSkillLevelById.get(Number(nextId));
            if (current != null && Number.isFinite(current)) {
              setPlayerSkillLevel(String(current));
            }
          }}
        >
          <option value="">Choisir une competence</option>
          {skills.map((skill) => (
            <option key={skill.id} value={skill.id}>
              #{skill.id} - {skill.code} - {skill.name} (actuel:{' '}
              {playerSkillLevelById.get(Number(skill.id)) ?? 0})
            </option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-widest text-slate-400">Niveau</p>
        <input
          className={inputClass}
          inputMode="numeric"
          aria-label="Niveau competence"
          placeholder={
            playerSkillId
              ? `Niveau (actuel: ${
                  playerSkillLevelById.get(Number(playerSkillId)) ?? 0
                })`
              : 'Niveau'
          }
          value={playerSkillLevel}
          onChange={(e) => setPlayerSkillLevel(e.target.value)}
        />
      </div>
      <button
        type="button"
        disabled={playerResourceSaving}
        onClick={handlePlayerSetSkillLevel}
        className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Modifier le niveau
      </button>
    </div>
  );
}
