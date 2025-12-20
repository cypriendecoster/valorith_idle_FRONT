import { normalizeText } from '../../utils/adminFormatters';

export default function useBalanceConfirmActions({
  edits,
  openConfirm,
  getRowDiffs,
  mergedRow,
  handleSave,
  handleDelete,
  setToast,
}) {
  const requestSave = (type, row) => {
    const id = row?.id;
    if (id == null) return;

    const key = `${type}:${id}`;
    const rowEdits = edits[key];
    if (
      !rowEdits ||
      Object.keys(rowEdits).length === 0 ||
      getRowDiffs(type, row).length === 0
    ) {
      setToast({ type: 'success', message: 'Aucune modification a sauvegarder.' });
      return;
    }

    const merged = mergedRow(type, row);
    const changes = Object.entries(rowEdits)
      .map(([field, nextValue]) => {
        const before = row?.[field];
        const after = merged?.[field];
        const beforeText = normalizeText(before);
        const afterText = normalizeText(after);
        if (beforeText === afterText) return null;
        return `${field}: ${beforeText || '-'} -> ${afterText || '-'}`;
      })
      .filter(Boolean);

    const labelParts = [row.code, row.name].filter(Boolean);
    const label = labelParts.length > 0 ? ` (${labelParts.join(' - ')})` : '';
    const changesText =
      changes.length > 0 ? `\n\nChangements:\n- ${changes.join('\n- ')}` : '';
    const diffs = getRowDiffs(type, row);

    openConfirm({
      title: 'Confirmer la sauvegarde',
      message: `Confirmer la sauvegarde de #${id}${label} ?${changesText}`,
      confirmLabel: 'Sauvegarder',
      danger: false,
      details: diffs,
      action: () => handleSave(type, row),
    });
  };

  const requestBatchSave = (type, rows, diffs) => {
    const dirtyRows = (rows || []).filter(
      (row) => getRowDiffs(type, row).length > 0
    );
    if (dirtyRows.length === 0) {
      setToast({ type: 'success', message: 'Aucune modification a sauvegarder.' });
      return;
    }

    const details =
      Array.isArray(diffs) && diffs.length > 0
        ? diffs
        : dirtyRows.flatMap((row) =>
            getRowDiffs(type, row).map((diff) => ({
              ...diff,
              field: `#${row.id} ${diff.field}`,
            }))
          );

    openConfirm({
      title: 'Confirmer la sauvegarde (batch)',
      message: `Sauvegarder ${dirtyRows.length} ligne(s) ?`,
      confirmLabel: 'Sauvegarder',
      danger: false,
      details,
      action: async () => {
        for (const row of dirtyRows) {
          await handleSave(type, row);
        }
      },
    });
  };

  const requestDelete = (type, row) => {
    const id = row?.id;
    if (!id) return;

    const labelParts = [row.code, row.name].filter(Boolean);
    const label = labelParts.length > 0 ? ` (${labelParts.join(' - ')})` : '';

    openConfirm({
      title: 'Suppression',
      message:
        `Attention, supprimer est definitif. Cette action est irreversible.\n\n` +
        `Confirmer la suppression de #${id}${label} ?`,
      confirmLabel: 'Supprimer',
      danger: true,
      action: () => handleDelete(type, row),
    });
  };

  return {
    requestSave,
    requestBatchSave,
    requestDelete,
  };
}
