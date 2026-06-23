import { useState, useEffect, useRef, FormEvent } from "react";
import {
  Cpu,
  Laptop,
  ArrowRight,
  Shield,
  Send,
  Play,
  Square,
  Sparkles,
  Command,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ServicesProps {
  onStartProject: () => void;
  isLoggedIn: boolean;
  userEmail: string;
  onLogout: () => void;
}

interface Message {
  id: string;
  sender: "node" | "user" | "system";
  nodeId?: string;
  time: string;
  text: string;
  latency?: string;
  gas?: string;
  hash?: string;
}

export default function Services({
  onStartProject,
  isLoggedIn,
  userEmail,
  onLogout,
}: ServicesProps) {
  // Chat Widget State
  const [selectedModel, setSelectedModel] = useState("LLAMA-3");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "node",
      nodeId: "NODE_4E8B",
      time: "15:13:27",
      text: "Connection established with compute cluster pools. How can I help you today?",
      latency: "18ms",
      gas: "$0.0001",
      hash: "0x82f09ba...91a2",
    },
  ]);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Set real-time timestamps
  useEffect(() => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    setMessages((prev) =>
      prev.map((m) => (m.id === "init" ? { ...m, time: timeStr } : m)),
    );
  }, []);

  // // Scroll to bottom of chat
  // useEffect(() => {
  //   chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);

  // Monitor login changes to unlock interface and notify
  useEffect(() => {
    if (isLoggedIn) {
      setShowAuthWarning(false);
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      setMessages((prev) => {
        if (
          prev.some(
            (m) => m.text && m.text.includes("MEMBER_SESSION_ESTABLISHED"),
          )
        )
          return prev;
        return [
          ...prev,
          {
            id: Math.random().toString(),
            sender: "system",
            time: timeStr,
            text: `🔓 MEMBER_SESSION_ESTABLISHED: Host handshake verified for user (${userEmail}). Active thread synchronization initialized on peer slots.`,
          },
        ];
      });
    }
  }, [isLoggedIn, userEmail]);

  // Handle Model Selection
  const selectModel = (model: string) => {
    setSelectedModel(model);
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];

    if (isLoggedIn) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "system",
          time: timeStr,
          text: `Switching inference slot to ${model}_CLUSTER_POOL...`,
        },
        {
          id: Math.random().toString(),
          sender: "system",
          time: timeStr,
          text: `📡 ROUTING: Slot initialized under verified worker token (${userEmail}). Channel is SECURE. Ready for user payloads.`,
        },
      ]);
      setShowAuthWarning(false);
      return;
    }

    // Add system notification for logged out user
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: "system",
        time: timeStr,
        text: `Switching inference slot to ${model}_CLUSTER_POOL...`,
      },
      {
        id: Math.random().toString(),
        sender: "system",
        time: timeStr,
        text: `🔒 AUTH_LOCK: Active inference slots require node authentication. Establish host handshake to bypass restrictions.`,
      },
    ]);
    setShowAuthWarning(true);
    // Auto trigger sign-up modal
    setTimeout(() => {
      onStartProject();
    }, 1200);
  };

  // Handle Send Chat Message
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsgText = chatInput;
    setChatInput("");

    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];

    // Append user message
    const userMsgId = Math.random().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        time: timeStr,
        text: userMsgText,
      },
    ]);

    if (isLoggedIn) {
      // Simulated intelligent dynamic node response
      setTimeout(() => {
        let text = "";
        const lower = userMsgText.toLowerCase();
        if (
          lower.includes("hello") ||
          lower.includes("hi") ||
          lower.includes("hey")
        ) {
          text = `Handshake established. Welcome back, member ${userEmail}.\nAll cognitive shards are optimized under active ${selectedModel}. You are currently connected to SECURE_CLUSTER_B12 with full pipeline execution privileges.`;
        } else if (
          lower.includes("audit") ||
          lower.includes("code") ||
          lower.includes("build") ||
          lower.includes("construct") ||
          lower.includes("create")
        ) {
          text = `Analyzing deployment ledger... Handshake verified.\n[SUCCESS] Hot-WASM compilation succeeded with zero overhead. Verified sandboxed instructions on the peer mesh. Active thread count: 8 CPU threads.`;
        } else if (
          lower.includes("price") ||
          lower.includes("plan") ||
          lower.includes("cost") ||
          lower.includes("pricing")
        ) {
          text = `Routing pricing ledger details:\n- Standard slot: $0.0001 per million cycles\n- Real-time stream is currently optimized. Validator node fee waived under membership trial parameter.`;
        } else if (
          lower.includes("speed") ||
          lower.includes("latency") ||
          lower.includes("performance") ||
          lower.includes("solana")
        ) {
          text = `Network telemetry scan:\n- Node speed: 43.1 k_tok/sec\n- Execution slots active: 3/3\n- Current pipeline latency is 12ms. Consensus confidence level: 99.99%. Verified via cryptographic signature.`;
        } else {
          text = `Decentralized consensus payload executed successfully on slot ${selectedModel}.\n\nProcessed Member Task: "${userMsgText}"\nStatus: VERIFIED_OK\n\nReturning computed node output array. Active mesh state synced perfectly with decentralized ledger.`;
        }

        const replyTime = new Date().toTimeString().split(" ")[0];
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: "node",
            nodeId: "NODE_4E8B",
            time: replyTime,
            text: text,
            latency: `${Math.floor(Math.random() * 12) + 6}ms`,
            gas: `$0.000${Math.floor(Math.random() * 8) + 1}`,
            hash:
              "0x" +
              Math.random().toString(16).slice(2, 10) +
              "..." +
              Math.random().toString(16).slice(2, 6),
          },
        ]);
      }, 800);
      return;
    }

    // Delay lock and modal trigger for pristine pacing
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "system",
          time: timeStr,
          text: `⚠️ SECURE_SHARD: Authentication required. Please sign up or login to execute live inference payloads.`,
        },
      ]);
      setShowAuthWarning(true);
      onStartProject();
    }, 800);
  };

  return (
    <section
      id="services"
      className="py-24 bg-white border-b border-gray-100 select-none"
    >
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Section Heading */}
        <div
          className="text-center space-y-4 max-w-3xl mx-auto"
          id="services-intro"
        >
          <div className="inline-flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <span className="w-2.5 h-2.5 bg-brand-neon rounded-full animate-pulse" />
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-gray-500">
              THE SYSTEM STACK
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black tracking-tight text-gray-950">
            One Network, Two Layers
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed font-semibold max-w-2xl mx-auto">
            A unified AI infrastructure layer combining decentralized compute
            and edge runtime technology—built to power intelligent applications
            globally.
          </p>
        </div>

        {/* 2-Column Layers Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
          {/* LAYER 01: Core Service Card (Interactive Chat Interface) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex flex-col justify-between rounded-[32px] p-6 md:p-8 bg-white text-gray-950 border border-gray-150 group shadow-lg transition-all duration-300 min-h-[500px]"
          >
            {/* Header / Top level tag identifier */}
            <div className="space-y-4">
              <span className="bg-gray-100 text-gray-600 font-mono text-[9px] font-black px-3 py-1.5 rounded-sm uppercase tracking-widest inline-block border border-gray-200">
                ■ LAYER 01 // COGNITIVE SHARDS
              </span>

              {/* Chat Title & Tabs Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-150">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-gray-700">
                    AI_INFERENCE_STREAM
                  </span>
                </div>

                {/* Pool Status Tracker */}
                <div className="flex items-center space-x-1 text-gray-400 font-mono text-[9px]">
                  <span>⚙ Pool: SECURE_CLUSTER_B12</span>
                </div>
              </div>
            </div>

            {/* Chat Body Stream Message Container */}
            <div className="flex-1 my-4 bg-gray-50/50 rounded-2xl border border-gray-150 p-4 h-[280px] overflow-y-auto space-y-4 custom-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`space-y-1.5 ${msg.sender === "user" ? "text-right" : "text-left"}`}
                  >
                    {msg.sender === "node" && (
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-gray-400">
                        <span className="flex items-center space-x-1 text-neon-600">
                          <span>⚡ {msg.nodeId}</span>
                        </span>
                        <span>{msg.time}</span>
                      </div>
                    )}

                    {msg.sender === "user" && (
                      <div className="text-[10px] font-mono font-bold text-gray-400">
                        <span>/YOU</span>
                      </div>
                    )}

                    <div
                      className={`inline-block text-xs font-mono p-3 rounded-xl leading-relaxed max-w-[90%] whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "bg-emerald-500 text-white font-semibold rounded-tr-none text-left shadow-2xs"
                          : msg.sender === "system"
                            ? "bg-red-50 border border-red-200 text-red-600 text-[11px]"
                            : "bg-white border border-gray-150 text-gray-800 rounded-tl-none shadow-3xs"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {msg.sender === "node" && (
                      <div className="flex flex-wrap gap-x-3 text-[9px] font-mono text-gray-400">
                        <span>Latency: {msg.latency}</span>
                        <span>Gas: {msg.gas}</span>
                        <span>Hash: {msg.hash}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Warn overlay badge */}
            {showAuthWarning && (
              <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px] font-mono text-emerald-800 animate-fade-in">
                <span className="flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>
                    Session Locked. Secure handshake required to submit further
                    requests.
                  </span>
                </span>
                <button
                  onClick={onStartProject}
                  className="px-2.5 py-1 bg-black text-brand-neon font-bold uppercase text-[9px] rounded-lg cursor-pointer hover:bg-emerald-600 hover:text-white transition-colors shrink-0"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Chat Send Input Form */}
            <form onSubmit={handleSendMessage} className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[11px] text-gray-400">
                &gt;_
              </span>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setSetChatInputHelper(e.target.value)}
                placeholder="Instruct decentralized network pools..."
                className="w-full bg-white border border-gray-200 text-gray-800 pl-10 pr-12 py-3 text-xs font-mono rounded-xl focus:outline-hidden focus:border-emerald-500 placeholder-gray-400 transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-black text-brand-neon hover:text-white transition-all cursor-pointer border-none"
                aria-label="Submit instruction payload"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>

          {/* LAYER 02: Edge Runtime Card (Interactive WASM Simulator) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative flex flex-col justify-between rounded-[32px] p-6 md:p-8 bg-white text-gray-950 overflow-hidden border border-gray-150 group shadow-lg transition-all duration-300 min-h-[500px]"
            id="services-highlight-card"
          >
            {/* Background design accents */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

            {/* Top Segment */}
            <div className="relative z-10 space-y-4">
              <span className="bg-emerald-500 text-white font-bold font-mono text-[9.5px] px-3 py-1.5 rounded-full uppercase tracking-widest inline-block border border-emerald-400">
                ■ LAYER 02 // WASM COMPILATION
              </span>

              <div className="space-y-2">
                <h3 className="font-display text-2xl font-black text-gray-950 tracking-tight leading-tight">
                  Your browser is the compute engine.
                </h3>
                <p className="font-sans text-xs text-gray-500 leading-relaxed font-semibold">
                  Contribute browser-native cycle execution through highly
                  secure Assembly containers directly from your active browser
                  tab. No downloads, zero footprint.
                </p>
              </div>
            </div>

            {/* Interactive Local Node Preview Panel */}
            <div className="relative z-10 my-4 bg-gray-50/50 border border-gray-150 rounded-2xl p-4 space-y-4 flex-1 flex flex-col justify-between shadow-inner">
              {/* Header inside simulation */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                <span className="font-mono text-[9.5px] uppercase font-bold text-gray-400 tracking-wider">
                  Local Browser Sandbox Node State
                </span>
                <span className="flex items-center space-x-1.5 bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-3xs">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isLoggedIn ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`}
                  />
                  <span className="font-mono text-[8.5px] text-gray-500 uppercase font-bold">
                    {isLoggedIn ? "AUTHORIZED" : "UNAUTHORIZED"}
                  </span>
                </span>
              </div>

              {/* Hardware Spec Badges Grid */}
              <div className="grid grid-cols-2 gap-3 text-[10.5px] font-mono">
                <div className="bg-white border border-gray-150 p-2.5 rounded-xl shadow-2xs">
                  <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold">
                    WASM V8 Engine
                  </span>
                  <span
                    className={
                      isLoggedIn
                        ? "text-emerald-600 font-extrabold"
                        : "text-gray-500 font-black"
                    }
                  >
                    {isLoggedIn ? "Running (1.1.0)" : "Ready ⚡"}
                  </span>
                </div>
                <div className="bg-white border border-gray-150 p-2.5 rounded-xl shadow-2xs">
                  <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold">
                    Execution Cap
                  </span>
                  <span className="text-gray-600 font-black">
                    Unlimited Shards
                  </span>
                </div>
                <div className="bg-white border border-gray-150 p-2.5 rounded-xl shadow-2xs">
                  <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold">
                    Active Threading
                  </span>
                  <span className="text-emerald-600 font-black font-extrabold">
                    Multithread OK
                  </span>
                </div>
                <div className="bg-white border border-gray-150 p-2.5 rounded-xl shadow-2xs">
                  <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold">
                    Validator Consensus
                  </span>
                  <span className="text-neon-600 font-black font-extrabold">
                    {isLoggedIn ? "Syncing Blocks ✓" : "Peer Handshake"}
                  </span>
                </div>
              </div>

              {/* Live Status indicator text */}
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span className="flex items-center space-x-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isLoggedIn ? "bg-emerald-500" : "bg-gray-300"}`}
                  />
                  <span className="text-gray-500 font-semibold">
                    SESSION_STATE:{" "}
                    {isLoggedIn ? `CONNECTED (${userEmail})` : "UNREGISTERED"}
                  </span>
                </span>
                <span
                  className={
                    isLoggedIn ? "text-emerald-600 font-black" : "text-gray-400"
                  }
                >
                  {isLoggedIn ? "STATE_ONLINE" : "STATE_OFFLINE"}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="relative z-10 pt-2">
              <button
                onClick={isLoggedIn ? onLogout : onStartProject}
                className={`w-full py-3.5 text-xs font-bold font-mono uppercase tracking-wider rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-md active:scale-95 ${
                  isLoggedIn
                    ? "bg-white text-red-550 hover:bg-red-50 border border-red-200"
                    : "bg-black text-brand-neon hover:bg-gray-900"
                }`}
              >
                <span>
                  {isLoggedIn ? "Disconnect Sandbox Node" : "Deploy Local Node"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );

  // Simple state proxy helper to circumvent TypeScript warning or state mutation blocks
  function setSetChatInputHelper(value: string) {
    setChatInput(value);
  }
}
