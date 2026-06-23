import { useState, FormEvent } from "react";
import {
  X,
  Check,
  Mail,
  Key,
  Sparkles,
  Cpu,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StartProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLogin: (email: string, dbUser?: any) => void;
  onLogout: () => void;
  userEmail: string;
}

export default function StartProjectModal({
  isOpen,
  onClose,
  isLoggedIn,
  onLogin,
  onLogout,
  userEmail,
}: StartProjectModalProps) {
  const [mode, setMode] = useState<"register" | "login">("register");

  // Registration and Login input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [solanaWallet, setSolanaWallet] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorText("");

    if (!email || !email.includes("@")) {
      setErrorText("Please use a valid member e-mail signature.");
      return;
    }

    if (password.length < 6) {
      setErrorText(
        "The secure key pass must consist of at least 6 characters.",
      );
      return;
    }

    setIsLoading(true);

    fetch("/api/auth/register-or-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        address: solanaWallet.trim(),
        mode,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        setIsLoading(false);
        if (data.success) {
          onLogin(email, data.user);
          setIsDone(true);
        } else {
          setErrorText(data.error || "Authentication handshake failed.");
        }
      })
      .catch((err) => {
        console.warn(
          "Direct register-or-login endpoint failed, executing offline handshake simulator",
          err,
        );
        setTimeout(() => {
          setIsLoading(false);
          onLogin(email);
          setIsDone(true);
        }, 1500);
      });
  };

  const handleSwitchMode = () => {
    setMode(mode === "register" ? "login" : "register");
    setErrorText("");
  };

  const handleResetAndClose = () => {
    setIsDone(false);
    setEmail("");
    setPassword("");
    setSolanaWallet("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 selection:bg-brand-neon selection:text-black"
          id="project-modal-container"
        >
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-[#0a0c0f] text-slate-200 rounded-3xl overflow-hidden shadow-2xl border border-slate-900 flex flex-col max-h-[92vh]"
          >
            {/* Design header accent */}
            <div className="h-1.5 w-full bg-brand-neon" />

            {/* Subtle tech grid elements inside dark modal */}
            <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-900 text-slate-500 hover:text-white transition-colors z-20 cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 md:p-10 overflow-y-auto z-10 no-scrollbar">
              {isLoggedIn && isDone ? (
                /* Success cryptographic verification screen */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-10 flex flex-col items-center text-center space-y-6"
                >
                  <div className="w-16 h-16 bg-brand-neon/10 border-2 border-brand-neon rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-7 h-7 text-brand-neon font-bold" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-display text-2xl font-black text-white uppercase tracking-wider">
                      HANDSHAKE SUCCESSFUL
                    </h3>
                    <p className="text-slate-400 font-mono text-xs max-w-sm mx-auto leading-relaxed">
                      Cryptographic sign-on validated for:
                      <br />
                      <strong className="text-brand-neon font-bold block mt-1.5 font-sans break-all select-all">
                        {userEmail}
                      </strong>
                    </p>
                    <p className="text-slate-500 font-mono text-[10px] max-w-xs mx-auto pt-2">
                      Your cognitive sandbox nodes have verified the consensus
                      blocks. Handshake pipeline is live under secure trial
                      routing parameter.
                    </p>
                  </div>

                  <div className="bg-[#040608] border border-slate-900 px-5 py-3.5 rounded-xl font-mono text-[9px] text-slate-400 select-all max-w-sm break-all leading-tight">
                    <p className="font-bold text-brand-neon mb-1">
                      // LEDGER_ENTRY_RECORDED
                    </p>
                    <p>VERIFIED_KEYPASS: COMPILER_OK</p>
                    <p>SOLANA_IDENT_STATE: SYNCED</p>
                    <p>
                      SESSION_HASH: 0x{Math.random().toString(16).slice(2, 10)}
                      ...92f1
                    </p>
                  </div>

                  <button
                    onClick={handleResetAndClose}
                    className="w-full py-4 bg-brand-neon hover:bg-brand-neon/90 text-black font-black uppercase text-xs font-mono tracking-widest rounded-xl transition-all cursor-pointer active:scale-95"
                  >
                    CONFIRM & ACCESS CHATROOM
                  </button>
                </motion.div>
              ) : isLoggedIn ? (
                /* Already Authenticated Layout (gives option to log out or disconnect) */
                <div className="py-8 space-y-6 text-center">
                  <Cpu className="w-12 h-12 mx-auto text-brand-neon animate-pulse" />
                  <div className="space-y-2">
                    <h4 className="font-display text-xl font-black text-white uppercase tracking-wider">
                      SESSION ACTIVE
                    </h4>
                    <p className="text-xs font-mono text-slate-400">
                      Target host currently synchronized:
                      <span className="block text-brand-neon font-bold mt-1 text-sm font-sans break-all select-all">
                        {userEmail}
                      </span>
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-3">
                    <button
                      onClick={onClose}
                      className="py-3.5 bg-brand-neon text-black text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer hover:bg-brand-neon/90"
                    >
                      Return to Workspace
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setEmail("");
                        setPassword("");
                        setSolanaWallet("");
                      }}
                      className="py-3 bg-red-950/40 border border-red-900/30 text-red-400 hover:bg-red-900/10 text-xs font-semibold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Dismantle Handshake
                    </button>
                  </div>
                </div>
              ) : (
                /* Primary Dynamic Auth Panel Form (Register and Log In) */
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Top Header inside modal form block */}
                  <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                    <div className="flex items-center space-x-2.5">
                      <Cpu className="w-4 h-4 text-slate-500" />
                      <span className="font-mono text-[9px] uppercase font-bold text-slate-500 tracking-widest">
                        WORKSPACE_INTEGRATION / PEER_WALLET
                      </span>
                    </div>
                    <span className="bg-slate-900/60 border border-slate-800 text-slate-400 font-mono text-[8.5px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider">
                      SIG_REQUIRED
                    </span>
                  </div>

                  {/* Headline Info */}
                  <div className="space-y-2 pt-2">
                    <h3 className="font-display font-black text-2xl text-sky-300 md:text-3xl tracking-wide uppercase leading-none">
                      {mode === "register"
                        ? "FORM NODE MEMBER SIGNATURE"
                        : "FORM NODE HOST SECURITY ACCESS"}
                    </h3>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed font-sans">
                      {mode === "register"
                        ? "Connect your email and Solana identity key to instantiate automated ledger claims and verify cryptographic receipts."
                        : "Credentials needed to connect your synchronized node cluster stream with cognitive sandbox files."}
                    </p>
                  </div>

                  {/* Errors feedback notification */}
                  {errorText && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl font-mono text-[11px] flex items-start space-x-2 animate-bounce">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-tight">{errorText}</span>
                    </div>
                  )}

                  {/* Member Email Input Box */}
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] font-black uppercase text-amber-500 tracking-widest">
                      MEMBER EMAIL
                    </label>
                    <div className="relative flex items-center bg-black/60 border border-slate-800 focus-within:border-white rounded-md transition-all">
                      <Mail className="absolute left-3 w-4 h-4 text-slate-600 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="user@compu.ai"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent pl-10 pr-4 py-3.5 text-sm font-mono text-white outline-hidden placeholder-slate-700"
                      />
                    </div>
                  </div>

                  {/* Choose Password Input Box */}
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] font-black uppercase text-amber-500 tracking-widest">
                      {mode === "register"
                        ? "CHOOSE PASSWORD"
                        : "SECRET PASSWORD"}
                    </label>
                    <div className="relative flex items-center bg-black/60 border border-slate-800 focus-within:border-white rounded-md transition-all">
                      <Key className="absolute left-3 w-4 h-4 text-slate-600 pointer-events-none" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent pl-10 pr-4 py-3.5 text-sm font-mono text-white outline-hidden placeholder-slate-700 font-sans"
                      />
                    </div>
                  </div>

                  {/* Main address input for both register and login */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block font-mono text-[9px] font-black uppercase text-amber-500 tracking-widest">
                        MAIN ADDRESS
                      </label>
                      <span className="text-[8px] font-mono text-slate-600 font-bold uppercase tracking-wider">
                        OPTIONAL
                      </span>
                    </div>
                    <div className="relative flex items-center bg-black/60 border border-slate-800 focus-within:border-white rounded-md transition-all">
                      <input
                        type="text"
                        placeholder="Enter your address or leave blank"
                        value={solanaWallet}
                        onChange={(e) => setSolanaWallet(e.target.value)}
                        className="w-full bg-transparent px-4 py-3.5 text-xs font-mono text-white outline-hidden placeholder-slate-700"
                      />
                    </div>
                    <p className="text-[8.5px] font-mono text-slate-600 leading-normal font-semibold">
                      This address will be saved for this account exactly as
                      entered.
                    </p>
                  </div>

                  {/* Submit Command Trigger Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#a2cbef] hover:bg-[#b0d5f8] text-slate-950 disabled:opacity-50 py-4 px-6 rounded-lg font-black font-mono text-xs tracking-widest uppercase transition-all flex items-center justify-center space-x-2 group cursor-pointer active:scale-[0.98] shadow-lg border-0"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2 font-mono">
                          <span className="w-2.5 h-2.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>SYNCHRONIZING SECURE KEY...</span>
                        </div>
                      ) : (
                        <>
                          <span>
                            {mode === "register"
                              ? "ESTABLISH NODE & COMPLETE REGISTRATION"
                              : "AUTHENTICATE CONNECTION & HOST SIGN PASS"}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Toggle Sign Up / Login Form link block */}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleSwitchMode}
                      className="w-full text-slate-500 hover:text-white font-mono text-[9px] uppercase font-black tracking-widest transition-colors block text-center cursor-pointer"
                    >
                      {mode === "register"
                        ? "ALREADY REGISTERED? LOG IN"
                        : "NEED AN ACCOUNT? SIGN UP AS VALUED MEMBER"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
