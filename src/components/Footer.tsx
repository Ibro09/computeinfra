import { useState, useEffect, FormEvent } from "react";
import { ArrowUp, Play, Sparkles, Command, Check } from "lucide-react";
import { motion } from "motion/react";

interface FooterProps {
  onStartProject: () => void;
  onSwitchView?: (view: "landing" | "chat" | "browser") => void;
}

export default function Footer({ onStartProject, onSwitchView }: FooterProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [formAlert, setFormAlert] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormAlert("SYSTEM: MESSAGE_DISPATCHED_TO_AGENIO_CORE");
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setFormAlert(null), 4000);
  };

  const scrollToTop = () => {
    if (onSwitchView) onSwitchView("landing");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <footer id="contact" className="bg-white select-none relative pt-20">
      {/* Visual Ticker Heading Segment from Image 12 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 pb-12 sm:pb-16">
        {/* Symmetric Tag Labels above giant heading */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-6 text-xs font-mono font-bold tracking-wider text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-brand-neon-dark animate-ping" />
            <span>■ INTELLECTUAL AUTOMATION</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>■ GLOBAL SUPPORT</span>
            <span className="w-2 h-2 rounded-full bg-brand-neon-dark" />
          </div>
        </div>

        {/* Huge Slogan display */}
        <div className="text-center relative py-4 sm:py-6">
          <h2 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-[104px] font-black tracking-tightest text-gray-950 uppercase leading-none">
            Let's Build <br />
            Your AI System
          </h2>

          {/* Central play crescent logo element hovering inside */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-15 pointer-events-none group">
            <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 bg-white/20 border border-dashed border-gray-400 rounded-full flex items-center justify-center">
              <span className="text-slate-950 scale-110 sm:scale-125 lg:scale-150">
                <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-slate-950" />
              </span>
            </div>
          </div>
        </div>

        {/* Symmetrical Neon green block arrangements matching bottom of Image 12 */}
        <div className="w-full flex justify-center pt-4 sm:pt-6 px-1 sm:px-4">
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 items-end max-w-4xl w-full h-20 sm:h-24 lg:h-32 select-none pointer-events-none">
            {/* Left staggered block poles */}
            <div
              className="h-32 bg-brand-neon rounded-t-lg shadow-sm hover:scale-y-110 transition-transform origin-bottom"
              style={{ transitionDuration: "400ms" }}
            />
            <div
              className="h-24 bg-brand-neon rounded-t-lg shadow-sm hover:scale-y-110 transition-transform origin-bottom"
              style={{ transitionDuration: "450ms" }}
            />
            <div className="h-20 bg-brand-neon rounded-t-lg shadow-sm" />
            <div className="h-14 bg-brand-neon rounded-t-lg shadow-sm" />
            <div className="h-10 bg-brand-neon rounded-t-lg shadow-sm" />
            <div className="h-6 bg-brand-neon rounded-t-lg shadow-sm" />

            {/* Center Play Circle cutout block */}
            <div
              className="col-span-2 h-12 sm:h-14 lg:h-16 bg-white border border-gray-100/50 rounded-2xl flex items-center justify-center shadow-lg -translate-y-2 pointer-events-auto cursor-pointer active:scale-95"
              onClick={onStartProject}
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center">
                <div className="absolute left-3 w-3 h-6 bg-gray-900 rounded-l-full" />
                <div className="absolute left-[26px] w-4.5 h-9 bg-black rounded-r-full shadow-md" />
              </div>
            </div>

            {/* Right staggered block poles */}
            <div className="h-6 bg-brand-neon rounded-t-lg shadow-sm" />
            <div className="h-10 bg-brand-neon rounded-t-lg shadow-sm" />
            <div className="h-14 bg-brand-neon rounded-t-lg shadow-sm" />
            <div className="h-20 bg-brand-neon rounded-t-lg shadow-sm" />
            <div
              className="h-24 bg-brand-neon rounded-t-lg shadow-sm hover:scale-y-110 transition-transform origin-bottom"
              style={{ transitionDuration: "450ms" }}
            />
            <div
              className="h-32 bg-brand-neon rounded-t-lg shadow-sm hover:scale-y-110 transition-transform origin-bottom"
              style={{ transitionDuration: "400ms" }}
            />
          </div>
        </div>
      </div>

      {/* Deep dark slate floor layout */}
      <div
        className="bg-slate-950 text-white py-16 px-6 relative overflow-hidden"
        id="dark-floor"
      >
        {/* Subtle grid accent inside the dark floor */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-8 sm:gap-12 relative z-10 py-4 sm:py-6">
          {/* LEFT COLUMN: Brand with metadata and copyrights */}
          <div className="space-y-6">
            <h3 className="font-display text-lg sm:text-xl font-black tracking-[0.2em] text-white uppercase">
              COMPUTE INFRA
            </h3>

            <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500 leading-relaxed font-semibold">
              <p>DECENTRALIZED_INTELLIGENCE_PROTOCOL</p>
              <p>EST. 2026 // VERSION 1.1.0-INTELLIGENT</p>
            </div>

            <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500 font-black pt-4">
              &copy; 2026 NEURAL_NET. ALL RIGHTS RESERVED.
            </div>
          </div>

          {/* RIGHT COLUMN: Navigation Columns */}
          <div className="flex flex-wrap gap-x-8 sm:gap-x-12 lg:gap-x-16 gap-y-8 select-none">
            {/* Column 1 - NETWORK */}
            <div className="space-y-4 min-w-[100px]">
              <h4 className="font-mono text-[10px] font-black uppercase text-white tracking-widest">
                NETWORK
              </h4>
              <ul className="space-y-2 font-mono text-[11px] text-slate-500">
                <li>
                  <a
                    href="#works"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSwitchView) onSwitchView("browser");
                    }}
                    className="hover:text-white transition-colors block leading-none cursor-pointer"
                  >
                    browser
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSwitchView) onSwitchView("chat");
                    }}
                    className="hover:text-white transition-colors block leading-none cursor-pointer"
                  >
                    chat
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 - SOCIALS */}
            <div className="space-y-4 min-w-[100px]">
              <h4 className="font-mono text-[10px] font-black uppercase text-white tracking-widest">
                SOCIALS
              </h4>
              <ul className="space-y-2 font-mono text-[11px] uppercase text-slate-500">
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors block leading-none"
                  >
                    TWITTER
                  </a>
                </li>

                <li>
                  <a
                    href="https://telegram.org"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors block leading-none"
                  >
                    TELEGRAM
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Scroll to top action */}
          <button
            onClick={scrollToTop}
            className="p-3 bg-slate-900 hover:bg-white text-slate-400 hover:text-slate-950 rounded-full transition-all duration-300 shadow-xl cursor-pointer self-center md:self-start flex items-center justify-center border border-slate-800"
            aria-label="Scroll immediately to top of screen"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
