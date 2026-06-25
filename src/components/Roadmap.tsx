import { CheckCircle2, CircleDot, Rocket } from "lucide-react";
import { motion } from "motion/react";

const roadmapPhases = [
  {
    phase: "Phase 1",
    status: "Live Now",
    title: "ComputeInfra Core Network",
    icon: CheckCircle2,
    items: [
      "User accounts and wallet profile",
      "Browser compute node with daily reward logic",
      "AI inference chat workspace",
      "MongoDB-backed balances and transaction history",
      "Real withdrawal status tracking",
    ],
  },
  {
    phase: "Phase 2",
    status: "Growth Layer",
    title: "Community, Rewards, And Alerts",
    icon: CircleDot,
    items: [
      "Public leaderboard for top earners and active nodes",
      "Referral system with verified active-user rewards",
      "Notification system for earnings, withdrawals, and account alerts",
      "Partner integrations with AI, DePIN, and Web3 ecosystems",
    ],
  },
  {
    phase: "Phase 3",
    status: "Scale Layer",
    title: "Enterprise And Native Node Apps",
    icon: Rocket,
    items: [
      "Paid API access for developers",
      "Enterprise compute plans",
      "Premium AI inference tools",
      "Mobile app for tracking earnings and withdrawals",
      "Lightweight mobile node mode",
      "Desktop node app for stronger compute contribution",
      "GPU node client",
    ],
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="bg-white py-24 sm:py-28 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-gray-100 pb-10">
          <div className="max-w-3xl">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-teal-600">
              // PRODUCT_ROADMAP
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-none mt-3 uppercase">
              Network Expansion Plan
            </h2>
          </div>
          <p className="max-w-md text-sm text-gray-500 font-semibold leading-relaxed">
            A staged path from the current wallet, node, and AI workspace into
            a public compute economy with developer, enterprise, and native app
            layers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-10">
          {roadmapPhases.map((phase, index) => {
            const Icon = phase.icon;

            return (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="border border-gray-150 rounded-2xl bg-gray-50/40 p-6 flex flex-col min-h-[430px]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] text-gray-400 font-black uppercase tracking-widest">
                      {phase.phase}
                    </span>
                    <h3 className="font-sans text-xl font-black text-gray-950 mt-2 leading-tight">
                      {phase.title}
                    </h3>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-white border border-gray-150 flex items-center justify-center text-teal-600 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <span
                  className={`mt-5 w-fit text-[9px] font-mono font-black uppercase tracking-wider px-2 py-1 rounded border ${
                    index === 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : index === 1
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {phase.status}
                </span>

                <div className="mt-6 space-y-3">
                  {phase.items.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                      <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
