// client/src/pages/CommunityFrens.tsx
import { motion } from 'framer-motion';
import GameLayout from '../components/GameLayout';
import { ASSETS } from '../lib/assets';

export default function CommunityFrens() {
  return (
    <GameLayout pageId="community-frens" label="Community Frens" color="#EF476F">
      <motion.div 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }} 
        className="flex flex-col items-center justify-center py-12 text-center px-4"
      >
        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ duration: 3, repeat: Infinity }} 
          className="w-32 h-32 mb-4 rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 12px 40px rgba(239,71,111,0.3)' }}
        >
          <img src={ASSETS.slogfrens} alt="Community Frens" className="w-full h-full object-cover" />
        </motion.div>
        <h2 className="text-2xl font-black mb-2 text-[#1a1a2e]" style={{ fontFamily: 'Georgia, serif' }}>
          Community Frens
        </h2>
        <p className="text-sm text-gray-400 mb-6">Connect with fellow shell collectors. Coming in Season 2.</p>
        <motion.div 
          className="px-6 py-2.5 rounded-full text-sm font-black text-white" 
          style={{ background: '#EF476F' }}
          animate={{ scale: [1, 1.04, 1] }} 
          transition={{ duration: 2, repeat: Infinity }}
        >
          Stay tuned 🐚
        </motion.div>
      </motion.div>
    </GameLayout>
  );
}
