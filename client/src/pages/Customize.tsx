import { motion } from 'framer-motion';
import GameLayout from '../components/GameLayout';
import { ASSETS } from '../lib/assets';

export default function Customize() {
  return (
    <GameLayout pageId="customize">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col items-center justify-center py-12 text-center px-4">
        <img src={ASSETS.customise} alt="Customize" className="w-32 h-32 object-contain mb-4 opacity-80" />
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl mb-4">🎨</motion.div>
        <h2 className="text-2xl font-black mb-2 text-[#1a1a2e]" style={{ fontFamily: 'Georgia, serif' }}>Customize</h2>
        <p className="text-sm text-gray-400 mb-6">Coming in Season 2</p>
        <motion.div className="px-6 py-2.5 rounded-full text-sm font-black text-white bg-[#EF476F]" animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          Stay tuned 🐚
        </motion.div>
      </motion.div>
    </GameLayout>
  );
}
