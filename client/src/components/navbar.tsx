import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import logoSrc from "@assets/Logo-junkies.jpg";
import oasisSrc from "@assets/Oasis.png";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4">
      <Link href="/">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer"
        >
          <img
            src={logoSrc}
            alt="Junkies Logo"
            className="h-12 w-12 rounded-full cartoon-border object-cover"
          />
        </motion.div>
      </Link>

      <Link href="/oasis">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-2 rounded-full cartoon-border cartoon-shadow bg-white font-bold text-foreground text-base hover:bg-secondary transition-colors"
        >
          <img src={oasisSrc} alt="Oasis" className="h-6 w-6 rounded-full object-cover" />
          The Oasis
        </motion.button>
      </Link>
    </nav>
  );
}