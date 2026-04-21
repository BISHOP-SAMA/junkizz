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
  { label: "COLLECTION", value: "1,300", color: "#f97316" },
  { label: "WEBSITE", value: "500", color: "#a78bfa" },
  { label: "TEAM", value: "50", color: "#fbbf24" },
  { label: "PARTNERED", value: "750", color: "#60a5fa" },
];

const cards = [
  {
    href: "/apply",
    label: "APPLY TO WL",
    sub: "Secure your spot",
    image: applyJpg,
    borderColor: "rgba(249,115,22,0.6)",
    topColor: "linear-gradient(90deg, #ea580c, #f59e0b)",
    arrowBg: "#f97316",
    glow: "rgba(249,115,22,0.4)",
  },
  {
    href: "/customize",
    label: "DRESS UP",
    sub: "Customize your snail",
    image: dressPng,
    borderColor: "rgba(139,92,246,0.6)",
    topColor: "linear-gradient(90deg, #7c3aed, #a855f7)",
    arrowBg: "#8b5cf6",
    glow: "rgba(139,92,246,0.4)",
  },
  {
    href: "/race",
    label: "RACE TO WIN",
    sub: "Earn WL in the track",
    image: raceJpg,
    borderColor: "rgba(59,130,246,0.6)",
    topColor: "linear-gradient(90deg, #1d4ed8, #06b6d4)",
    arrowBg: "#3b82f6",
    glow: "rgba(59,130,246,0.4)",
  },
];

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center overflow-hidden relative"
      style={{
        backgroundImage: `url(${bgSrc})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: font,
      }}
    >
      {/* Page Background Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      <Navbar />

      <div className="relative z-10 w-full max-w-5xl mx-auto text-center px-4 pt-32 pb-16 flex flex-col items-center">

        {/* Animated Title */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="mb-2"
        >
          <h1
            className="text-7xl sm:text-8xl md:text-9xl font-black tracking-widest text-orange-400"
            style={{
              fontFamily: font,
              textShadow: "0 0 60px rgba(249,115,22,0.6), 0 4px 0 rgba(0,0,0,0.5)",
            }}
          >
            SLOGS
          </h1>
        </motion.div>

        <p className="text-base sm:text-lg tracking-[0.4em] text-white/60 uppercase mb-2">
          NFT Collection
        </p>

        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="w-12 h-px bg-orange-400/50" />
          <span className="text-xs tracking-widest text-yellow-400 font-bold">
            SEASON 1
          </span>
          <span className="w-12 h-px bg-orange-400/50" />
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 mb-12 px-10 py-6 rounded-2xl"
          style={{
            background: "rgba(15,8,4,0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(200,120,40,0.3)",
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-2xl sm:text-4xl font-black"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs tracking-widest text-white/50 font-bold mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Feature Cards - Full Background Style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-16">
          {cards.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.97 }}
              className="h-72"
            >
              <Link href={card.href}>
                <div
                  className="relative h-full overflow-hidden rounded-3xl cursor-pointer border group"
                  style={{
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderColor: card.borderColor,
                    boxShadow: `0 10px 30px -10px ${card.glow}`,
                  }}
                >
                  {/* Tint Overlay */}
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-300" />
                  
                  {/* Accent Line */}
                  <div className="absolute top-0 left-0 h-1.5 w-full z-20" style={{ background: card.topColor }} />

                  {/* Card Content */}
                  <div className="relative z-10 p-6 h-full flex flex-col justify-end text-left">
                    <div className="flex items-center justify-between mb-2">
                      <h3 
                        className="text-xl font-black text-white tracking-wide"
                        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
                      >
                        {card.label}
                      </h3>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shadow-xl"
                        style={{ background: card.arrowBg }}
                      >
                        →
                      </div>
                    </div>
                    <p 
                      className="text-sm text-white/70 font-medium"
                      style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                    >
                      {card.sub}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Slog preview images */}
        <div className="flex items-center gap-6 justify-center mb-8">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-orange-500/40 shadow-2xl"
          >
            <img src={slog1Src} alt="Slog 1" className="w-full h-full object-cover" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
            className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-purple-500/40 shadow-2xl"
          >
            <img src={slog2Src} alt="Slog 2" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <p className="text-xs tracking-widest text-white/40 font-bold uppercase">
          SLOW AND STEADY WINS THE WHITELIST
        </p>
      </div>
    </div>
  );
}
