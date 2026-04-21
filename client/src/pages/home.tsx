import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/navbar";
import bgSrc from "@assets/background.jpg";
import slog1Src from "@assets/Slog-1.jpg";
import slog2Src from "@assets/Slog-2.jpg";

const stats = [
  { label: "SUPPLY", value: "3,333", color: "#f97316" },
  { label: "WL SPOTS", value: "500", color: "#a78bfa" },
  { label: "MINT PRICE", value: "TBA", color: "#f97316" },
];

const cards = [
  {
    href: "/apply",
    label: "APPLY TO WL",
    sub: "Secure your spot",
    icon: slog1Src,
    borderColor: "rgba(249,115,22,0.6)",
    topColor: "linear-gradient(90deg, #ea580c, #f59e0b)",
    arrowBg: "#f97316",
    glow: "rgba(249,115,22,0.3)",
  },
  {
    href: "/customize",
    label: "DRESS UP",
    sub: "Customize your snail",
    icon: "👕",
    borderColor: "rgba(139,92,246,0.6)",
    topColor: "linear-gradient(90deg, #7c3aed, #a855f7)",
    arrowBg: "#8b5cf6",
    glow: "rgba(139,92,246,0.3)",
  },
  {
    href: "/race",
    label: "RACE TO WIN",
    sub: "Earn WL in the track",
    icon: "🏁",
    borderColor: "rgba(59,130,246,0.6)",
    topColor: "linear-gradient(90deg, #1d4ed8, #06b6d4)",
    arrowBg: "#3b82f6",
    glow: "rgba(59,130,246,0.3)",
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
      <div className="absolute inset-0 bg-black/45" />
      <Navbar />

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center px-4 pt-28 pb-16 flex flex-col items-center">

        {/* SLOGS title with float animation instead of color-change */}
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

        <p
          className="text-base sm:text-lg tracking-[0.4em] text-white/60 uppercase mb-2"
          style={{ fontFamily: font }}
        >
          NFT Collection
        </p>
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="w-12 h-px bg-orange-400/50" />
          <span className="text-xs tracking-widest text-yellow-400 font-bold" style={{ fontFamily: font }}>
            SEASON 1
          </span>
          <span className="w-12 h-px bg-orange-400/50" />
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-8 sm:gap-16 mb-12 px-8 py-4 rounded-2xl"
          style={{
            background: "rgba(15,8,4,0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(200,120,40,0.25)",
          }}
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center">
              {i > 0 && <div className="hidden sm:block absolute h-8 w-px bg-white/10" />}
              <div
                className="text-2xl sm:text-3xl font-black"
                style={{ color: stat.color, fontFamily: font }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs tracking-widest text-white/50 font-bold mt-0.5"
                style={{ fontFamily: font }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-12">
          {cards.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link href={card.href}>
                <div
                  className="relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{
                    background: "rgba(15,8,4,0.75)",
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${card.borderColor}`,
                    boxShadow: `0 4px 24px ${card.glow}`,
                  }}
                >
                  <div className="h-1.5 w-full" style={{ background: card.topColor }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-6">
                      {typeof card.icon === "string" && card.icon.startsWith("/") || typeof card.icon !== "string" ? (
                        <img
                          src={card.icon as string}
                          alt={card.label}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-3xl">{card.icon}</span>
                      )}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: card.arrowBg }}
                      >
                        →
                      </div>
                    </div>
                    <div
                      className="text-lg font-black tracking-wider text-white mb-1"
                      style={{ fontFamily: font }}
                    >
                      {card.label}
                    </div>
                    <div className="text-sm text-white/50">{card.sub}</div>
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
            className="w-16 h-16 rounded-xl overflow-hidden border-2 border-orange-500/40 shadow-xl"
          >
            <img src={slog1Src} alt="Slog 1" className="w-full h-full object-cover" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
            className="w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-500/40 shadow-xl"
          >
            <img src={slog2Src} alt="Slog 2" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <p
          className="text-xs tracking-widest text-white/40 font-bold uppercase"
          style={{ fontFamily: font }}
        >
          SLOW AND STEADY WINS THE WHITELIST
        </p>
      </div>
    </div>
  );
}
