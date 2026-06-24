import { useState, FormEvent } from "react";
import {
  X,
  Mail,
  Key,
  Sparkles,
  Cpu,
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
      setErrorText("Password must be at least 6 characters.");
      return;
    }

    if (mode === "register" && !solanaWallet.trim()) {
      setErrorText("Wallet address is required.");
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
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        console.log("Authentication  passed" );
        setIsLoading(false);

        if (r.ok && data.success) {
          onLogin(email, data.user);
          setIsDone(true);
        } else {
          setErrorText(data.error || "Authentication failed.");
        }
      })
      .catch(() => {
        console.log("Error during authentication request.");
        setIsLoading(false);
        setErrorText("An error occurred. Please try again.");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-2xl bg-[#f9f9f7] text-black rounded-[32px] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.15)] border border-[#dcdcdc] flex flex-col max-h-[92vh]"
          >
            <div
              className="absolute inset-0 opacity-50 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full border border-[#dcdcdc] bg-white hover:bg-gray-100 text-gray-500 hover:text-black transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-4 md:p-6 overflow-y-auto z-10 no-scrollbar">              {isLoggedIn && isDone ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-10 flex flex-col items-center text-center space-y-6"
                >
                  <div className="w-16 h-16 bg-lime-100 border-2 border-lime-400 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-7 h-7 text-lime-500 font-bold" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-black uppercase tracking-wider">
                      HANDSHAKE SUCCESSFUL
                    </h3>

                    <p className="text-gray-500 text-xs max-w-sm mx-auto leading-relaxed">
                      Authentication successful for:
                      <br />
                      <strong className="text-lime-500 block mt-2 break-all">
                        {userEmail}
                      </strong>
                    </p>
                  </div>

                  <button
                    onClick={handleResetAndClose}
                    className="w-full py-4 bg-black hover:bg-black/90 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all"
                  >
                    CONFIRM & ACCESS CHATROOM
                  </button>
                </motion.div>
              ) : isLoggedIn ? (
                <div className="py-8 space-y-6 text-center">
                  <Cpu className="w-12 h-12 mx-auto text-lime-500 animate-pulse" />

                  <div className="space-y-2">
                    <h4 className="text-xl font-black uppercase tracking-wider">
                      SESSION ACTIVE
                    </h4>

                    <p className="text-xs text-gray-500">
                      Connected account:
                      <span className="block text-lime-500 font-bold mt-1 text-sm break-all">
                        {userEmail}
                      </span>
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-3">
                    <button
                      onClick={onClose}
                      className="py-3.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
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
                      className="py-3 border border-red-300 text-red-500 hover:bg-red-50 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (                <form
                  onSubmit={handleSubmit}
                  className="relative space-y-6 bg-white border border-[#dcdcdc] rounded-3xl p-8 md:p-10 overflow-hidden shadow-xl"
                >
                  <div className="absolute top-6 left-6 w-4 h-4 bg-[#7CFC00] rounded-sm" />
                  <div className="absolute top-11 left-6 w-4 h-4 bg-[#7CFC00] rounded-sm" />
                  <div className="absolute bottom-6 right-6 w-4 h-4 bg-[#7CFC00] rounded-sm" />

                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between border-b border-[#dcdcdc] pb-4">
                      <div className="flex items-center space-x-2.5">
                        <Cpu className="w-4 h-4 text-gray-500" />
                        <span className="font-mono text-[9px] uppercase font-bold text-gray-500 tracking-widest">
                          {mode === "register"
                            ? "CREATE ACCOUNT / SIGN UP"
                            : "ACCOUNT ACCESS / LOG IN"}
                        </span>
                      </div>

                      <span className="font-mono text-[8.5px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-[#dcdcdc] bg-black text-white">
                        {mode === "register" ? "SIGN UP" : "LOG IN"}
                      </span>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h3 className="font-black text-2xl md:text-3xl tracking-wide uppercase leading-none text-black">
                        {mode === "register"
                          ? "CREATE YOUR ACCOUNT"
                          : "LOG IN TO YOUR ACCOUNT"}
                      </h3>

                      <p className="text-gray-500 text-xs leading-relaxed">
                        {mode === "register"
                          ? "Register with your email, password, and wallet address."
                          : "Enter your credentials to access your account."}
                      </p>
                    </div>

                    {errorText && (
                      <div className="bg-red-50 border border-red-300 text-red-500 p-3.5 rounded-xl text-[11px]">
                        {errorText}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-widest">
                        EMAIL
                      </label>
                      <div className="relative flex items-center border border-[#dcdcdc] rounded-xl">
                        <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          required
                          placeholder="user@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent pl-10 pr-4 py-4 text-sm text-black outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-widest">
                        PASSWORD
                      </label>
                      <div className="relative flex items-center border border-[#dcdcdc] rounded-xl">
                        <Key className="absolute left-3 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-transparent pl-10 pr-4 py-4 text-sm text-black outline-none"
                        />
                      </div>
                    </div>

                    {mode === "register" && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-widest">
                            WALLET ADDRESS
                          </label>
                          <span className="text-[8px] text-[#7CFC00] font-bold uppercase">
                            REQUIRED
                          </span>
                        </div>

                        <input
                          type="text"
                          required
                          placeholder="Enter wallet address"
                          value={solanaWallet}
                          onChange={(e) => setSolanaWallet(e.target.value)}
                          className="w-full px-4 py-4 border border-[#dcdcdc] rounded-xl text-sm text-black outline-none"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-black hover:bg-[#111] text-white py-4 rounded-full font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        "PROCESSING..."
                      ) : (
                        <>
                          <span>
                            {mode === "register"
                              ? "CREATE ACCOUNT"
                              : "LOG IN"}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSwitchMode}
                      className="w-full text-gray-500 hover:text-black text-[11px] uppercase font-bold tracking-widest"
                    >
                      {mode === "register"
                        ? "ALREADY HAVE AN ACCOUNT? LOG IN"
                        : "DON'T HAVE AN ACCOUNT? SIGN UP"}
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