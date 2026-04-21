import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import bgSrc from "@assets/background.jpg";

const TARGET_DATE = new Date("2026-05-01T00:00:00Z");

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Race() {
  const { days, hours, minutes, seconds } = useCountdown(TARGET_DATE);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgSrc})` }}
      />
      <div className="absolute inset-0 bg-black/55" />

      <Link href="/" className="absolute top-6 left-6 z-10 inline-flex items-center justify-center p-3 bg-orange-500 rounded-full text-white shadow-lg hover:bg-orange-600 transition-all">
        <ArrowLeft className="h-6 w-6" />
      </Link>

      <div className="relative z-10 flex flex-col items-center gap-10 px-4 text-center">

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="text-7xl"
        >
          🐌
        </motion.div>

        <div>
          <h1
            className="font-display text-5xl sm:text-7xl font-extrabold mb-2 tracking-widest text-orange-400"
            style={{ textShadow: "0 0 40px rgba(230,130,50,0.8)" }}
          >
            SLOG RACE
          </h1>
          <p className="text-orange-200/80 font-bold text-xl">
            The track is being built... 🏁
          </p>
        </div>

        <div className="flex gap-4 sm:gap-6">
          {[
            { label: "Days",    value: days },
            { label: "Hours",   value: hours },
            { label: "Minutes", value: minutes },
            { label: "Seconds", value: seconds },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-2xl px-4 py-4 min-w-[70px]"
              style={{
                background: "rgba(20,10,5,0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(230,130,50,0.4)",
              }}
            >
              <span className="font-display text-4xl sm:text-5xl font-extrabold text-orange-400">
                {String(value).padStart(2, "0")}
              </span>
              <span className="text-orange-200/70 font-bold text-xs mt-1 uppercase tracking-wider">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div
          className="px-8 py-4 rounded-2xl text-center"
          style={{
            background: "rgba(20,10,5,0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(230,130,50,0.3)",
          }}
        >
          <p className="text-orange-300 font-bold text-lg tracking-wider">
            TOP 2 FINISHERS WIN A WL SPOT
          </p>
          <p className="text-orange-200/60 text-sm mt-1">
            Race goes live when the countdown hits zero
          </p>
        </div>

      </div>
    </div>
  );
}
