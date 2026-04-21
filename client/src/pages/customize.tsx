// customize.tsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import bgSrc from "@assets/background.jpg";

export default function Customize() {
  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${bgSrc})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/75" />

      {/* Back Button */}
      <Link href="/">
        <motion.div
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer text-sm font-medium text-white/70 hover:text-white transition-colors"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </motion.div>
      </Link>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-xs tracking-[0.25em] text-white/40 uppercase font-semibold mb-4">
            Dress Up
          </p>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight mb-6"
            style={{ letterSpacing: "-0.02em" }}
          >
            Coming Soon
          </h1>
          <p className="text-base text-white/50 leading-relaxed mb-10 font-medium">
            The wardrobe is being curated. Soon you’ll be able to customize your
            Slog with unique traits, rare accessories, and legendary gear.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-white/10" />
            <span className="text-[11px] tracking-[0.2em] text-white/30 uppercase font-semibold">
              Notify Me
            </span>
            <div className="h-px w-8 bg-white/10" />
          </div>

          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-sm outline-none focus:border-purple-500/40 transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#7c3aed" }}
            >
              Join
            </motion.button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-[11px] tracking-[0.15em] text-white/25 uppercase font-medium"
        >
          Estimated launch — Season 1
        </motion.p>
      </div>
    </div>
  );
}
