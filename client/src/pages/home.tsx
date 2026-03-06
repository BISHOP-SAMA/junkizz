import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { JoinDialog } from "@/components/join-dialog";
import { StatusDialog } from "@/components/status-dialog";

export default function Home() {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary rounded-full blur-3xl opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="relative z-10 w-full max-w-3xl mx-auto text-center"
      >
        <motion.div
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        >
          <h1 className="font-display text-7xl sm:text-8xl md:text-9xl font-extrabold text-stroke tracking-widest mb-6">
            JUNKIES
          </h1>
        </motion.div>
        
        <div className="bg-white px-8 py-4 rounded-full inline-block cartoon-border cartoon-shadow mb-12 transform -rotate-2">
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            Cartoon Nostalgia. Reborn As NFTs
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              size="lg" 
              variant="default" 
              className="text-xl px-12 py-8 w-full sm:w-auto"
              onClick={() => setIsJoinOpen(true)}
            >
              Join Junkies
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-xl px-12 py-8 w-full sm:w-auto"
              onClick={() => setIsStatusOpen(true)}
            >
              Check status
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <JoinDialog isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
      <StatusDialog isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} />
    </div>
  );
}
