import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import confetti from "canvas-confetti";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateApplication } from "@/hooks/use-applications";
import bgSrc from "@assets/background.jpg";

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const applySchema = z.object({
  quoteTweet: z.string().url("Please provide a valid URL to your quote tweet"),
  xUsername: z.string().min(2, "Comment link is required"),
  evmAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Please enter a valid EVM address (0x...)"),
});

type ApplyFormValues = z.infer<typeof applySchema>;

const checklistItems = [
  { label: "Follow Slogs on X", url: "https://x.com/PlanetSlogss", emoji: "🐦" },
  { label: "Like & Retweet Slogs", url: "https://x.com/PlanetSlogss", emoji: "🔁" },
  { label: "Drop a comment on the pinned post", url: "https://x.com/PlanetSlogss", emoji: "💬" },
];

const panelStyle = {
  background: "rgba(15,8,4,0.80)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(200,120,40,0.25)",
};

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
    defaultValues: { quoteTweet: "", xUsername: "", evmAddress: "" },
  });

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ["#f97316", "#fbbf24", "#a78bfa"];
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const onSubmit = async (data: ApplyFormValues) => {
    try {
      await submitApplication({ ...data, favoriteJunk: "-" });
      triggerConfetti();
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${bgSrc})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: font,
      }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 py-16 px-4 sm:px-6">
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-6 left-6 inline-flex items-center justify-center p-3 rounded-full cursor-pointer"
            style={{ background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.4)" }}
          >
            <ArrowLeft className="h-5 w-5 text-orange-400" />
          </motion.div>
        </Link>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 pt-8"
          >
            <h1
              className="text-5xl sm:text-6xl font-black tracking-widest text-orange-400 mb-3"
              style={{ fontFamily: font, textShadow: "0 0 40px rgba(249,115,22,0.5)" }}
            >
              APPLY TO WL
            </h1>
            <p className="text-white/60 font-medium tracking-wider">
              500 whitelist spots. Don't sleep on it.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Checklist */}
                <div className="rounded-2xl p-6" style={panelStyle}>
                  <h3
                    className="text-xs font-black tracking-widest text-orange-400 uppercase mb-4"
                    style={{ fontFamily: font }}
                  >
                    REQUIREMENTS
                  </h3>
                  <div className="space-y-3">
                    {checklistItems.map((item, index) => (
                      <motion.div
                        key={index}
                        onClick={() => toggleCheck(index, item.url)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                        style={{
                          background: checked[index]
                            ? "rgba(249,115,22,0.1)"
                            : "rgba(255,255,255,0.04)",
                          border: checked[index]
                            ? "1px solid rgba(249,115,22,0.4)"
                            : "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            border: checked[index]
                              ? "2px solid #f97316"
                              : "2px solid rgba(255,255,255,0.3)",
                            background: checked[index] ? "#f97316" : "transparent",
                          }}
                        >
                          {checked[index] && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className="text-lg">{item.emoji}</span>
                        <span
                          className={`text-sm font-bold ${checked[index] ? "text-orange-400 line-through" : "text-white/80"}`}
                          style={{ fontFamily: font }}
                        >
                          {item.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-white/30 mt-4" style={{ fontFamily: font }}>
                    Click each task to complete it — opens in a new tab
                  </p>
                </div>

                {/* Form */}
                <div className="rounded-2xl p-6" style={panelStyle}>
                  <h3
                    className="text-xs font-black tracking-widest text-orange-400 uppercase mb-5"
                    style={{ fontFamily: font }}
                  >
                    YOUR APPLICATION
                  </h3>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="quoteTweet"
                        className="text-xs font-black tracking-widest text-white/50 uppercase"
                        style={{ fontFamily: font }}
                      >
                        QUOTE TWEET LINK
                      </Label>
                      <Input
                        id="quoteTweet"
                        placeholder="https://x.com/..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-orange-500/60"
                        style={{ fontFamily: font }}
                        {...form.register("quoteTweet")}
                      />
                      {form.formState.errors.quoteTweet && (
                        <p className="text-red-400 text-xs font-bold">{form.formState.errors.quoteTweet.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="xUsername"
                        className="text-xs font-black tracking-widest text-white/50 uppercase"
                        style={{ fontFamily: font }}
                      >
                        COMMENT LINK
                      </Label>
                      <Input
                        id="xUsername"
                        placeholder="Link to your comment on the post"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-orange-500/60"
                        style={{ fontFamily: font }}
                        {...form.register("xUsername")}
                      />
                      {form.formState.errors.xUsername && (
                        <p className="text-red-400 text-xs font-bold">{form.formState.errors.xUsername.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="evmAddress"
                        className="text-xs font-black tracking-widest text-white/50 uppercase"
                        style={{ fontFamily: font }}
                      >
                        EVM WALLET ADDRESS
                      </Label>
                      <Input
                        id="evmAddress"
                        placeholder="0x..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-orange-500/60 font-mono"
                        {...form.register("evmAddress")}
                      />
                      {form.formState.errors.evmAddress && (
                        <p className="text-red-400 text-xs font-bold">{form.formState.errors.evmAddress.message}</p>
                      )}
                    </div>

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full text-base py-7 font-black tracking-widest"
                        disabled={isPending}
                        style={{
                          background: "linear-gradient(135deg, #ea580c, #f59e0b)",
                          fontFamily: font,
                          boxShadow: "0 0 30px rgba(249,115,22,0.4)",
                        }}
                      >
                        {isPending ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" /> SUBMITTING...
                          </span>
                        ) : "SUBMIT APPLICATION 🐌"}
                      </Button>
                    </motion.div>

                    <p className="text-center text-xs text-white/25" style={{ fontFamily: font }}>
                      Applications close when all spots are filled. No promises, only vibes.
                    </p>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-10 text-center"
                style={panelStyle}
              >
                <div className="text-6xl mb-4">🐌</div>
                <h2
                  className="text-4xl font-black text-orange-400 mb-3 tracking-widest"
                  style={{ fontFamily: font, textShadow: "0 0 30px rgba(249,115,22,0.5)" }}
                >
                  SUBMITTED!
                </h2>
                <p className="text-white/60 mb-8 font-medium">
                  Your application is in the queue. We'll announce WL winners on X. Stay slow. Stay steady. Win.
                </p>
                <Link href="/">
                  <Button
                    size="lg"
                    className="font-black tracking-widest"
                    style={{
                      background: "linear-gradient(135deg, #ea580c, #f59e0b)",
                      fontFamily: font,
                    }}
                  >
                    BACK TO HOME
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
