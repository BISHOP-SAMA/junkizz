import { motion } from 'framer-motion';
import GameLayout from '../components/GameLayout';

export default function Airdrop() {
  return (
    <GameLayout pageId="airdrop" label="Airdrop" color="#8B5CF6">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ duration: 3, repeat: Infinity }} 
          className="text-6xl mb-6"
        >
          🎁
        </motion.div>
        <h2 className="text-3xl font-black text-[#1a1a2e] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          Airdrop
        </h2>
        <p className="text-sm text-gray-400 mb-8 max-w-xs">
          Season 1 airdrops will be distributed to active players. Keep collecting shells!
        </p>
        <div 
          className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white" 
          style={{ background: '#8B5CF6', boxShadow: '0 4px 0 #6d28d9' }}
        >
          Coming Soon
        </div>
      </div>
    </GameLayout>
  );
}
