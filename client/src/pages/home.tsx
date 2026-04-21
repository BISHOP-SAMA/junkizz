import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/navbar";

// Asset Imports
import applyJpg from "@assets/Apply.jpg";
import dressPng from "@assets/Dress.png";
import raceJpg from "@assets/Race.jpg";
import bgSrc from "@assets/background.jpg";
import slog1Src from "@assets/Slog-1.jpg";
import slog2Src from "@assets/Slog-2.jpg";

const stats = [
  { label: "COLLECTION", value: "1,300", color: "#c2410c" },
  { label: "WEBSITE", value: "500", color: "#7c3aed" },
  { label: "TEAM", value: "50", color: "#b45309" },
  { label: "PARTNERS", value: "750", color: "#2563eb" },
];

const cards = [
  {
    href: "/apply",
    label: "Apply to Whitelist",
    sub: "Secure your spot in the collection",
    image: applyJpg,
    accent: "#c2410c",
  },
  {
    href: "/customize",
    label: "Dress Up",
    sub: "Customize your unique snail",
    image: dressPng,
    accent: "#7c3aed",
  },
  {
    href: "/race",
    label: "Race to Win",
    sub: "Earn whitelist on the track",
    image: raceJpg,
    accent: "#2563eb",
  },
];

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center overflow-hidden relative"
      style={{
        backgroundImage: `url(${bgSrc})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Refined Background Overlay */}
      <div className="absolute inset-0 bg-slate-950/70" />
      
      <Navbar />

      <div className="relative z-10 w-full max-w-5xl mx-auto text-center px-6 pt-32 pb-20 flex flex-col items-center">

        {/* Brand Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-3"
        >
          <h1
            className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white"
            style={{
              letterSpacing: "-0.02em",
            }}
          >
            SLOGS
          </h1>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-sm sm:text-base tracking-[0.25em] text-white/50 uppercase mb-3 font-medium"
        >
          NFT Collection
        </motion.p>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex items-center justify-center gap-4 mb-14"
        >
          <span className="w-16 h-px bg-white/20" />
          <span className="text-xs tracking-[0.2em] text-white/60 font-semibold uppercase">
            Season 1
          </span>
          <span className="w-16 h-px bg-white/20" />
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-wrap justify-center items-center gap-10 sm:gap-16 mb-16 px-12 py-8 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="text-center"
            >
              <div
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="text-[11px] tracking-[0.15em] text-white/40 font-semibold mt-2 uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full mb-20">
          {cards.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.12, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="h-80"
            >
              <Link href={card.href}>
                <div
                  className="relative h-full overflow-hidden rounded-2xl cursor-pointer group"
                  style={{
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/70 transition-all duration-500" />
                  
                  {/* Accent Border */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ 
                      boxShadow: `inset 0 0 0 1px ${card.accent}40, 0 20px 40px -15px ${card.accent}20` 
                    }}
                  />

                  {/* Top Accent Line */}
                  <div 
                    className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 ease-out"
                    style={{ background: card.accent }}
                  />

                  {/* Card Content */}
                  <div className="relative z-10 p-7 h-full flex flex-col justify-end text-left">
                    <div className="flex items-end justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white tracking-tight">
                        {card.label}
                      </h3>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300"
                        style={{ background: card.accent }}
                      >
                        →
                      </div>
                    </div>
                    <p className="text-sm text-white/50 font-medium leading-relaxed">
                      {card.sub}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Preview Images */}
        <div className="flex items-center gap-5 justify-center mb-6">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shadow-xl"
          >
            <img src={slog1Src} alt="Slog 1" className="w-full h-full object-cover" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1.3 }}
            className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shadow-xl"
          >
            <img src={slog2Src} alt="Slog 2" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-[11px] tracking-[0.2em] text-white/30 font-medium uppercase"
        >
          Slow and steady wins the whitelist
        </motion.p>
      </div>
    </div>
  );
}
