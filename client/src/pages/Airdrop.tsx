import GameLayout from '../components/GameLayout';

export default function Airdrop() {
  return (
    <GameLayout pageId="airdrop" label="Airdrop" color="#8B5CF6">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="text-6xl mb-4">🎁</div>
        <h2 className="text-2xl font-black text-[#1a1a2e] mb-2" style={{ fontFamily: 'Georgia, serif' }}>Airdrop</h2>
        <p className="text-sm text-gray-400 max-w-xs">Season 1 airdrops will be distributed to active players. Keep collecting shells!</p>
      </div>
    </GameLayout>
  );
}
