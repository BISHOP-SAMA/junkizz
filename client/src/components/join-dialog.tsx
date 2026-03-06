import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { useLocation } from "wouter";
// Using the explicitly requested background image
import popupBg from "@assets/junck.jpg";

interface JoinDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinDialog({ isOpen, onClose }: JoinDialogProps) {
  const [, setLocation] = useLocation();

  const handleAccept = () => {
    onClose();
    setLocation("/apply");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20, rotate: -2 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20, rotate: 2 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl cartoon-border cartoon-shadow-lg"
          >
            {/* Background Image Layer */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${popupBg})` }}
            />
            {/* Earthy Dark Wash to ensure text is readable */}
            <div className="absolute inset-0 bg-foreground/40 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col items-center justify-center p-8 sm:p-12 text-center h-full min-h-[400px]">
              <h2 className="mb-8 font-display text-4xl sm:text-5xl font-extrabold text-stroke leading-tight tracking-wider">
                Welcome to the Junkyard
              </h2>
              
              <div className="mt-auto flex flex-col w-full gap-4 sm:flex-row sm:gap-6">
                <Button 
                  size="lg" 
                  variant="default"
                  onClick={handleAccept}
                  className="flex-1 text-lg py-6"
                >
                  Accept Invite
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 text-lg py-6 bg-white/90 hover:bg-white backdrop-blur-md"
                >
                  Decline
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
