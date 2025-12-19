import { useMemo } from 'react';
import EndgameCreateRequirementForm from '../../components/admin/Endgame/EndgameCreateRequirementForm';
import EndgameRequirementsList from '../../components/admin/Endgame/EndgameRequirementsList';
import EndgameRankingsTable from '../../components/admin/Endgame/EndgameRankingsTable';

export default function useEndgameState({
  endgameTab,
  createOpen,
  inputClass,
  createDraft,
  setCreateDraft,
  sortedResources,
  createSaving,
  setCreateOpen,
  handleCreateEndgameRequirement,
  endgameLoading,
  endgameRequirements,
  matchesSearch,
  mergedRow,
  isRowSaving,
  getRowDiffs,
  updateField,
  requestSave,
  requestDelete,
  endgameRankings,
  formatDurationSeconds,
}) {
  const endgameCreateForm = useMemo(
    () => (
      <EndgameCreateRequirementForm
        open={endgameTab === 'requirements' && createOpen}
        inputClass={inputClass}
        createDraft={createDraft}
        setCreateDraft={setCreateDraft}
        sortedResources={sortedResources}
        createSaving={createSaving}
        onCancel={() => setCreateOpen(false)}
        onCreate={handleCreateEndgameRequirement}
      />
    ),
    [
      endgameTab,
      createOpen,
      inputClass,
      createDraft,
      setCreateDraft,
      sortedResources,
      createSaving,
      setCreateOpen,
      handleCreateEndgameRequirement,
    ]
  );

  const endgameRequirementsContent = useMemo(
    () => (
      <EndgameRequirementsList
        loading={endgameLoading}
        requirements={(endgameRequirements || []).filter(matchesSearch)}
        inputClass={inputClass}
        mergedRow={mergedRow}
        isRowSaving={isRowSaving}
        getRowDiffs={getRowDiffs}
        updateField={updateField}
        requestSave={requestSave}
        requestDelete={requestDelete}
        sortedResources={sortedResources}
      />
    ),
    [
      endgameLoading,
      endgameRequirements,
      matchesSearch,
      inputClass,
      mergedRow,
      isRowSaving,
      getRowDiffs,
      updateField,
      requestSave,
      requestDelete,
      sortedResources,
    ]
  );

  const endgameRankingsContent = useMemo(
    () => (
      <EndgameRankingsTable
        loading={endgameLoading}
        rankings={(endgameRankings || []).filter(matchesSearch)}
        formatDurationSeconds={formatDurationSeconds}
      />
    ),
    [endgameLoading, endgameRankings, matchesSearch, formatDurationSeconds]
  );

  return {
    endgameCreateForm,
    endgameRequirementsContent,
    endgameRankingsContent,
  };
}
