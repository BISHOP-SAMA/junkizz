import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import confetti from "canvas-confetti";
import { Link } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateApplication } from "@/hooks/use-applications";
import bgSrc from "@assets/background.jpg";

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const applySchema = z.object({
  quoteTweet: z.string().url("Please provide a valid URL"),
  xUsername: z.string().min(2, "Link/Username required"),
  evmAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM address"),
});

type ApplyFormValues = z.infer<typeof applySchema>;

const checklistItems = [
  { label: "Follow Slogs on X", url: "https://x.com/PlanetSlogss", emoji: "🐦" },
  { label: "Like & Quote Slogs", url: "https://x.com/i/status/2046664680966328422", emoji: "🔁" },
  { label: "Drop a comment & tag two fren", url: "https://x.com/i/status/2046664680966328422", emoji: "💬" },
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

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: { quoteTweet: "", xUsername: "", evmAddress: "" },
  });

  const onSubmit = async (data: ApplyFormValues) => {
    try {
      await submitApplication(data);
      const duration = 3000;
      const end = Date.now() + duration;
      (function frame() {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#f97316", "#fbbf24"] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#f97316", "#fbbf24"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
      setIsSuccess(true);
    } catch (error: any) {
      alert(error.response?.data?.message || "Check fields and try again.");
    }
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundImage: `url(${bgSrc})`, backgroundSize: "cover", backgroundPosition: "center", fontFamily: font }}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 py-16 px-4 max-w-2xl mx-auto">
        <Link href="/">
          <div className="absolute top-6 left-6 p-3 rounded-full cursor-pointer bg-orange-500/20 border border-orange-500/40">
            <ArrowLeft className="h-5 w-5 text-orange-400" />
          </div>
        </Link>

        <h1 className="text-5xl font-black text-center text-orange-400 mb-10 tracking-widest">APPLY TO WL</h1>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <div className="space-y-6">
              <div className="rounded-2xl p-6" style={panelStyle}>
                <h3 className="text-xs font-black text-orange-400 uppercase mb-4">REQUIREMENTS</h3>
                {checklistItems.map((item, i) => (
                  <div key={i} onClick={() => { window.open(item.url, "_blank"); setChecked(p => { const n = [...p]; n[i] = true; return n; }); }}
                    className={`flex items-center gap-3 p-3 rounded-xl mb-2 cursor-pointer border ${checked[i] ? "bg-orange-500/10 border-orange-500/40" : "bg-white/5 border-white/10"}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checked[i] ? "bg-orange-500 border-orange-500" : "border-white/30"}`}>
                      {checked[i] && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <span className={`text-sm font-bold ${checked[i] ? "text-orange-400 line-through" : "text-white"}`}>{item.emoji} {item.label}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-6" style={panelStyle}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <Label className="text-xs font-black text-white/50 uppercase">QUOTE TWEET LINK</Label>
                    <Input {...form.register("quoteTweet")} className="bg-white/5 border-white/10 text-white" placeholder="https://x.com/..." />
                    {form.formState.errors.quoteTweet && <p className="text-red-400 text-xs mt-1">{form.formState.errors.quoteTweet.message}</p>}
                  </div>
                  <div>
                    <Label className="text-xs font-black text-white/50 uppercase">COMMENT LINK</Label>
                    <Input {...form.register("xUsername")} className="bg-white/5 border-white/10 text-white" placeholder="Link to your comment" />
                    {form.formState.errors.xUsername && <p className="text-red-400 text-xs mt-1">{form.formState.errors.xUsername.message}</p>}
                  </div>
                  <div>
                    <Label className="text-xs font-black text-white/50 uppercase">EVM WALLET ADDRESS</Label>
                    <Input {...form.register("evmAddress")} className="bg-white/5 border-white/10 text-white font-mono" placeholder="0x..." />
                    {form.formState.errors.evmAddress && <p className="text-red-400 text-xs mt-1">{form.formState.errors.evmAddress.message}</p>}
                  </div>
                  <Button type="submit" disabled={isPending} className="w-full py-7 bg-gradient-to-r from-orange-600 to-orange-400 font-black">
                    {isPending ? <Loader2 className="animate-spin mr-2" /> : "SUBMIT APPLICATION 🐌"}
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-10 text-center" style={panelStyle}>
              <div className="text-6xl mb-4">🐌</div>
              <h2 className="text-4xl font-black text-orange-400 mb-3">SUBMITTED!</h2>
              <p className="text-white/60 mb-8">Stay slow. Stay steady. Win.</p>
              <Link href="/"><Button className="bg-orange-500 font-black">BACK TO HOME</Button></Link>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

