import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  onStartProject: () => void;
  activeSection: string;
  currentView?: "landing" | "chat" | "browser" | "wallet";
  onSwitchView?: (view: "landing" | "chat" | "browser" | "wallet") => void;
  isLoggedIn: boolean;
  userEmail: string;
  cumulativeEarnings: number;
  walletBalance: number;
  globalJobsCompleted: number;
  globalTokensProcessed: number;
  onClaimEarnings: () => void;
  isNodeRunning?: boolean;
  onToggleNode?: () => void;
}

export default function Header({
  onStartProject,
  activeSection,
  currentView = "landing",
  onSwitchView,
  isLoggedIn,
  userEmail,
  cumulativeEarnings,
  walletBalance,
  globalJobsCompleted,
  globalTokensProcessed,
  onClaimEarnings,
  isNodeRunning = false,
  onToggleNode,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isDarkHeader = false;
  const isSolidHeader =
    currentView === "chat" ||
    currentView === "browser" ||
    currentView === "wallet" ||
    isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Overview", href: "#home", targetView: "landing" as const },
    { name: "Chat", href: "#services", targetView: "chat" as const },
    { name: "Browser", href: "#works", targetView: "browser" as const },
    ...(isLoggedIn
      ? [{ name: "Wallet", href: "#wallet", targetView: "wallet" as const }]
      : []),
  ];

  const handleLinkClick = (link: (typeof navLinks)[number]) => {
    setIsMobileMenuOpen(false);
    if (onSwitchView) {
      onSwitchView(link.targetView);
    }

    // If returning to landing, scroll to section
    if (link.targetView === "landing") {
      setTimeout(() => {
        const element = document.querySelector(link.href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (onSwitchView) {
      onSwitchView("landing");
    }
    setTimeout(() => {
      const element = document.querySelector(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isSolidHeader
          ? "bg-white/80 backdrop-blur-md border-b border-gray-150 py-3 shadow-xs"
          : "bg-transparent py-5"
      }`}
      id="main-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Logo */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("#home");
          }}
          className="flex items-center space-x-0.5 group"
          id="header-logo"
        >
          <span
            className={`font-display text-xl sm:text-2xl font-black tracking-tight transition-colors uppercase whitespace-nowrap ${
              isDarkHeader
                ? "text-white group-hover:text-brand-neon"
                : "text-gray-900 group-hover:text-brand-neon-dark"
            }`}
          >
            COMPUTEINFRA
          </span>
        </a>

        {/* Center Nav Link (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1" id="desktop-nav">
          {navLinks.map((link) => {
            const isLinkActive =
              (link.targetView === "landing" &&
                currentView === "landing" &&
                activeSection === link.href.substring(1)) ||
              (link.targetView === "chat" && currentView === "chat") ||
              (link.targetView === "browser" && currentView === "browser") ||
              (link.targetView === "wallet" && currentView === "wallet");

            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link);
                }}
                className={`relative px-4 py-2 font-mono text-xs font-semibold tracking-wider transition-all duration-200 ${
                  isDarkHeader
                    ? isLinkActive
                      ? "text-brand-neon border-b-2 border-brand-neon"
                      : "text-slate-400 hover:text-white"
                    : isLinkActive
                      ? "text-gray-900 border-b-2 border-brand-neon"
                      : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* Start a Project (Desktop) */}
        <div className="hidden md:flex items-center space-x-3" id="desktop-cta">
          {isLoggedIn && onSwitchView && (
            <button
              onClick={() => onSwitchView("wallet")}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-full font-mono text-xs font-bold tracking-tight transition-all active:scale-95 duration-250 cursor-pointer shadow-3xs hover:shadow-2xs ${
                currentView === "wallet"
                  ? "bg-black text-brand-neon border-black ring-2 ring-black"
                  : "bg-white hover:bg-gray-50 text-gray-800 hover:text-black border-gray-150 hover:border-gray-300"
              }`}
              title="Open Wallet Dashboard"
            >
              <Wallet
                className={`w-4 h-4 shrink-0 transition-transform duration-300 ${currentView === "wallet" ? "text-brand-neon animate-pulse scale-115" : "text-brand-neon-dark"}`}
              />
              <span>
                {walletBalance > 0
                  ? `$${walletBalance.toFixed(6)}`
                  : "$0.000000"}
              </span>
              {isNodeRunning && (
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-neon-dark opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-neon-dark"></span>
                </span>
              )}
            </button>
          )}

          <button
            onClick={onStartProject}
            className={`relative px-6 py-2.5 font-sans text-xs font-bold tracking-wide rounded-full overflow-hidden transition-all shadow-md group border active:scale-95 cursor-pointer ${
              isDarkHeader
                ? "bg-slate-900 text-brand-neon border-slate-800 hover:bg-slate-800"
                : "bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-black hover:to-gray-900 border-gray-800"
            }`}
          >
            <span className="relative z-10 flex items-center space-x-1">
              <span>{isLoggedIn ? "Access Console" : "Authenticate Node"}</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${isDarkHeader ? "bg-white" : "bg-brand-neon"}`}
            />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          className={`md:hidden p-2 focus:outline-hidden ${isDarkHeader ? "text-slate-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
          id="mobile-menu-toggle"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 animate-pulse" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`md:hidden overflow-hidden ${isDarkHeader ? "bg-[#0b0e14] border-b border-slate-900" : "bg-white border-b border-gray-100"}`}
          >
            <div className="px-4 py-5 sm:px-6 flex flex-col space-y-4">
              {navLinks.map((link) => {
                const isLinkActive =
                  (link.targetView === "landing" &&
                    currentView === "landing" &&
                    activeSection === link.href.substring(1)) ||
                  (link.targetView === "chat" && currentView === "chat") ||
                  (link.targetView === "browser" &&
                    currentView === "browser") ||
                  (link.targetView === "wallet" && currentView === "wallet");

                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(link);
                    }}
                    className={`font-mono text-sm font-semibold tracking-wider py-1 ${
                      isDarkHeader
                        ? isLinkActive
                          ? "text-brand-neon font-bold"
                          : "text-slate-400"
                        : isLinkActive
                          ? "text-brand-neon-dark font-bold"
                          : "text-gray-600"
                    }`}
                  >
                    {link.name}
                  </a>
                );
              })}
              {isLoggedIn && onSwitchView && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onSwitchView("wallet");
                  }}
                  className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-150 rounded-xl font-mono text-xs font-black text-gray-800 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-brand-neon-dark animate-pulse" />
                  <span>
                    Open Wallet (
                    {walletBalance > 0
                      ? `$${walletBalance.toFixed(6)}`
                      : "$0.000000"}
                    )
                  </span>
                </button>
              )}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onStartProject();
                }}
                className={`w-full py-3 rounded-xl font-sans text-sm font-bold flex items-center justify-center space-x-2 cursor-pointer ${
                  isDarkHeader
                    ? "bg-slate-900 text-brand-neon border border-slate-800"
                    : "bg-gray-900 text-white"
                }`}
              >
                <span>
                  {isLoggedIn ? "Access Console" : "Authenticate Node"}
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
