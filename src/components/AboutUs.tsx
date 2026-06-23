import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

export default function AboutUs() {
  const features = [
    {
      number: "01",
      tag: "HIGH PERFORMANCE",
      title: "Distributed GPU Compute",
      desc: "Run AI workloads with globally distributed GPU infrastructure optimized for training and inference.",
      items: [
        "GPU-Accelerated Training",
        "Inference Optimization",
        "Global Availability",
      ],
    },
    {
      number: "02",
      tag: "DECENTRALIZED DESIGN",
      title: "Secure Network",
      desc: "No centralized bottlenecks. Workloads are distributed across a secure global network.",
      items: [
        "Zero Single Point Failure",
        "Peer-to-Peer Distribution",
        "Cryptographic Security",
      ],
    },
    {
      number: "03",
      tag: "EARN FROM COMPUTE",
      title: "Resource Monetization",
      desc: "Monetize unused GPU or CPU power by contributing resources to the network.",
      items: [
        "CPU/GPU Contribution",
        "Real-Time Rewards",
        "Passive Income Stream",
      ],
    },
    {
      number: "04",
      tag: "BUILDER FRIENDLY",
      title: "Developer-First Platform",
      desc: "Deploy AI apps, APIs, and agents with infrastructure designed for developers.",
      items: [
        "Intuitive API Design",
        "Multi-Agent Support",
        "API & App Deployment",
      ],
    },
  ];

  return (
    <section id="about" className="py-24 bg-white select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Top title area */}
        <div className="space-y-4 max-w-4xl" id="about-intro">
          <div className="inline-flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <span className="w-2.5 h-2.5 bg-brand-neon rounded-full" />
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-gray-500">
              FEATURES PREVIEW
            </span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-950 leading-tight"
          >
            Powering AI applications through{" "}
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-500 bg-clip-text text-transparent">
              distributed compute
            </span>
          </motion.h2>
        </div>

        {/* Dynamic Split Layout: Stats list and Parallax viewports */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {features.map((feat, idx) => (
            <motion.div
              key={feat.tag}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative overflow-hidden rounded-[24px] h-full"
            >
              {/* White Background Card (default state) */}
              <div className="absolute inset-0 bg-white transition-all duration-500 ease-out group-hover:scale-0 origin-center" />

              {/* Black Background Card (hover state) */}
              <div className="absolute inset-0 bg-slate-950 transition-all duration-500 ease-out scale-0 group-hover:scale-100 origin-center" />

              {/* Border */}
              <div className="absolute inset-0 border border-gray-200 group-hover:border-slate-800 transition-colors duration-500 rounded-[24px]" />

              {/* Content Container */}
              <div className="relative z-10 h-full p-6 md:p-8 flex flex-col justify-between">
                {/* Tag */}
                <div className="inline-flex items-center mb-4">
                  <span className="bg-brand-neon/20 text-gray-600 group-hover:text-brand-neon group-hover:bg-brand-neon/30 font-mono text-[8px] font-bold px-2 py-1 rounded border border-gray-200 group-hover:border-brand-neon/40 uppercase tracking-widest transition-all duration-500">
                    ■ {feat.tag}
                  </span>
                </div>

                {/* Large Number */}
                <div className="my-8">
                  <span className="font-display text-[120px] font-black text-gray-100 group-hover:text-gray-900 transition-colors duration-500 leading-none">
                    {feat.number}
                  </span>
                </div>

                {/* Title and Items */}
                <div className="space-y-3">
                  <h3 className="font-display text-lg font-black text-gray-950 group-hover:text-white transition-colors duration-500 tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors duration-500 leading-relaxed font-semibold">
                    {feat.desc}
                  </p>
                  <ul className="space-y-2 pt-2">
                    {feat.items.map((item, itemIdx) => (
                      <li
                        key={itemIdx}
                        className="font-mono text-[10px] font-semibold text-gray-600 group-hover:text-gray-300 transition-colors duration-500 flex items-start"
                      >
                        <span className="text-brand-neon mr-2 shrink-0">└</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
