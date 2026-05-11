import { useState } from 'react';
import { motion } from 'framer-motion';
import GameLayout from '../components/GameLayout';
import type { ArtSubmission } from '../lib/supabase';

export default function Gallery() {
  const [artworks] = useState<ArtSubmission[]>([
    { id: '1', user_id: 'u1', x_post_url: 'https://x.com/user1/status/123', image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop', status: 'approved', shells_awarded: 2000, submitted_at: new Date().toISOString() },
    { id: '2', user_id: 'u2', x_post_url: 'https://x.com/user2/status/456', image_url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=400&fit=crop', status: 'approved', shells_awarded: 1500, submitted_at: new Date().toISOString() },
  ]);

  return (
    <GameLayout pageId="gallery">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4 pb-4">
        <div className="text-center py-4">
          <h2 className="text-xl font-black text-[#1a1a2e]" style={{ fontFamily: 'Georgia, serif' }}>Community Gallery</h2>
          <p className="text-xs text-gray-400 mt-1">Approved art from Shellies creators</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {artworks.map((art) => (
            <motion.div key={art.id} whileHover={{ scale: 1.02 }} className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
              <img src={art.image_url} alt="art" className="w-full aspect-square object-cover" />
              <div className="p-2.5">
                <div className="text-[10px] font-bold text-gray-500 truncate">{art.x_post_url}</div>
                <div className="text-[10px] font-black text-[#06D6A0] mt-0.5">+{art.shells_awarded} shells</div>
              </div>
            </motion.div>
          ))}
        </div>
        {artworks.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No approved art yet. Be the first!</div>}
      </motion.div>
    </GameLayout>
  );
}
