import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import confetti from "canvas-confetti";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, CheckSquare, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateApplication } from "@/hooks/use-applications";

const applySchema = z.object({
  quoteTweet: z.string().url("Please provide a valid URL to your quote tweet"),
  xUsername: z.string().min(2, "Comment link is required"),
  evmAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Please enter a valid EVM address"),
});

type ApplyFormValues = z.infer<typeof applySchema>;

const checklistItems = [
  {
    label: "Follow Junkies",
    url: "https://x.com/junkyardonETH",
  },
  {
    label: "Like and Retweet Junkies",
    url: "https://x.com/i/status/2035804464884654214",
  },
  {
    label: "Quote Junkies",
    url: "https://x.com/i/status/2035804464884654214",
  },
];

export default function Apply() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  const { mutateAsync: submitApplication, isPending } = useCreateApplication();

  const toggleCheck = (index: number, url: string) => {
    window.open(url, "_blank");
    setChecked((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      quoteTweet: "",
      xUsername: "",
      evmAddress: "",
    },
  });

  const onSubmit = async (data: ApplyFormValues) => {
    try {
      await submitApplication({ ...data, favoriteJunk: "-" });
      triggerConfetti();
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <Link href="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 inline-flex items-center justify-center p-3 bg-white rounded-full cartoon-border cartoon-shadow cartoon-hover text-foreground transition-transform">
        <ArrowLeft className="h-6 w-6" />
      </Link>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-foreground mb-4">
            Join the Junkyard
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Complete the steps below to secure your spot.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              {/* Checklist Card */}
              <div className="bg-secondary p-6 sm:p-8 rounded-3xl cartoon-border cartoon-shadow-lg transform rotate-1">
                <h3 className="font-display text-2xl font-bold text-secondary-foreground mb-4 flex items-center gap-2">
                  <CheckSquare className="h-6 w-6" /> Mandatory Checklist
                </h3>
                <ul className="space-y-3 font-bold text-secondary-foreground/80 text-lg">
                  {checklistItems.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => toggleCheck(index, item.url)}
                      className="flex items-center gap-3 bg-white/40 p-3 rounded-xl cursor-pointer hover:bg-white/60 transition-colors select-none"
                    >
                      <motion.div
                        className="flex-shrink-0"
                        initial={false}
                        animate={checked[index] ? { scale: [1.2, 1] } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {checked[index] ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-secondary-foreground" />
                        )}
                      </motion.div>
                      <span className={checked[index] ? "line-through opacity-60" : ""}>
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Form Card */}
              <div className="bg-card p-6 sm:p-8 rounded-3xl cartoon-border cartoon-shadow-lg transform -rotate-1">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  <div className="space-y-3">
                    <Label htmlFor="quoteTweet" className="text-lg">Drop your quote tweet here</Label>
                    <Input
                      id="quoteTweet"
                      placeholder="https://x.com/..."
                      {...form.register("quoteTweet")}
                    />
                    {form.formState.errors.quoteTweet && (
                      <p className="text-destructive font-bold text-sm">{form.formState.errors.quoteTweet.message}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="xUsername" className="text-lg">Drop a comment and tag a fren</Label>
                    <Input
                      id="xUsername"
                      placeholder="Drop comment link"
                      {...form.register("xUsername")}
                    />
                    {form.formState.errors.xUsername && (
                      <p className="text-destructive font-bold text-sm">{form.formState.errors.xUsername.message}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="evmAddress" className="text-lg">Enter EVM Address here</Label>
                    <Input
                      id="evmAddress"
                      placeholder="0x..."
                      className="font-mono"
                      {...form.register("evmAddress")}
                    />
                    {form.formState.errors.evmAddress && (
                      <p className="text-destructive font-bold text-sm">{form.formState.errors.evmAddress.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-xl py-8 mt-4 bg-accent text-accent-foreground border-foreground"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" /> Submitting...
                      </span>
                    ) : "Submit Application"}
                  </Button>

                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 sm:p-12 rounded-3xl cartoon-border cartoon-shadow-lg text-center"
            >
              <div className="mx-auto w-24 h-24 bg-accent/20 text-accent rounded-full flex items-center justify-center mb-6 cartoon-border">
                <Sparkles className="h-12 w-12" />
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Congratulations!
              </h2>
              <p className="text-xl sm:text-2xl font-bold text-muted-foreground mb-8">
                You're now a certified Junkie!
              </p>
              <Link href="/">
                <Button size="lg" className="text-xl px-10 py-6">
                  Back to Junkyard
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}