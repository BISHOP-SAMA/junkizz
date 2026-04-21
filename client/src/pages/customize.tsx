import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import bgSrc from "@assets/background.jpg";
import slog2Src from "@assets/Slog-2.jpg";

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const panelStyle = {
  background: "rgba(15,8,4,0.80)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(139,92,246,0.3)",
};

const traits = [
  {
    category: "SHELL",
    options: [
      { name: "Classic", rarity: "Common", emoji: "🐚" },
      { name: "Mech", rarity: "Rare", emoji: "⚙️" },
      { name: "Crystal", rarity: "Epic", emoji: "💎" },
      { name: "Gold", rarity: "Legendary", emoji: "✨" },
      { name: "Rocket", rarity: "Rare", emoji: "🚀" },
    ],
  },
  {
    category: "HEAD",
    options: [
      { name: "None", rarity: "Common", emoji: "—" },
      { name: "Crown", rarity: "Rare", emoji: "👑" },
      { name: "Halo", rarity: "Epic", emoji: "😇" },
      { name: "Horns", rarity: "Rare", emoji: "😈" },
    ],
  },
  {
    category: "EYES",
    options: [
      { name: "Normal", rarity: "Common", emoji: "👀" },
      { name: "Laser", rarity: "Rare", emoji: "🔴" },
      { name: "Galaxy", rarity: "Epic", emoji: "🌌" },
      { name: "Sleepy", rarity: "Common", emoji: "😴" },
    ],
  },
];

const rarityColors: Record<string, string> = {
  Common: "#9ca3af",
  Rare: "#60a5fa",
  Epic: "#a78bfa",
  Legendary: "#fbbf24",
};

export default function Customize() {
  const [activeCategory, setActiveCategory] = React.useState("SHELL");
  const [selected, setSelected] = React.useState<Record<string, string>>({
    SHELL: "Classic",
    HEAD: "None",
    EYES: "Normal",
  });

  const currentTraits = traits.find((t) => t.category === activeCategory);

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
      <div className="absolute inset-0 bg-black/65" />

      <div className="relative z-10 py-16 px-4 sm:px-6">
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-6 left-6 inline-flex items-center justify-center p-3 rounded-full cursor-pointer"
            style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.4)" }}
          >
            <ArrowLeft className="h-5 w-5 text-purple-400" />
          </motion.div>
        </Link>

        <div className="max-w-2xl mx-auto pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1
              className="text-5xl sm:text-6xl font-black tracking-widest mb-2"
              style={{
                fontFamily: font,
                color: "#a78bfa",
                textShadow: "0 0 40px rgba(139,92,246,0.5)",
              }}
            >
              DRESS UP
            </h1>
            <p className="text-white/50 tracking-wider font-medium">
              Customize your snail's look and traits
            </p>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-6 mb-6 text-center"
            style={panelStyle}
          >
            <p className="text-xs font-black tracking-widest text-white/40 uppercase mb-4" style={{ fontFamily: font }}>
              PREVIEW
            </p>
            <div
              className="w-40 h-40 mx-auto rounded-2xl overflow-hidden mb-4"
              style={{ border: "2px solid rgba(139,92,246,0.4)" }}
            >
              <img src={slog2Src} alt="Slog preview" className="w-full h-full object-cover" />
            </div>
            <div
              className="inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-widest"
              style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.4)", color: "#a78bfa", fontFamily: font }}
            >
              {Object.values(selected).join(" · ")} BUILD
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-left">
              {Object.entries(selected).map(([cat, val]) => (
                <div key={cat} className="flex justify-between">
                  <span className="text-xs text-white/30 uppercase font-bold" style={{ fontFamily: font }}>{cat}</span>
                  <span className="text-xs text-white/70 font-bold" style={{ fontFamily: font }}>{val}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 rounded-xl font-black tracking-widest text-sm"
              style={{
                background: "linear-gradient(135deg, #ea580c, #f59e0b)",
                fontFamily: font,
                color: "white",
              }}
            >
              SAVE LOOK
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 rounded-xl font-black tracking-widest text-sm text-purple-400"
              style={{
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.4)",
                fontFamily: font,
              }}
            >
              SHARE
            </motion.button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap mb-5">
            {traits.map((t) => (
              <motion.button
                key={t.category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(t.category)}
                className="px-4 py-2 rounded-xl text-xs font-black tracking-widest transition-all"
                style={{
                  background: activeCategory === t.category ? "#8b5cf6" : "rgba(139,92,246,0.1)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  color: activeCategory === t.category ? "white" : "#a78bfa",
                  fontFamily: font,
                }}
              >
                {t.category}
              </motion.button>
            ))}
          </div>

          {/* Trait options */}
          <div className="rounded-2xl p-5" style={panelStyle}>
            <p className="text-xs font-black tracking-widest text-white/40 uppercase mb-4" style={{ fontFamily: font }}>
              SELECT {activeCategory}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {currentTraits?.options.map((opt) => {
                const isSelected = selected[activeCategory] === opt.name;
                return (
                  <motion.div
                    key={opt.name}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelected((prev) => ({ ...prev, [activeCategory]: opt.name }))}
                    className="relative p-4 rounded-xl cursor-pointer text-center transition-all"
                    style={{
                      background: isSelected ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.03)",
                      border: isSelected ? "2px solid #8b5cf6" : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {isSelected && (
                      <div
                        className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: "#8b5cf6" }}
                      >
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <div className="text-2xl mb-2">{opt.emoji}</div>
                    <div className="text-sm font-black text-white" style={{ fontFamily: font }}>{opt.name}</div>
                    <div
                      className="text-xs font-bold mt-0.5"
                      style={{ color: rarityColors[opt.rarity], fontFamily: font }}
                    >
                      {opt.rarity}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full mt-5 py-3 rounded-xl text-sm font-black tracking-widest text-orange-400"
              style={{
                background: "rgba(249,115,22,0.08)",
                border: "1px solid rgba(249,115,22,0.3)",
                fontFamily: font,
              }}
              onClick={() => {
                const randomized: Record<string, string> = {};
                traits.forEach((t) => {
                  randomized[t.category] = t.options[Math.floor(Math.random() * t.options.length)].name;
                });
                setSelected(randomized);
              }}
            >
              RANDOMIZE ALL 🎲
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
