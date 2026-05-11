import { motion } from 'framer-motion';
import GameLayout from '../components/GameLayout';

export default function ComingSoon({ pageId, label, color, emoji }: { pageId: string; label: string; color: string; emoji: string }) {
  return (
    <GameLayout pageId={pageId} label={label} color={color}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-6xl mb-6">
          {emoji}
        </motion.div>
        <h2 className="text-3xl font-black text-[#1a1a2e] mb-3" style={{ fontFamily: 'Georgia, serif' }}>{label}</h2>
        <p className="text-sm text-gray-400 mb-8 max-w-xs">This feature is coming in Season 2. Stay tuned, shell collector!</p>
        <div className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-300 bg-gray-100">
          🔒 Locked until Season 2
        </div>
      </div>
    </GameLayout>
  );
}
