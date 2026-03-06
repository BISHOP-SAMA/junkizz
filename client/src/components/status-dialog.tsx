import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useApplicationStatus } from "@/hooks/use-applications";
import { Search, X, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface StatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatusDialog({ isOpen, onClose }: StatusDialogProps) {
  const [address, setAddress] = useState("");
  const { mutate: checkStatus, isPending, data, error, reset } = useApplicationStatus();

  const handleClose = () => {
    setAddress("");
    reset();
    onClose();
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      checkStatus(address);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card p-6 sm:p-8 cartoon-border cartoon-shadow-lg"
          >
            <button 
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted transition-colors"
            >
              <X className="h-6 w-6 text-foreground" />
            </button>

            <div className="text-center mb-6">
              <h2 className="font-display text-3xl font-bold text-foreground">Check Status</h2>
              <p className="mt-2 text-muted-foreground font-medium">
                Enter your EVM address to see if you're a certified Junkie.
              </p>
            </div>

            <form onSubmit={handleCheck} className="space-y-6">
              <div className="space-y-2 text-left">
                <Label htmlFor="address-check" className="text-lg">EVM Address</Label>
                <Input 
                  id="address-check"
                  placeholder="0x..." 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="font-mono"
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                variant="secondary" 
                className="w-full text-lg"
                disabled={isPending || !address.trim()}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  <Search className="mr-2 h-5 w-5" />
                )}
                Verify Status
              </Button>
            </form>

            <AnimatePresence mode="wait">
              {data && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className={`p-4 rounded-xl cartoon-border cartoon-shadow flex items-center gap-4 ${data.status === 'not_found' ? 'bg-white' : 'bg-accent/20'}`}>
                    {data.status === 'not_found' ? (
                      <XCircle className="h-8 w-8 text-destructive flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-8 w-8 text-accent flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-bold text-foreground">
                        {data.status === 'not_found' 
                          ? "Application Not Found" 
                          : `Status: ${data.status.toUpperCase()}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {data.status === 'not_found' 
                          ? "We couldn't find an application for this address."
                          : "You're on the list!"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className="p-4 rounded-xl cartoon-border cartoon-shadow bg-destructive/10 flex items-center gap-4">
                    <XCircle className="h-8 w-8 text-destructive flex-shrink-0" />
                    <div>
                      <p className="font-bold text-destructive">Error</p>
                      <p className="text-sm text-destructive/80">{error.message}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
