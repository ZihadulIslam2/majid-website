"use client";

import { Search, ChevronDown, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function Banner() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="relative flex-1 flex items-center justify-center overflow-hidden ">
      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 z-0">
        {/* Gradient SVG */}
        <Image
          src="/images/banner1.svg"
          alt="Gradient Background"
          fill
          priority
          className="object-cover"
        />

        {/* Vertical Lines SVG */}
        <Image
          src="/images/Rasel.svg"
          alt="Lines Overlay"
          fill
          priority
          className="object-cover opacity-15 mix-blend-overlay"
        />

        {/* Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] md:w-[900px] h-[300px] sm:h-[600px] bg-white/50 blur-[80px] sm:blur-[120px] rounded-full" />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 max-w-5xl w-full text-center px-4 md:px-6 py-10 md:py-0">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white mb-4 md:mb-6 leading-tight"
        >
          Verify Global <span className="text-[#BEFB6D]">IMEI</span>
          <br />
          <span className="text-[#BEFB6D]">Intelligence</span> in Real-Time
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/80 text-base sm:text-lg md:text-xl mb-8 md:mb-12"
        >
          Advanced AI-powered diagnostics and blacklisting checks for secure{" "}
          <br className="hidden md:block" />
          device transactions and inventory management.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto mb-4 md:mb-6 relative"
        >
          {/* Decorative Rings */}
          <div className="absolute inset-0 -m-4 border-3 border-white/30 rounded-[40px] sm:rounded-full pointer-events-none" />
          <div className="absolute inset-0 -m-8 border-2 border-white/20 rounded-[50px] sm:rounded-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center bg-white/90 backdrop-blur-xl rounded-3xl sm:rounded-full p-2 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-white/40 relative z-10">
            <div className="flex items-center flex-1 w-full px-4 sm:px-5 gap-3 sm:gap-4">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />

              <input
                type="text"
                placeholder="Enter IMEI or Serial Number..."
                className="w-full bg-transparent outline-none text-gray-700 py-2 sm:py-3 placeholder:text-gray-400 text-sm sm:text-base"
              />

              {/* Camera Scanner Trigger */}
              <button
                onClick={handleScanClick}
                title="Scan IMEI"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors group cursor-pointer"
              >
                <QrCode className="w-5 h-5 text-gray-400 group-hover:text-[#84CC16]" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
            </div>

            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#84CC16] hover:bg text-white px-6 py-3 rounded-2xl sm:rounded-full font-semibold shadow-lg text-sm sm:text-base mt-2 sm:mt-0 cursor-pointer">
              Choose Service
              <ChevronDown size={18} />
            </button>
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-8 sm:mt-10 mb-8 md:mb-10"
        >
          {[
            "iPhone all in one / best fee",
            "Samsung full report / best before buy",
            "Mac full check / best before buy",
          ].map((tag, i) => (
            <button
              key={i}
              className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#84CC16]/30 text-white backdrop-blur-md border border-white/30 text-[10px] sm:text-sm transition cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button className="bg-[#A3E635] text-white px-8 sm:px-10 py-2.5 sm:py-3 rounded-full font-bold shadow-xl text-sm sm:text-base cursor-pointer">
            Free Checks
          </button>
        </motion.div>
      </div>
    </section>
  );
}
