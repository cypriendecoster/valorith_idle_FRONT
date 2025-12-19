import EndgamePanel from '../Endgame/EndgamePanel';

export default function AdminEndgameSection({
  endgameTab = 'requirements',
  onTabChange,
  requirementsCount = 0,
  rankingsCount = 0,
  onCreateRequirement,
  onRefresh,
  loading = false,
  createForm,
  requirementsContent,
  rankingsContent,
  feedback,
}) {
  return (
    <EndgamePanel
      endgameTab={endgameTab}
      onTabChange={onTabChange}
      requirementsCount={requirementsCount}
      rankingsCount={rankingsCount}
      onCreateRequirement={onCreateRequirement}
      onRefresh={onRefresh}
      loading={loading}
      createForm={createForm}
      requirementsContent={requirementsContent}
      rankingsContent={rankingsContent}
      feedback={feedback}
    />
  );
}
