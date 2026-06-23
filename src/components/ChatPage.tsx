import { useState, useEffect, useRef, FormEvent } from "react";
import Markdown from "react-markdown";
import {
  Send,
  Trash2,
  Sliders,
  Activity,
  Check,
  Copy,
  ArrowLeft,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatPageProps {
  isLoggedIn: boolean;
  userEmail: string;
  onStartProject: () => void;
  onBackToLanding: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "node" | "system";
  nodeId?: string;
  time: string;
  text: string;
  latency?: string;
  gas?: string;
  hash?: string;
}

const preprocessMarkdownText = (text: string) => {
  if (!text) return "";

  // Strip obsolete decentralized headers
  let clean = text.replace(
    /####\s*DECENTRALIZED\s*INFRASTRUCTURE\s*ANSWER/gi,
    "",
  );
  clean = clean.replace(/####\s*DECENTRALIZED\s*INFRASTRUCTURE/gi, "");
  clean = clean.replace(
    /Query successfully pushed to the distributed shard cluster\./gi,
    "",
  );
  clean = clean.replace(/- \*\*Model Selected:\*\* \w+/gi, "");
  clean = clean.replace(/- \*\*Active Session:\*\* \w+/gi, "");
  clean = clean.replace(/- \*\*Consensus Attestation:\*\* \w+/gi, "");
  clean = clean.replace(
    /Your instruction: ".*" was successfully dispatched to \d+ decentralized CPU nodes\./gi,
    "",
  );
  clean = clean.replace(
    /All tensors calculated with perfect execution fidelity\./gi,
    "",
  );
  clean = clean.replace(
    /Let me know if you would like me to modify state parameters, audit anchor files, or analyze ledger weights!/gi,
    "",
  );

  const lines = clean.split("\n");
  const processedLines = lines.map((line) => {
    // Convert '-- ' custom bullets to standard '* ' markdown items
    if (line.trim().startsWith("-- ")) {
      const indentCount = line.length - line.trimStart().length;
      return " ".repeat(indentCount) + "* " + line.trim().substring(3);
    }
    return line;
  });

  return processedLines.join("\n").trim();
};

export default function ChatPage({
  isLoggedIn,
  userEmail,
  onStartProject,
  onBackToLanding,
}: ChatPageProps) {
  const [selectedModel, setSelectedModel] = useState("DEEPSEEK");
  const [chatInput, setChatInput] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "node",
      nodeId: "NODE_COGNITIVE_SHARD_A09",
      time: "10:42:01",
      text: "Initialization cycle completed. All decentralized pipeline execution registers are secure. Transmit a query or select an intelligence model to initiate the cognitive shard pipeline.",
      latency: "14ms",
      gas: "$0.0000",
      hash: "0xec29bb1a...ff3c",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Set real-time initial timestamps
  useEffect(() => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    setMessages((prev) =>
      prev.map((m) => (m.id === "init" ? { ...m, time: timeStr } : m)),
    );
  }, []);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Load chat history from server on mount and login status update
  useEffect(() => {
    if (isLoggedIn && userEmail) {
      fetch(`/api/user/chat/history?email=${encodeURIComponent(userEmail)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.chatHistory && data.chatHistory.length > 0) {
            setMessages(data.chatHistory);
          }
        })
        .catch((err) =>
          console.warn("Failed to retrieve chat history from server:", err),
        );
    }
  }, [isLoggedIn, userEmail]);

  useEffect(() => {
    if (isLoggedIn) {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      setMessages((prev) => {
        if (prev.some((m) => m.text.includes("UNBLOCKED_MEMBER_PIPELINE")))
          return prev;
        return [
          ...prev,
          {
            id: Math.random().toString(),
            sender: "system",
            time: timeStr,
            text: `🔓 UNBLOCKED_MEMBER_PIPELINE: Node authorized under signature identifier (${userEmail}). Unrestrained cognitive queries now active.`,
          },
        ];
      });
    }
  }, [isLoggedIn, userEmail]);

  const showChatError = (error: unknown) => {
    console.log("Chat error:", error);
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: "system",
        time: timeStr,
        text: "Unable to get message. Please try again later.",
      },
    ]);
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (!isLoggedIn) {
      onStartProject();
      return;
    }

    const userText = chatInput;
    setChatInput("");

    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];

    // Optimistically add user message in client UI
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: "user",
        time: timeStr,
        text: userText,
      },
    ]);

    setIsTyping(true);

    fetch("/api/user/chat/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        message: userText,
        model: selectedModel,
        temperature,
        maxTokens,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        setIsTyping(false);
        const nodeReply = data?.nodeMessage || data?.reply || data?.message;
        if (data.success) {
          const replyMessage =
            typeof nodeReply === "string"
              ? {
                  id: Math.random().toString(),
                  sender: "node" as const,
                  nodeId: `NODE_${selectedModel}_COGNITIVE_SHARD`,
                  time: new Date().toTimeString().split(" ")[0],
                  text: nodeReply,
                  latency: "14ms",
                  gas: "$0.0001",
                  hash: "0xec29bb1a...ff3c",
                }
              : nodeReply || {
                  id: Math.random().toString(),
                  sender: "node" as const,
                  nodeId: `NODE_${selectedModel}_COGNITIVE_SHARD`,
                  time: new Date().toTimeString().split(" ")[0],
                  text: "The shard returned a response, but it was not formatted as expected.",
                  latency: "14ms",
                  gas: "$0.0001",
                  hash: "0xec29bb1a...ff3c",
                };
          setMessages((prev) => [...prev, replyMessage]);
        } else {
          showChatError(data.error || "Malformed cluster handshake.");
        }
      })
      .catch((err) => {
        console.warn(
          "Direct respond endpoint failed, executing offline simulator fallback",
          err,
        );
        setTimeout(() => {
          setIsTyping(false);
          showChatError(err);
        }, 1000);
      });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (isLoggedIn && userEmail) {
      fetch("/api/user/chat/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.chatHistory) {
            setMessages(data.chatHistory);
          }
        })
        .catch((err) => {
          console.error(
            "Failed to sync cleared log with server, clearing locally",
            err,
          );
          const now = new Date();
          const timeStr = now.toTimeString().split(" ")[0];
          setMessages([
            {
              id: "init",
              sender: "node",
              nodeId: "NODE_COGNITIVE_SHARD_A09",
              time: timeStr,
              text: "Inference chat logs have been wiped. All node registers cleared successfully. Channel is ready for fresh payloads.",
              latency: "11ms",
              gas: "$0.0000",
              hash: "0xec29bb1a...ff3c",
            },
          ]);
        });
    } else {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      setMessages([
        {
          id: "init",
          sender: "node",
          nodeId: "NODE_COGNITIVE_SHARD_A09",
          time: timeStr,
          text: "Inference chat logs have been wiped. All node registers cleared successfully. Channel is ready for fresh payloads.",
          latency: "11ms",
          gas: "$0.0000",
          hash: "0xec29bb1a...ff3c",
        },
      ]);
    }
  };

  const samplePrompts = [
    {
      title: "Smart Contract Audit",
      text: "Audit my Anchor Rust contract for overflow hazards",
    },
    {
      title: "WebSocket Script",
      text: "Write a high-performance Python WebSocket inference publisher",
    },
    {
      title: "Price/Cycle Specs",
      text: "What is the token cost/latency overhead across different pools?",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-brand-light)] text-brand-dark flex flex-col pt-24 select-none pb-12 relative">
      {/* Grid Canvas Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-24 left-1/4 w-96 h-96 bg-brand-neon/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-24 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Wrapper */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-stretch my-4">
        {/* LEFT COLUMN: Controls & Models */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Back button and title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToLanding}
              className="p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-black rounded-xl transition-all cursor-pointer flex items-center justify-center group active:scale-95 shadow-xs"
              aria-label="Back to landing page"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <p className="font-mono text-[9px] text-brand-neon-dark uppercase font-black tracking-widest leading-none">
                // WORKSPACE_INTERFACE
              </p>
              <h2 className="font-display font-black text-xl text-gray-950 uppercase tracking-tight">
                AI COGNITIVE SHARDS
              </h2>
            </div>
          </div>

          {/* Model selector buttons */}
          <div className="bg-white border border-gray-150 p-5 rounded-2xl space-y-4 shadow-xs">
            <h3 className="font-mono text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2.5 flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-brand-neon-dark shrink-0 animate-pulse" />
              <span>INTEL_MODEL_CHANNELS</span>
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  id: "DEEPSEEK",
                  name: "DeepSeek-R1",
                  desc: "Decentralized analytical focus",
                  badge: "COGNITIVE",
                },
                {
                  id: "LLAMA-3",
                  name: "Llama 3 Instruct",
                  desc: "Systems alignment cluster",
                  badge: "INSTRUCT",
                },
                {
                  id: "QWEN-2.5",
                  name: "Qwen 2.5 Coder",
                  desc: "Language & logic engine",
                  badge: "CODER",
                },
              ].map((m) => {
                const active = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between items-start select-none ${
                      active
                        ? "bg-black border-black text-white shadow-md active:scale-[0.98]"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-full flex justify-between items-center">
                      <span className="font-mono text-xs font-black uppercase tracking-wide">
                        {m.name}
                      </span>
                      <span
                        className={`font-mono text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                          active
                            ? "bg-brand-neon text-black font-extrabold"
                            : "bg-gray-200 text-gray-600 font-bold"
                        }`}
                      >
                        {m.badge}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] mt-1 ${active ? "text-gray-400" : "text-gray-500 font-medium"}`}
                    >
                      {m.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders Parameter panel */}
          <div className="bg-white border border-gray-150 p-5 rounded-2xl space-y-4 shadow-xs">
            <h3 className="font-mono text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-gray-450" />
                <span>INFERENCE_PARAMETERS</span>
              </span>
            </h3>

            <div className="space-y-4">
              {/* Temperature slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-mono text-[10px]">
                  <span className="text-gray-500 uppercase tracking-wider">
                    TEMPERATURE / DIVERSITY
                  </span>
                  <span className="text-brand-neon-dark font-black">
                    {temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-brand-neon-dark bg-gray-100 rounded-lg appearance-none h-1 cursor-pointer"
                />
                <p className="text-[9px] text-gray-400 font-mono">
                  Lower is accurate, higher is creative and diverse.
                </p>
              </div>

              {/* Max tokens */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-mono text-[10px]">
                  <span className="text-gray-500 uppercase tracking-wider">
                    MAX_CYCLER_LIMIT (TOKENS)
                  </span>
                  <span className="text-brand-neon-dark font-black">
                    {maxTokens}
                  </span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="4096"
                  step="256"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full accent-brand-neon-dark bg-gray-100 rounded-lg appearance-none h-1 cursor-pointer"
                />
                <p className="text-[9px] text-gray-400 font-mono">
                  Allocation constraint per query thread.
                </p>
              </div>
            </div>
          </div>

          {/* Node Active State Badge Info */}
          <div className="bg-white border border-gray-150 p-4 rounded-xl flex items-center space-x-3 text-xs shadow-xs">
            <div
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                isLoggedIn
                  ? "bg-brand-neon/40"
                  : "bg-red-500/10 border border-red-200"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isLoggedIn ? "bg-brand-neon-dark animate-pulse" : "bg-red-500"
                }`}
              />
            </div>
            <div className="font-mono text-[10px] text-gray-600 leading-tight">
              <span className="block font-black uppercase text-gray-800 tracking-wide">
                SYSTEMSTATE:{" "}
                {isLoggedIn ? "MEMBER HANDSHAKE ACTIVE" : "Handshake Required"}
              </span>
              <span className="text-gray-400 block">
                {isLoggedIn
                  ? `MEMBER_SECURE_TOKEN: ${userEmail}`
                  : "Consensus channel restricted to passive diagnostics."}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Full Chat Sandbox Screen */}
        <div className="lg:col-span-8 bg-white border border-gray-150 rounded-[28px] overflow-hidden flex flex-col justify-between items-stretch min-h-[580px] shadow-sm relative">
          {/* Top Bar of Sandbox */}
          <div className="bg-gray-50 border-b border-gray-150 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2.5">
              <Activity className="w-4 h-4 text-brand-neon-dark shrink-0 animate-pulse" />
              <div className="font-mono text-[10px] leading-none">
                <span className="text-gray-900 block font-bold uppercase tracking-wider">
                  SECURE_INFERENCE_PIPELINE
                </span>
                <span className="text-gray-400 block mt-1">
                  EST. WEBSOCKET HANDSHAKE: LIVE // OK
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleClearChat}
                className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-500 hover:text-red-600 rounded-lg transition-all cursor-pointer flex items-center justify-center border border-gray-250 hover:border-red-200 text-[10px] font-mono font-bold tracking-wider uppercase shadow-2xs"
                title="Wipe output registers"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                <span>WIPE</span>
              </button>

              <span className="font-mono text-[10px] text-gray-400 hidden md:block select-none">
                | WebSocket:{" "}
                <strong className="text-brand-neon-dark">11ms</strong>
              </span>
            </div>
          </div>

          {/* Central message stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[480px] custom-scrollbar bg-[#fdfefe]">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col space-y-1.5 ${m.sender === "user" ? "items-end text-right" : "items-start text-left"}`}
                >
                  <div className="flex items-center space-x-2 text-[10.5px] font-mono text-gray-400 font-bold">
                    {m.sender === "node" ? (
                      <>
                        <span className="text-brand-neon-dark uppercase tracking-wider font-extrabold">
                          ⚡ {m.nodeId}
                        </span>
                        <span>•</span>
                        <span>{m.time}</span>
                      </>
                    ) : m.sender === "user" ? (
                      <>
                        <span className="text-gray-900 font-black uppercase tracking-wider">
                          /MEMBER
                        </span>
                        <span>•</span>
                        <span>{m.time}</span>
                      </>
                    ) : (
                      <span className="text-red-500 uppercase tracking-widest font-black">
                        {m.time}
                      </span>
                    )}
                  </div>

                  <div className="relative group max-w-xl">
                    {m.sender === "node" ? (
                      <div className="bg-gray-50/75 border border-gray-150 text-gray-800 rounded-2xl rounded-tl-none p-4 shadow-xs text-xs leading-relaxed text-left markdown-body prose prose-sm max-w-none">
                        <Markdown
                          components={{
                            h1: ({ ...props }) => (
                              <h1
                                className="text-base font-extrabold text-gray-950 uppercase tracking-tight mt-4 mb-2 pb-1 border-b border-gray-100 font-sans block"
                                {...props}
                              />
                            ),
                            h2: ({ ...props }) => (
                              <h2
                                className="text-sm font-black text-gray-900 uppercase tracking-wide mt-3.5 mb-1.5 font-sans block"
                                {...props}
                              />
                            ),
                            h3: ({ ...props }) => (
                              <h3
                                className="text-xs font-bold text-gray-800 uppercase tracking-wide mt-3 mb-1 font-sans block"
                                {...props}
                              />
                            ),
                            p: ({ ...props }) => (
                              <p
                                className="text-xs leading-relaxed text-gray-700 my-2 font-sans block"
                                {...props}
                              />
                            ),
                            strong: ({ ...props }) => (
                              <strong
                                className="font-extrabold text-black font-sans"
                                {...props}
                              />
                            ),
                            ul: ({ ...props }) => (
                              <ul
                                className="list-disc pl-5 my-2.5 space-y-1.5 text-xs text-gray-700 block list-outside"
                                {...props}
                              />
                            ),
                            ol: ({ ...props }) => (
                              <ol
                                className="list-decimal pl-5 my-2.5 space-y-1.5 text-xs text-gray-700 block list-outside"
                                {...props}
                              />
                            ),
                            li: ({ ...props }) => (
                              <li
                                className="text-xs leading-relaxed font-sans my-1 list-item"
                                {...props}
                              />
                            ),
                            code: ({ className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(
                                className || "",
                              );
                              const childStr = String(children).replace(
                                /\n$/,
                                "",
                              );
                              const isBlock = match || childStr.includes("\n");
                              return isBlock ? (
                                <pre className="bg-gray-950 text-neon-400 p-3.5 rounded-xl my-3 overflow-x-auto font-mono text-[10.5px] leading-relaxed select-text border border-gray-900 shadow-xs relative">
                                  <div className="absolute right-3 top-2 flex items-center space-x-1.5 text-gray-500 text-[8px] uppercase tracking-wider font-extrabold select-none">
                                    <span>{match ? match[1] : "code"}</span>
                                  </div>
                                  <code
                                    className="block select-text"
                                    {...props}
                                  >
                                    {childStr}
                                  </code>
                                </pre>
                              ) : (
                                <code
                                  className="bg-gray-100 border border-gray-200 text-neon-700 px-1.5 py-0.5 rounded font-mono text-[10.5px] font-bold"
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {preprocessMarkdownText(m.text)}
                        </Markdown>
                      </div>
                    ) : (
                      <div
                        className={`text-xs p-4 rounded-2xl whitespace-pre-wrap leading-relaxed text-left border ${
                          m.sender === "user"
                            ? "bg-black text-white border-black font-semibold rounded-tr-none shadow-xs font-sans"
                            : "bg-amber-500/5 border-amber-500/20 text-amber-700 font-mono font-bold rounded-lg"
                        }`}
                      >
                        {m.text}
                      </div>
                    )}

                    {/* Copy snippet helper for node answers */}
                    {m.sender === "node" && (
                      <button
                        onClick={() => copyToClipboard(m.text, m.id)}
                        className="absolute right-3 top-3 p-1.5 bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-all border border-gray-200 cursor-pointer shadow-2xs"
                        title="Copy outputs segment"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-brand-neon-dark" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {m.sender === "node" && (
                    <div className="flex flex-wrap gap-x-3 font-mono text-[9px] text-gray-400 pl-1">
                      <span>Latency: {m.latency}</span>
                      <span>Gas: {m.gas}</span>
                      <span>Hash: {m.hash}</span>
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col space-y-1.5 items-start pl-1"
                >
                  <span className="text-[10px] font-mono text-gray-400 uppercase font-black">
                    ⚡ Compiling decentralized tensors...
                  </span>
                  <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl rounded-tl-none flex items-center space-x-2.5 text-xs font-mono text-gray-500 shadow-2xs">
                    <Loader2 className="w-4 h-4 text-brand-neon-dark animate-spin" />
                    <span>
                      Inference active... Streams dispatched on the global
                      thread pools.
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Locked screen display cover for anonymous users */}
          {!isLoggedIn && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mb-4 text-amber-600 shadow-xs">
                <LockKeyhole className="w-6 h-6 animate-pulse" />
              </div>
              <p className="font-mono text-[10px] text-amber-600 uppercase font-black tracking-widest">
                // DECENTRALIZED_AUTH_REQUIRED
              </p>
              <h4 className="font-display font-black text-xl text-gray-950 uppercase tracking-tight max-w-sm mt-1">
                Inference Shards Shielded
              </h4>
              <p className="text-gray-550 text-xs font-semibold max-w-xs mx-auto mt-2 leading-relaxed">
                Automated Ledger validation prevents anonymous spam. Initialize
                a host handshake signature to execute unlimited model loops.
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={onStartProject}
                  className="px-6 py-3 bg-black hover:bg-gray-900 text-brand-neon font-black uppercase text-[10px] tracking-widest rounded-lg font-mono cursor-pointer transition-all active:scale-95 shadow-md"
                >
                  Sign Up & Authenticate
                </button>
                <button
                  onClick={onBackToLanding}
                  className="px-5 py-3 bg-white border border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider rounded-lg font-mono cursor-pointer hover:bg-gray-50 transition-all shadow-xs"
                >
                  Return to Landing
                </button>
              </div>
            </div>
          )}

          {/* Lower bottom input payload bar */}
          <div className="bg-gray-50 border-t border-gray-150 p-4 relative z-10">
            {isLoggedIn && (
              <div className="mb-3 flex flex-wrap gap-2">
                {samplePrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setChatInput(p.text)}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-950 rounded-lg text-[10px] font-mono border border-gray-200 transition-all text-left cursor-pointer shadow-2xs"
                  >
                    💡 {p.title}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={handleSendMessage}
              className="relative flex items-center"
            >
              <span className="absolute left-4 font-mono text-[11px] text-gray-400 font-black">
                &gt;_
              </span>
              <input
                type="text"
                disabled={!isLoggedIn}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  isLoggedIn
                    ? `Instruct decentralized ${selectedModel} slots...`
                    : "Handshake authentication required..."
                }
                className="w-full bg-white border border-gray-255 text-gray-800 pl-10 pr-16 py-4 text-xs font-mono rounded-xl focus:outline-hidden focus:border-brand-neon-dark placeholder-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
              />
              <button
                type="submit"
                disabled={!isLoggedIn || !chatInput.trim()}
                className="absolute right-3 p-2 bg-black hover:bg-gray-900 text-brand-neon hover:border-black border border-black rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                aria-label="Transmit inference stream"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
