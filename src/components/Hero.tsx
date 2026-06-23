import { ChevronRight, ArrowRight, Play } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";

function AnimatedChevronTrack({
  direction,
  count = 25,
}: {
  direction: "left" | "right";
  count?: number;
}) {
  const chars = Array(count).fill(direction === "left" ? "«" : "»");
  return (
    <span className="inline-flex items-center space-x-0.5 font-mono text-[10px] md:text-[11px] tracking-normal select-none">
      {chars.map((char, index) => (
        <motion.span
          key={index}
          animate={{
            color: [
              "#7fff00", // light gray
              "#7fff00", // emerald/neon green
              "#b8e58a", // bright green
              "#ffffff", // back to light gray
            ],
            scale: [1, 1.25, 1.25, 1],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: (count - index) * 0.05, // waves from last (right-most) to first (left-most)
            ease: "easeInOut",
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

interface HeroProps {
  onStartProject: () => void;
  onViewPricing: () => void;
}

export default function Hero({ onStartProject, onViewPricing }: HeroProps) {
  // Use scroll position to drive discrete interactive items like background shift or arrow speed
  const { scrollY } = useScroll();
  const leftMove = useTransform(scrollY, [0, 800], [0, -100]);
  const rightMove = useTransform(scrollY, [0, 800], [0, 100]);
  const playRotate = useTransform(scrollY, [0, 1000], [0, 360]);

  const scrollToServices = () => {
    const element = document.querySelector("#services");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen pt-32 pb-20 flex flex-col justify-between overflow-hidden custom-grid bg-white select-none"
    >
      {/* Dynamic Pixel Clusters: Top-Left */}
      <div className="absolute top-24 left-0 w-64 h-64 pointer-events-none z-[-10] md:z-[10] flex flex-wrap gap-1 content-start">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 bg-brand-neon hover:bg-brand-neon-dark transition-colors duration-300 rounded-sm"
        />
        <div className="w-16 h-16 bg-white border border-gray-100 rounded-sm" />
        <motion.div
          animate={{ scale: [1, 0.9, 1] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="w-16 h-16 bg-brand-neon hover:bg-brand-neon-dark transition-colors duration-300 rounded-sm"
        />
        <div className="w-16 h-16 bg-brand-neon hover:bg-brand-neon-dark transition-colors duration-300 rounded-sm" />
        <div className="w-16 h-16 bg-transparent" />
        <motion.div
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="w-16 h-16 bg-brand-neon hover:bg-brand-neon-dark transition-colors duration-300 rounded-sm"
        />
        <div className="w-16 h-16 bg-transparent" />
        <div className="w-16 h-16 bg-transparent" />
        <div className="w-16 h-16 bg-brand-neon hover:bg-brand-neon-dark transition-colors duration-300 rounded-sm shrink-0" />
      </div>

      {/* Dynamic Pixel Clusters: Bottom-Right */}
      <div className="absolute bottom-24 right-0 w-64 h-64 pointer-events-none z-10 flex flex-wrap gap-1 items-end justify-end">
        <div className="w-16 h-16 bg-brand-neon hover:bg-brand-neon-dark transition-colors duration-300 rounded-sm" />
        <div className="w-16 h-16 bg-transparent" />
        <div className="w-16 h-16 bg-transparent" />
        <div className="w-16 h-16 bg-brand-neon hover:bg-brand-neon-dark transition-colors duration-300 rounded-sm" />
        <div className="w-16 h-16 bg-white border border-gray-100 rounded-sm" />
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 bg-brand-neon hover:bg-brand-neon-dark transition-colors duration-300 rounded-sm"
        />
        <div className="w-16 h-16 bg-transparent" />
        <div className="w-16 h-16 bg-brand-neon hover:bg-brand-neon-dark transition-colors duration-300 rounded-sm animate-pulse" />
        <div className="w-16 h-16 bg-brand-neon hover:bg-brand-neon-dark transition-colors duration-300 rounded-sm" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full flex-grow flex flex-col justify-center">
        {/* Horizontal Ribbon Arrow Guide (Top Scroll Track) */}
        <div className="w-full overflow-hidden py-3 border-y border-gray-100/80 mb-6 bg-white/50 relative">
          <motion.div
            style={{ x: leftMove }}
            className="flex items-center justify-end space-x-12 pr-12 font-mono text-[9px] font-bold tracking-widest text-gray-300 select-none uppercase"
          >
            <div className="flex items-center space-x-2">
              <span>SYSTEMS_INTEGRATOR_AGENT</span>{" "}
              <ChevronRight className="w-3 h-3 text-brand-neon-dark animate-ping" />
            </div>
            <AnimatedChevronTrack direction="left" count={30} />
            <span>HYPER_SCALAR_AUTOMATIONS</span>
            <AnimatedChevronTrack direction="left" count={30} />
          </motion.div>
        </div>

        {/* Eyebrow tag */}
        <div className="text-center space-y-2 mb-4">
          <div className="inline-flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <span className="w-2.5 h-2.5 bg-brand-neon rounded-full" />
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-gray-500">
              THE FUTURE OF AI INFRASTRUCTURE
            </span>
          </div>
        </div>

        {/* Massive Dynamic Hero Split Container */}
        <div className="relative py-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full max-w-6xl mx-auto my-auto">
          {/* LEFT: Build & Deploy */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full md:w-5/12 text-center md:text-right"
          >
            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-[80px] text-gray-950 tracking-tight leading-none uppercase">
              Build, Earn,{" "}
            </h1>
          </motion.div>

          {/* CENTRE: Play Semicircle Icon Button Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 200,
              delay: 0.2,
            }}
            className="relative z-20 shrink-0"
          >
            {/* The white rounded card envelope from Image 1 */}
            <div className="relative w-48 h-48 md:w-56 md:h-56 bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center hover:scale-105 transition-transform duration-300 animate-pulse">
              {/* Outer circular dotted tech guide */}
              <div className="absolute inset-4 rounded-full border border-dashed border-gray-200 animate-[spin_60s_linear_infinite]" />

              {/* Central Semicircular shapes - 3D feel fast-forward play graphic */}
              <div
                className="relative w-28 h-28 flex items-center justify-center group cursor-pointer"
                onClick={onStartProject}
              >
                {/* Custom Semicircle 1 */}
                <motion.div
                  style={{ rotate: playRotate }}
                  className="absolute left-8 w-10 h-20 bg-gray-900 rounded-l-full shadow-lg group-hover:bg-gradient-to-r group-hover:from-brand-neon hover:shadow-brand-neon/20 transition-all duration-300"
                />
                {/* Custom Semicircle 2 - larger */}
                <motion.div
                  style={{ rotate: playRotate }}
                  className="absolute left-[72px] w-14 h-28 bg-black rounded-r-full shadow-2xl group-hover:bg-gradient-to-l group-hover:from-gray-800 transition-all duration-300"
                />

                {/* Micro floating play icon inside */}
                <span className="absolute text-brand-neon animate-pulse pointer-events-none drop-shadow-lg scale-110 ml-5">
                  <Play className="w-5 h-5 fill-brand-neon stroke-none" />
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Scale AI */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="w-full md:w-5/12 text-center md:text-left"
          >
            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-[80px] text-gray-950 tracking-tight leading-none uppercase">
              and Scale With AI
            </h1>
          </motion.div>
        </div>

        {/* Horizontal Ribbon Arrow Guide (Bottom Scroll Track) */}
        <div className="w-full overflow-hidden py-3 border-y border-gray-100/80 mt-6 bg-white/50 relative">
          <motion.div
            style={{ x: rightMove }}
            className="flex items-center justify-start space-x-12 pl-12 font-mono text-[9px] font-bold tracking-widest text-gray-300 select-none uppercase animate-fade-in"
          >
            <span>COGNITIVE_WORKFLOW_SYSTEMS</span>
            <AnimatedChevronTrack direction="right" count={30} />
            <span>MULTI_AGENT_DECISION_ENGINE</span>
            <AnimatedChevronTrack direction="right" count={30} />
          </motion.div>
        </div>

        {/* Under Hero Descriptive Slogan and CTAs */}
        <div className="mt-14 max-w-2xl mx-auto text-center space-y-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-sans text-sm text-gray-600 leading-relaxed font-semibold md:px-6 space-y-3"
          >
            <p className="text-base text-gray-800">
              ComputeInfra is a decentralized AI infrastructure layer powering
              intelligent applications through distributed compute and
              browser-native runtime execution.
            </p>
            <p className="text-[13px] text-gray-500 font-medium">
              Train models, run inference, generate content, and earn from
              unused compute resources—all in one network.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2"
          >
            {/* Start Building Action */}
            <button
              onClick={onStartProject}
              className="w-full sm:w-48 h-12 font-sans text-xs font-bold text-white bg-slate-950 border border-slate-950 hover:bg-white hover:text-slate-950 rounded-full shadow-lg transition-all duration-300 cursor-pointer active:scale-95 text-center flex items-center justify-center space-x-2 group"
            >
              <span>Start Building</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-neon group-hover:text-slate-950 transition-colors duration-300 animate-pulse" />
            </button>

            {/* Run a Node Action */}
            <button
              onClick={() => {
                const element = document.querySelector("#works");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="relative overflow-hidden w-full sm:w-48 h-12 bg-white border border-gray-200 text-gray-900 font-sans text-xs font-bold rounded-full flex items-center shadow-xs hover:border-gray-350 group transition-all duration-300 cursor-pointer active:scale-95"
            >
              {/* Expanding green background */}
              <div className="absolute left-1 top-1 bottom-1 w-10 group-hover:w-[calc(100%-8px)] bg-brand-neon rounded-full transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-0" />

              {/* Left Arrow Container */}
              <div className="absolute left-3.5 z-10 flex items-center justify-center text-black transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) group-hover:opacity-0 group-hover:scale-0 group-hover:-translate-x-4 pointer-events-none">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>

              {/* Right Arrow Container (revealed on hover) */}
              <div className="absolute right-3.5 z-10 flex items-center justify-center text-black opacity-0 scale-0 translate-x-4 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 pointer-events-none">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>

              {/* Button text */}
              <span className="relative z-10 ml-14 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) text-slate-900 group-hover:text-black font-bold">
                Run a Node
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Floating Scroll Indicator Hint */}
      <div className="text-center pt-8 z-10 w-full" id="scroll-prompt">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex flex-col items-center space-y-1 text-[9px] font-mono tracking-widest text-gray-400 select-none cursor-pointer"
          onClick={scrollToServices}
        >
          <span>SCROLL_TO_REVEAL</span>
          <ChevronRight className="w-3.5 h-3.5 rotate-90 text-brand-neon-dark" />
        </motion.div>
      </div>
    </section>
  );
}
