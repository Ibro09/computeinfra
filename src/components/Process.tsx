import { Search, Compass, Cpu, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

interface ProcessProps {
  onStartProject: () => void;
}

export default function Process({ onStartProject }: ProcessProps) {
  return (
    <section
      id="process"
      className="py-24 bg-white border-b border-gray-100 select-none overflow-visible"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Responsive layout: Grid setup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative">
          
          {/* LEFT COLUMN: Pinned Sticky Segment */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 self-start flex flex-col justify-between space-y-8 lg:min-h-[70vh]">
            <div className="space-y-5">
              <div className="inline-flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <span className="w-2.5 h-2.5 bg-brand-neon rounded-full" />
                <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-gray-500">PROCESS</span>
              </div>

              <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-gray-950 leading-tight">
                Combine AI <br />With Automation
              </h2>

              <p className="font-sans text-sm text-gray-500 font-semibold leading-relaxed max-w-sm">
                Every step designed to improve workflows, efficiency. We build systems that replace manual tasks with immediate agent triggers.
              </p>
            </div>

            {/* Bottom sticky start project button matching image 6 */}
            <div className="pt-6" id="sticky-btn-section">
              <button
                onClick={onStartProject}
                className="pl-2 pr-8 py-2 bg-gray-900 border border-gray-800 text-white font-sans text-xs font-bold rounded-full flex items-center justify-between tracking-wide shadow-xl hover:bg-black group transition-all"
              >
                <span className="w-10 h-10 rounded-full bg-brand-neon text-black flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                  {/* Dynamic digital dots grid icon in green button badge */}
                  <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6" cy="12" r="2.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="6" r="1.5" />
                    <circle cx="12" cy="18" r="1.5" />
                    <circle cx="18" cy="12" r="1" />
                  </svg>
                </span>
                <span>Start a Project</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Sequential scrolling custom cards (Image 6, 7, 8) */}
          <div className="lg:col-span-7 space-y-16 pb-32">
            
            {/* Step 1 Card: Analyze & Discover */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="sticky top-[100px] md:top-[120px] bg-white rounded-[32px] border border-gray-150 p-8 md:p-10 space-y-8 shadow-[0_-12px_40px_rgba(0,0,0,0.04),0_20px_50px_rgba(0,0,0,0.05)] z-10 transition-all duration-300 hover:scale-[1.005] hover:shadow-[0_-12px_40px_rgba(0,0,0,0.06),0_25px_60px_rgba(0,0,0,0.08)]"
            >
              {/* High fidelity interactive graphical drawing: Labeled nodes + Magnifying Glass */}
              <div className="relative bg-white rounded-2xl p-8 border border-gray-100 min-h-[220px] flex items-center justify-center overflow-hidden custom-grid">
                
                {/* Graphics arrangement: Nodes layout */}
                <div className="space-y-4 w-full max-w-md select-none">
                  {/* Row 1 */}
                  <div className="flex justify-between items-center gap-4">
                    <div className="px-6 py-2.5 bg-gray-950 text-white rounded-lg font-mono text-[10px] font-bold tracking-wider uppercase border border-gray-800 shadow-sm">
                      Goals
                    </div>
                    <div className="px-6 py-2.5 bg-gray-50 text-gray-300 rounded-lg border border-gray-100 font-mono text-[10px]">
                      //PENDING
                    </div>
                  </div>
                  
                  {/* Row 2 */}
                  <div className="flex justify-center items-center gap-4">
                    <div className="px-6 py-2.5 bg-gray-950 border border-brand-neon-dark text-brand-neon rounded-lg font-mono text-[10px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(127,255,0,0.1)]">
                      Challenges
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="flex justify-between items-center gap-4">
                    <div className="px-6 py-2.5 bg-gray-100 text-gray-300 rounded-lg border border-gray-200/50 font-mono text-[10px]">
                      //SOURCE_DB
                    </div>
                    <div className="px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg font-mono text-[10px] tracking-wider">
                      Audiences
                    </div>
                  </div>
                </div>

                {/* Floating Vector Magnifying glass hovering over Audiences node */}
                <motion.div
                  animate={{ x: [0, 15, -10, 0], y: [0, -10, 15, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute right-12 bottom-4 bg-white/90 backdrop-blur-md p-4 rounded-full border border-gray-200/80 shadow-xl text-gray-900 flex items-center justify-center z-10"
                >
                  <Search className="w-10 h-10 text-gray-950 stroke-[2.5]" />
                  {/* Small neon cursor dot */}
                  <span className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-brand-neon-dark animate-ping" />
                </motion.div>
              </div>

              {/* Text Description Segment */}
              <div className="space-y-3">
                <div className="font-mono text-[10px] font-bold text-gray-400">
                  //01 ANALYZE & DISCOVER
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900 tracking-tight">
                  Analyze & Discover
                </h3>
                <p className="font-sans text-xs text-gray-500 font-semibold leading-relaxed">
                  We begin by understanding your workflows, business goals, and operational challenges to identify automation opportunities. We catalog manual bottlenecks that consume staff focus coordinates.
                </p>
              </div>
            </motion.div>

            {/* Step 2 Card: Plan & Strategy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="sticky top-[140px] md:top-[160px] bg-white rounded-[32px] border border-gray-150 p-8 md:p-10 space-y-8 shadow-[0_-12px_45px_rgba(0,0,0,0.05),0_25px_55px_rgba(0,0,0,0.06)] z-20 transition-all duration-300 hover:scale-[1.005] hover:shadow-[0_-12px_45px_rgba(0,0,0,0.07),0_30px_65px_rgba(0,0,0,0.09)]"
            >
              {/* Sitemap interactive flowchart graphic */}
              <div className="relative bg-white rounded-2xl p-8 border border-gray-100 min-h-[220px] flex items-center justify-center overflow-hidden custom-grid">
                
                {/* Connecting nodes drawing */}
                <div className="relative flex flex-col md:flex-row items-center gap-6 w-full max-w-md select-none">
                  {/* Anchor primary Node */}
                  <div className="p-4 bg-gray-950 border border-brand-neon-dark text-black rounded-lg min-w-[125px] flex items-center justify-center">
                    <span className="font-mono text-[9px] font-bold text-brand-neon tracking-wide">Onboarding screens</span>
                  </div>

                  {/* SVG connector arrow line */}
                  <div className="hidden md:block flex-grow border-t-2 border-dashed border-gray-200 relative h-1">
                    <span className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-brand-neon-dark animate-pulse" />
                  </div>

                  {/* Flow branch nodes */}
                  <div className="flex flex-col gap-3 min-w-[140px]">
                    <div className="px-4 py-2 bg-gray-50 border border-gray-150 text-gray-450 rounded-md font-mono text-[8px] text-center font-bold">
                      SYSTEM_BLUEPRINT_02
                    </div>
                    <div className="px-4 py-2 bg-gray-50 border border-gray-150 text-gray-450 rounded-md font-mono text-[8px] text-center font-bold">
                      SCHEMA_MAPPING
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 left-4 flex space-x-1.5">
                  <span className="w-1.5 h-1.5 bg-brand-neon rounded-full" />
                  <span className="font-mono text-[8px] text-gray-400">CONNECT_STATE: SECURE</span>
                </div>
              </div>

              {/* Text Description Segment */}
              <div className="space-y-3">
                <div className="font-mono text-[10px] font-bold text-gray-400">
                  //02 PLAN & STRATEGY
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900 tracking-tight">
                  Plan & Strategy
                </h3>
                <p className="font-sans text-xs text-gray-500 font-semibold leading-relaxed">
                  We define the right AI solutions, automation systems, and workflows tailored to your business needs. This creates a detailed schema diagram maps specifying exact triggers and payload patterns.
                </p>
              </div>
            </motion.div>

            {/* Step 3 Card: Build & Integrate */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="sticky top-[180px] md:top-[200px] bg-white rounded-[32px] border border-gray-150 p-8 md:p-10 space-y-8 shadow-[0_-12px_50px_rgba(0,0,0,0.06),0_30px_60px_rgba(0,0,0,0.07)] z-30 transition-all duration-300 hover:scale-[1.005] hover:shadow-[0_-12px_50px_rgba(0,0,0,0.08),0_35px_70px_rgba(0,0,0,0.1)]"
            >
              {/* Build UI frame console overlay with glowing neon Core bar */}
              <div className="relative bg-white rounded-2xl p-8 border border-gray-100 min-h-[220px] flex items-center justify-center overflow-hidden custom-grid">
                
                {/* Console wireframe mock drawing */}
                <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-2xl bg-gray-950 border border-gray-800 p-4 font-mono text-[8.5px] text-gray-400 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-500 font-bold flex items-center space-x-1">
                      <Cpu className="w-3.5 h-3.5 text-brand-neon shrink-0 animate-spin-slow" />
                      <span>COGNITIVE_NODE_A100</span>
                    </span>
                    <span className="text-[7.5px] bg-brand-neon text-black font-black px-1.5 py-0.5 rounded-sm">COMPILING</span>
                  </div>
                  
                  {/* Console line streams */}
                  <div className="space-y-1 select-none">
                    <p className="text-gray-300">$ tsc --build --verbose</p>
                    <p className="text-gray-500">Checking types.ts for shared models...</p>
                    <p className="text-brand-neon">&gt; Type compile: SUCCESS in 12ms</p>
                    <p className="text-gray-400">&gt; Payload map status: 200 OK</p>
                  </div>

                  {/* Highlight core neon bar representing Image 8 */}
                  <div className="h-2 w-full bg-brand-neon rounded-full overflow-hidden shadow-[0_0_10px_rgba(127,255,0,0.5)] relative">
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 w-1/3 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Text Description Segment */}
              <div className="space-y-3">
                <div className="font-mono text-[10px] font-bold text-gray-400">
                  //03 BUILD & INTEGRATE
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900 tracking-tight">
                  Build & Integrate
                </h3>
                <p className="font-sans text-xs text-gray-500 font-semibold leading-relaxed">
                  We develop AI-powered systems and integrate intelligent workflows designed for scalability and performance. Codebases undergo strict linting, type-safety assertions and structural latency benchmarking.
                </p>
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
}
