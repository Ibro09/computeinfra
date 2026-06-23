import { Target, Zap, Handshake, Award } from "lucide-react";
import { motion } from "motion/react";

export default function BentoBenefits() {
  const benefits = [
    {
      title: "Strategy-Driven AI",
      desc: "We combine automation, AI systems, and smart workflows to build solutions aligned with your business goals.",
      icon: Target,
    },
    {
      title: "Built for Results",
      desc: "From workflow automation to AI integration, every system is built to improve efficiency and performance.",
      icon: Zap,
    },
    {
      title: "Collaborative Process",
      desc: "We work closely with clients at every step, ensuring transparency, feedback, and shared success.",
      icon: Handshake,
    },
    {
      title: "Consistent Excellence",
      desc: "Our team delivers reliable AI solutions across every touchpoint from automation to systems.",
      icon: Award,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="py-24 bg-white border-b border-gray-100 select-none overflow-hidden" id="benefits-section">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Header Title */}
        <div className="space-y-4 max-w-3xl" id="benefits-intro">
          <div className="inline-flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <span className="w-2.5 h-2.5 bg-brand-neon rounded-full" />
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-gray-500">WHY CHOOSE US</span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-gray-950">
            Help Businesses Scale With AI
          </h2>
        </div>

        {/* 4-Column Balanced Grid Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
        >
          {benefits.map((b, idx) => {
            const IconComponent = b.icon;
            return (
              <motion.div
                key={b.title}
                variants={itemVariants}
                className="relative p-8 rounded-[32px] border border-gray-100 bg-gray-50/20 hover:bg-white hover:border-gray-200 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between min-h-[260px] custom-grid"
              >
                {/* Floating graphic grids */}
                <div className="absolute top-4 right-4 text-gray-100 select-none font-mono text-[11px] opacity-10 group-hover:opacity-25 transition-opacity">
                  REF_ID: 00{idx + 1}
                </div>

                {/* Top: Icon in squircle */}
                <div className="w-14 h-14 bg-gray-950 rounded-2xl flex items-center justify-center text-brand-neon shadow-md group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Bottom: Text descriptors */}
                <div className="space-y-3 pt-6">
                  <h3 className="font-display text-lg font-black text-gray-950 tracking-tight">
                    {b.title}
                  </h3>
                  <p className="font-sans text-xs text-gray-500 font-semibold leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
