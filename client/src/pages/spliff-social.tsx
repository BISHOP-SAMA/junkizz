import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

function ComingSoonDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        className="relative w-full max-w-sm rounded-3xl bg-white/90 backdrop-blur-xl p-8 border-4 border-white shadow-2xl text-center"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-black/5 transition-colors"
        >
          <X className="h-5 w-5 text-black" />
        </button>

        <div className="text-6xl mb-4 animate-bounce">🌿</div>
        <h2 className="text-3xl font-black text-black mb-3 italic tracking-tight">
          COMING SOON
        </h2>
        <p className="text-black/70 font-bold">
          The Spliff Social experience is currently being minted. Get your wallet ready.
        </p>
      </motion.div>
    </div>
  );
}

export default function SpliffSocial() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative bg-emerald-50">
      <Navbar />

      {/* 1. GLASS OVERLAY (The "Transparent White Stuff") */}
      <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[12px] border-inset border-white/20" />

      {/* 2. CENTERED MAIN CONTENT */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-20 w-full max-w-2xl mx-auto text-center flex flex-col items-center justify-center"
      >
        <div className="mb-4">
           <motion.span 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-8xl"
           >
            🌿
           </motion.span>
        </div>

        <h1 className="font-display text-7xl sm:text-8xl font-black text-black tracking-tighter mb-4 drop-shadow-sm">
          Spliff Social
        </h1>

        <p className="text-xl font-bold text-black/60 mb-12 uppercase tracking-widest">
          On-Chain Sovereignty
        </p>

        {/* The Hero Action: Connect Wallet */}
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="relative group"
        >
          <Button
            size="lg"
            className="relative text-2xl px-16 py-10 bg-black text-white rounded-full shadow-2xl hover:bg-zinc-900 border-4 border-white/20"
            onClick={() => setDialogOpen(true)}
          >
            <Wallet className="h-8 w-8 mr-4" />
            Connect Wallet
          </Button>
        </motion.div>

        {/* Feature Teasers */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-40 hover:opacity-100 transition-opacity duration-500">
           <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">🎨</span>
              <span className="text-xs font-black uppercase text-black">CUSTOMIZE</span>
           </div>
           <div className="flex flex-col items-center border-x border-black/10 px-4">
              <span className="text-2xl mb-1">💬</span>
              <span className="text-xs font-black uppercase text-black">Encrypted</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">🏆</span>
              <span className="text-xs font-black uppercase text-black">Rewards</span>
           </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {dialogOpen && <ComingSoonDialog onClose={() => setDialogOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
