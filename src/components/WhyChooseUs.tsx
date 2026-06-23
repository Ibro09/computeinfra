import { Check, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface WhyChooseUsProps {
  onStartProject: () => void;
}

export default function WhyChooseUs({ onStartProject }: WhyChooseUsProps) {
  const otherPoints = [
    "Centralized points of failure",
    "Intrusive telemetry & logging ID logging",
    "High entry-barrier pricing systems",
    "Opaque, vendor-locked computing patterns",
    "Monopolized compute network controls",
    "Unused local hardware remains idle",
  ];

  const computeInfraPoints = [
    "Decentralized network robustness",
    "Private-by-default secure computing",
    "Frictionless browser edge-native run",
    "Global low-latency distributed GPU grid",
    "Open-source developer-first API standard",
    "Contribute idle compute and earn yield",
  ];

  return (
    <section className="py-24 bg-white border-b border-gray-100 select-none overflow-hidden" id="comparison-section">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Title Heading */}
        <div className="text-center space-y-4 max-w-2xl mx-auto" id="comparison-intro">
          <div className="inline-flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <span className="w-2.5 h-2.5 bg-brand-neon rounded-full" />
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-gray-500">WHY COMPUTEINFRA</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-gray-950">
            Why Choose ComputeInfra
          </h2>
        </div>

        {/* Side by Side Comparative Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          
          {/* Card 1: Centralized Clouds */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[32px] border border-gray-150 p-8 md:p-10 bg-gray-50/50 space-y-8 select-none relative custom-grid opacity-85 hover:opacity-100 transition-opacity"
          >
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-black text-gray-400 tracking-tight flex items-center space-x-2 uppercase">
                <span>Legacy Providers</span>
              </h3>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                Centralized cloud giants with vertical constraints.
              </p>
            </div>

            {/* list items */}
            <ul className="space-y-4">
              {otherPoints.map((item) => (
                <li key={item} className="flex items-start space-x-3 text-xs text-gray-400">
                  <span className="p-0.5 rounded-full bg-gray-200 text-gray-400 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="leading-tight font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Card 2: ComputeInfra */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[32px] border-2 border-slate-900 p-8 md:p-10 bg-white space-y-8 select-none relative custom-grid shadow-xl animate-pulse-slow"
            id="computeinfra-highlight-comparison-card"
          >
            {/* Background design glow */}
            <div className="absolute top-4 right-4 text-brand-neon animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <span className="font-display text-2xl font-black text-slate-950 tracking-tight uppercase">
                  COMPUTEINFRA
                </span>
              </div>
              <p className="text-xs text-brand-neon-dark font-mono font-bold leading-relaxed uppercase">
                //DECENTRALIZED_AI_INFRA_GRID
              </p>
            </div>

            {/* list items */}
            <ul className="space-y-4">
              {computeInfraPoints.map((item) => (
                <li key={item} className="flex items-start space-x-3 text-xs text-slate-900 font-semibold group">
                  <span className="p-0.5 rounded-full bg-slate-950 text-brand-neon shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="leading-tight">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* CTA Get Started Bottom button */}
        <div className="text-center pt-4" id="comparison-cta">
          <button
            onClick={onStartProject}
            className="px-8 py-3.5 font-sans text-xs font-bold text-white tracking-wider rounded-full bg-gradient-to-r from-gray-950 to-gray-800 hover:from-black hover:to-gray-900 shadow-lg border border-gray-800 transition-all hover:scale-105 active:scale-95"
          >
            Authenticate Node
          </button>
        </div>

      </div>
    </section>
  );
}
