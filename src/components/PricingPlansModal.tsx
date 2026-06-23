import { useState } from "react";
import { X, Check, ArrowRight, Zap, Target, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PricingPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planName: string) => void;
}

export default function PricingPlansModal({ isOpen, onClose, onSelectPlan }: PricingPlansModalProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      name: "Pilot Starter",
      tagline: "For scaling teams starting with automated workflows.",
      price: billingPeriod === "monthly" ? 2450 : 1960,
      icon: Zap,
      features: [
        "2 custom automation routines",
        "Make / Zapier full deployment",
        "1 client-facing custom chatbot",
        "Standard vector db knowledge base",
        "Email & slack direct support",
        "Bi-weekly performance audit files",
      ],
      popular: false,
      cta: "Build Starter Pilot",
    },
    {
      name: "Neural Accelerator",
      tagline: "For firms fully standardizing client and data operations.",
      price: billingPeriod === "monthly" ? 4950 : 3960,
      icon: Target,
      features: [
        "Staggered multi-agent workflows",
        "Persistent custom vector dbs",
        "Interactive custom web AI platform",
        "Deeper systems sync (Salesforce, SQL)",
        "Dedicated workspace AI strategist",
        "Unlimited training and feedback loops",
        "24/7 client telemetry dashboards",
      ],
      popular: true,
      cta: "Integrate Accelerator Core",
    },
    {
      name: "Enterprise Cognitive",
      tagline: "Fully custom LLM fine-tuning, vector pipelines and agents.",
      price: "Custom",
      icon: ShieldCheck,
      features: [
        "Multi-model custom fine-tuning",
        "Robust enterprise database integration",
        "Dedicated on-prem agent deployment",
        "Strict SLA and latency guards",
        "Continuous feedback-driven optimization",
        "Sovereign cloud compute clusters",
        "Dedicated fulltime AI developer",
      ],
      popular: false,
      cta: "Contact Enterprise Dev",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto no-scrollbar" id="pricing-modal-wrapper">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-5xl bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col my-8 select-none"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors z-10 cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content Container */}
            <div className="p-6 md:p-10 space-y-8 overflow-y-auto no-scrollbar max-h-[85vh]">
              {/* Header text */}
              <div className="text-center space-y-3 max-w-xl mx-auto">
                <span className="font-mono text-xs font-bold tracking-wider uppercase text-brand-neon px-3 py-1 bg-brand-neon/10 rounded-full">
                  Fully Transparent AI Integration
                </span>
                <h3 className="font-display text-3xl font-bold tracking-tight">
                  Transparent Pricing Plans
                </h3>
                <p className="text-sm text-slate-400">
                  Fixed pricing for premium, custom-coded AI automation, web applications, and agent frameworks. Cancel or scale anytime.
                </p>

                {/* Billing Period Selector */}
                <div className="pt-2 flex justify-center">
                  <div className="bg-slate-800 p-1 rounded-full grid grid-cols-2 gap-1 w-64 border border-slate-700/50">
                    <button
                      onClick={() => setBillingPeriod("monthly")}
                      className={`py-1.5 text-xs font-semibold rounded-full tracking-wide transition-all cursor-pointer ${
                        billingPeriod === "monthly"
                          ? "bg-brand-neon text-black font-bold shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Monthly Billing
                    </button>
                    <button
                      onClick={() => setBillingPeriod("annual")}
                      className={`py-1.5 text-xs font-semibold rounded-full tracking-wide transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                        billingPeriod === "annual"
                          ? "bg-brand-neon text-black font-bold shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>Annual</span>
                      <span className="bg-black/25 text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white uppercase animate-pulse">
                        -20%
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tiers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {plans.map((plan) => {
                  const Icon = plan.icon;
                  return (
                    <div
                      key={plan.name}
                      className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 border ${
                        plan.popular
                          ? "bg-slate-800/80 border-brand-neon/40 shadow-[0_0_20px_rgba(127,255,0,0.1)] scale-[1.02]"
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {/* Popular tag */}
                      {plan.popular && (
                        <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-neon text-black font-mono text-[9px] font-bold px-3 py-1 rounded-full tracking-wide uppercase shadow-md">
                          Most Requested Solution
                        </span>
                      )}

                      {/* Header */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-display text-lg font-bold text-white tracking-tight">
                            {plan.name}
                          </h4>
                          <span className={`p-2 rounded-lg ${plan.popular ? "bg-brand-neon/15 text-brand-neon" : "bg-slate-800 text-slate-300"}`}>
                            <Icon className="w-5 h-5" />
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed min-h-[32px]">
                          {plan.tagline}
                        </p>

                        {/* Price */}
                        <div className="py-2 border-b border-slate-800/80 flex items-baseline">
                          {typeof plan.price === "number" ? (
                            <>
                              <span className="font-display text-3xl font-bold tracking-tight text-white">
                                ${plan.price.toLocaleString()}
                              </span>
                              <span className="text-xs text-slate-400 font-mono ml-2">
                                / month
                              </span>
                            </>
                          ) : (
                            <span className="font-display text-3xl font-bold tracking-tight text-white">
                              {plan.price}
                            </span>
                          )}
                        </div>

                        {/* Feature lists */}
                        <ul className="space-y-2.5 pt-2">
                          {plan.features.map((feat) => (
                            <li key={feat} className="flex items-start space-x-2 text-xs text-slate-300">
                              <Check className="w-3.5 h-3.5 text-brand-neon shrink-0 mt-0.5" />
                              <span className="leading-tight">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action */}
                      <div className="pt-6">
                        <button
                          onClick={() => {
                            onSelectPlan(plan.name);
                            onClose();
                          }}
                          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                            plan.popular
                              ? "bg-brand-neon text-black hover:bg-brand-neon-dark font-bold hover:shadow-md"
                              : "bg-slate-800 text-white hover:bg-slate-700"
                          }`}
                        >
                          <span>{plan.cta}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom FAQ tag */}
              <div className="text-center font-mono text-[10px] text-slate-500 py-2 border-t border-slate-800/80">
                SYSTEM_VERIFICATION: 256_BIT_SSL_COGNITIVE_SECURE // NO INTEGRATION LOCKINS // SHIPPED IN WEEKS OR PRO-RATED
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
