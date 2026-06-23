import { Dot } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function TickerBanners() {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Connect ticker direct rate speed offsets to viewports
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "end start"]
  });

  const speedMultiplierRight = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const speedMultiplierLeft = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const dotGroupIcon = (
    <span className="inline-flex items-center mx-12 text-brand-neon">
      {/* Dynamic 5-dot visual separator symbol */}
      <span className="grid grid-cols-3 gap-0.5">
        <span className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
        <span className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
        <span className="w-1.5 h-1.5 bg-gray-405 rounded-full" />
        <span className="w-1.5 h-1.5 bg-brand-neon-dark rounded-full" />
        <span className="w-1.5 h-1.5 bg-gray-950 rounded-full animate-ping" />
      </span>
    </span>
  );

  return (
    <section ref={scrollRef} className="py-12 bg-white border-b border-gray-100/60 overflow-hidden select-none" id="brand-ticker-ribbons">
      <div className="space-y-6">
        
        {/* Ribbon 1: Moving Right - DECENTRALIZED */}
        <div className="w-full overflow-hidden bg-gray-50/50 py-4 border-y border-gray-100 flex items-center relative">
          <motion.div
            style={{ x: speedMultiplierRight }}
            className="flex items-center whitespace-nowrap font-display text-5xl md:text-7xl font-black uppercase tracking-tightest leading-none"
          >
            {/* Repeated stream for seamlessness */}
            <span className="text-gray-950 flex items-center">
              DECENTRALIZED {dotGroupIcon}
            </span>
            <span className="text-transparent stroke-gray-300 stroke-2 style-outline flex items-center" style={{ WebkitTextStroke: "2px #e5e7eb" }}>
              DECENTRALIZED {dotGroupIcon}
            </span>
            <span className="text-gray-950 flex items-center">
              DECENTRALIZED {dotGroupIcon}
            </span>
            <span className="text-transparent stroke-gray-300 stroke-2 style-outline flex items-center" style={{ WebkitTextStroke: "2px #e5e7eb" }}>
              DECENTRALIZED {dotGroupIcon}
            </span>
            <span className="text-gray-950 flex items-center">
              DECENTRALIZED {dotGroupIcon}
            </span>
            <span className="text-transparent stroke-gray-300 stroke-2 style-outline flex items-center" style={{ WebkitTextStroke: "2px #e5e7eb" }}>
              DECENTRALIZED {dotGroupIcon}
            </span>
          </motion.div>
        </div>

        {/* Ribbon 2: Moving Left - COMPUTEINFRA */}
        <div className="w-full overflow-hidden bg-gray-50/50 py-4 border-b border-gray-100 flex items-center relative">
          <motion.div
            style={{ x: speedMultiplierLeft }}
            className="flex items-center whitespace-nowrap font-display text-5xl md:text-7xl font-black uppercase tracking-tightest leading-none"
          >
            {/* Repeated stream for seamlessness */}
            <span className="text-transparent stroke-gray-300 stroke-2 style-outline flex items-center" style={{ WebkitTextStroke: "2px #e5e7eb" }}>
              COMPUTEINFRA {dotGroupIcon}
            </span>
            <span className="text-gray-950 flex items-center">
              COMPUTEINFRA {dotGroupIcon}
            </span>
            <span className="text-transparent stroke-gray-300 stroke-2 style-outline flex items-center" style={{ WebkitTextStroke: "2px #e5e7eb" }}>
              COMPUTEINFRA {dotGroupIcon}
            </span>
            <span className="text-gray-950 flex items-center">
              COMPUTEINFRA {dotGroupIcon}
            </span>
            <span className="text-transparent stroke-gray-300 stroke-2 style-outline flex items-center" style={{ WebkitTextStroke: "2px #e5e7eb" }}>
              COMPUTEINFRA {dotGroupIcon}
            </span>
            <span className="text-gray-950 flex items-center">
              COMPUTEINFRA {dotGroupIcon}
            </span>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
