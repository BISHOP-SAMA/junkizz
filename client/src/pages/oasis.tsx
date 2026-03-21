import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import oasisBg from "@assets/Background.png";

// Set your target date here — 10 days from launch
const TARGET_DATE = new Date("2026-04-01T00:00:00Z");

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

export default function Oasis() {
  const { days, hours, minutes, seconds } = useCountdown(TARGET_DATE);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${oasisBg})` }}
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Back button */}
      <Link href="/" className="absolute top-6 left-6 z-10 inline-flex items-center justify-center p-3 bg-white rounded-full cartoon-border cartoon-shadow text-foreground">
        <ArrowLeft className="h-6 w-6" />
      </Link>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-4 text-center">

        {/* Spinning wheel */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="w-28 h-28 rounded-full border-8 border-white/30 border-t-white cartoon-border"
        />

        <div>
          <h1
            className="font-display text-5xl sm:text-7xl font-extrabold text-white mb-2 tracking-widest"
            style={{ textShadow: "2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000" }}
          >
            The Oasis
          </h1>
          <p className="text-white/80 font-bold text-xl">Something is brewing...</p>
        </div>

        {/* Countdown */}
        <div className="flex gap-4 sm:gap-6">
          {[
            { label: "Days",    value: days },
            { label: "Hours",   value: hours },
            { label: "Minutes", value: minutes },
            { label: "Seconds", value: seconds },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-2xl px-4 py-4 cartoon-border min-w-[70px]">
              <span className="font-display text-4xl sm:text-5xl font-extrabold text-white">
                {String(value).padStart(2, "0")}
              </span>
              <span className="text-white/70 font-bold text-xs mt-1 uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
