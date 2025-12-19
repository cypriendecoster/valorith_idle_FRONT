import PlayersPanel from '../joueurs/PlayersPanel';

export default function AdminPlayersSection({
  selectedPlayerId,
  listProps,
  detailsProps,
}) {
  return (
    <PlayersPanel
      selectedPlayerId={selectedPlayerId}
      listProps={listProps}
      detailsProps={detailsProps}
    />
  );
}
