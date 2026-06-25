import { useState, useEffect, useRef } from "react";
import {
  Play,
  Square,
  Cpu,
  Coins,
  Activity,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Copy,
  Terminal,
  FileCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BrowserPageProps {
  isLoggedIn: boolean;
  userEmail: string;
  onStartProject: () => void;
  onBackToLanding: () => void;
  cumulativeEarnings: number;
  globalJobsCompleted: number;
  globalTokensProcessed: number;
  onUpdateEarnings: (
    addedYield: number,
    completedJob: number,
    addedTokens: number,
  ) => void;
  onClaimEarnings: () => void;
  userAddress: string;
  onPersistBalance: (
    nextEarnings: number,
    nextJobs: number,
    nextTokens: number,
    nextBalance: number,
  ) => void;
  isNodeRunning: boolean;
  setIsNodeRunning: (val: boolean) => void;
  walletBalance: number;
}

export default function BrowserPage({
  isLoggedIn,
  userEmail,
  onStartProject,
  onBackToLanding,
  cumulativeEarnings,
  globalJobsCompleted,
  globalTokensProcessed,
  onUpdateEarnings,
  onClaimEarnings,
  userAddress,
  onPersistBalance,
  isNodeRunning,
  setIsNodeRunning,
  walletBalance,
}: BrowserPageProps) {
  const isRunning = isNodeRunning;
  const setIsRunning = setIsNodeRunning;
  const [displayAddress, setDisplayAddress] = useState(userAddress);
  const [activeLogFilter, setActiveLogFilter] = useState<
    "all" | "wasm" | "network" | "ledger"
  >("all");
  const [claimLoading, setClaimLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Live accumulating node states
  const [stats, setStats] = useState({
    jobsCompleted: 0,
    tokensProcessed: 0,
    yieldEarnings: 0,
    speed: 0,
  });

  const [logs, setLogs] = useState<
    Array<{
      time: string;
      text: string;
      category: "wasm" | "network" | "ledger" | "system";
    }>
  >([
    {
      time: "10:48:02",
      text: "Decentralized consensus core initializing on WebAssembly sandbox client...",
      category: "system",
    },
    {
      time: "10:48:03",
      text: "Detecting localized multicore hyperthreading vectors...",
      category: "system",
    },
    {
      time: "10:48:04",
      text: "Standard slot waiting parameter established. Network is ready.",
      category: "system",
    },
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);
  const updateEarningsRef = useRef(onUpdateEarnings);

  useEffect(() => {
    updateEarningsRef.current = onUpdateEarnings;
  }, [onUpdateEarnings]);

  useEffect(() => {
    setDisplayAddress(userAddress || "");
  }, [userAddress]);

  // Sync real timestamps for initial mounts
  useEffect(() => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    setLogs((prev) =>
      prev.map((l, i) => {
        const offsetSec = i - 2;
        const t = new Date(now.getTime() + offsetSec * 1000);
        return { ...l, time: t.toTimeString().split(" ")[0] };
      }),
    );
  }, []);

  // Accumulate logs and statistics dynamically when running is active
  useEffect(() => {
    if (!isRunning) return;

    const logsTemplates = [
      {
        text: "Successfully downloaded model shard [c0a8] weights from Peer-ID 92f1",
        category: "network",
      },
      {
        text: "WASM thread pool v8 allocated: executed feed-forward calculation in 64ms",
        category: "wasm",
      },
      {
        text: "Mining cycle complete. Block consensus share registered on slot 820",
        category: "ledger",
      },
      {
        text: "Shard validated successfully. consensus score: 99.98% trust rating",
        category: "ledger",
      },
      {
        text: "Accepted incoming instruction payload [inference-text-generation]",
        category: "network",
      },
      {
        text: "Compiling micro-convolutions under WebAssembly pipeline #04",
        category: "wasm",
      },
      {
        text: "Sending cryptographic work proof and zero-knowledge evidence to peer-mesh",
        category: "ledger",
      },
      {
        text: "Allocated 128MB local V8 engine sandbox matrix caches",
        category: "wasm",
      },
    ];

    const earningIntervalMs = 20 * 60 * 1000;
    const minTaskDelayMs = (24 * 60 * 60 * 1000) / 5;
    const maxTaskDelayMs = (24 * 60 * 60 * 1000) / 3;
    const earningPerWindow = Number((5 / 72).toFixed(6));

    // Earnings accrue once per 20-minute window, targeting about $5 per full day.
    const statsTimer = setInterval(() => {
      const addedTokens = Math.floor(Math.random() * 12) + 1;
      const currentSpeed = Math.floor(Math.random() * 90) + 120;
      const addedYield = earningPerWindow;

      updateEarningsRef.current(addedYield, 0, addedTokens);

      setStats((prev) => {
        return {
          jobsCompleted: prev.jobsCompleted,
          tokensProcessed: prev.tokensProcessed + addedTokens,
          yieldEarnings: Number((prev.yieldEarnings + addedYield).toFixed(6)),
          speed: currentSpeed,
        };
      });
    }, earningIntervalMs);

    let taskTimer: ReturnType<typeof setTimeout>;

    const scheduleNextTask = () => {
      const delay =
        Math.random() * (maxTaskDelayMs - minTaskDelayMs) + minTaskDelayMs;

      taskTimer = setTimeout(() => {
        updateEarningsRef.current(0, 1, 0);
        setStats((prev) => ({
          ...prev,
          jobsCompleted: prev.jobsCompleted + 1,
        }));
        setLogs((prev) => [
          ...prev,
          {
            time: new Date().toTimeString().split(" ")[0],
            text: "Sparse compute task completed. Work proof accepted by peer-mesh.",
            category: "ledger" as const,
          },
        ].slice(-40));
        scheduleNextTask();
      }, delay);
    };

    scheduleNextTask();

    // Dynamic logging stream
    const logsTimer = setInterval(() => {
      const template =
        logsTemplates[Math.floor(Math.random() * logsTemplates.length)];
      const tStr = new Date().toTimeString().split(" ")[0];
      setLogs((prev) => {
        const withNew = [
          ...prev,
          {
            time: tStr,
            text: template.text,
            category: template.category as any,
          },
        ];
        // Clamp logs size
        return withNew.slice(-40);
      });
    }, 1800);

    return () => {
      clearInterval(statsTimer);
      clearInterval(logsTimer);
      clearTimeout(taskTimer);
    };
  }, [isRunning]);

  // // Terminal scroll handler
  // useEffect(() => {
  //   logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [logs]);

  // Running controller
  const handleToggleNode = () => {
    const tStr = new Date().toTimeString().split(" ")[0];
    if (!isRunning) {
      if (!isLoggedIn) {
        onStartProject();
        return;
      }
      setIsRunning(true);
      setLogs((prev) => [
        ...prev,
        {
          time: tStr,
          text: "🔓 Handshake Token authorized. Initiating peer blockchain connection...",
          category: "system",
        },
        {
          time: tStr,
          text: `🌱 Syncing client under registered member address (${userEmail})...`,
          category: "system",
        },
        {
          time: tStr,
          text: "⚡ Deployed WASM V8 engine compilation buffers successfully. Contributing client is ONLINE.",
          category: "system",
        },
      ]);
    } else {
      const pendingEarnings = Number(
        (cumulativeEarnings + stats.yieldEarnings).toFixed(6),
      );
      const pendingBalance = Number(
        (walletBalance + stats.yieldEarnings).toFixed(6),
      );
      const pendingJobs = globalJobsCompleted + stats.jobsCompleted;
      const pendingTokens = globalTokensProcessed + stats.tokensProcessed;

      setIsRunning(false);
      setStats((prev) => ({ ...prev, speed: 0 }));
      setLogs((prev) => [
        ...prev,
        {
          time: tStr,
          text: "🛑 Halt command transmitted. Purging thread execution frames...",
          category: "system",
        },
        {
          time: tStr,
          text: "🔒 Decoupled ledger synchronization. Browser worker standby state activated.",
          category: "system",
        },
      ]);

      if (isLoggedIn) {
        onPersistBalance(
          pendingEarnings,
          pendingJobs,
          pendingTokens,
          pendingBalance,
        );
      }
    }
  };

  // Sync with global cumulative earnings reset
  useEffect(() => {
    if (cumulativeEarnings === 0 && stats.yieldEarnings > 0) {
      setStats((prev) => ({ ...prev, yieldEarnings: 0 }));
    }
  }, [cumulativeEarnings]);

  // Claim earned tokens handler
  const handleClaimTokens = () => {
    if (stats.yieldEarnings <= 0) return;
    setClaimLoading(true);
    const tStr = new Date().toTimeString().split(" ")[0];

    setTimeout(() => {
      setClaimLoading(false);
      setLogs((prev) => [
        ...prev,
        {
          time: tStr,
          text: `💰 BALANCE CREDITED: ${stats.yieldEarnings.toFixed(6)} USD is now reflected in your wallet.`,
          category: "ledger",
        },
        {
          time: tStr,
          text: `🔗 Transmitting Solana signature... Target: ${displayAddress ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}` : "no saved address"}`,
          category: "ledger",
        },
        {
          time: tStr,
          text: `✓ Solana ledger broadcast complete! TxHash: 0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
          category: "ledger",
        },
        {
          time: tStr,
          text: "🎉 System cleared state buffer. Balance deposited successfully.",
          category: "ledger",
        },
      ]);
      setStats((prev) => ({ ...prev, yieldEarnings: 0 }));
      onClaimEarnings();
    }, 2000);
  };

  const copyWalletKey = () => {
    navigator.clipboard.writeText(displayAddress);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const filteredLogs = logs.filter(
    (l) => activeLogFilter === "all" || l.category === activeLogFilter,
  );

  // Active peer locations
  const peerCities = [
    { city: "San Francisco", lat: "us-west", ping: "14ms", status: "Active" },
    { city: "Frankfurt", lat: "de-central", ping: "28ms", status: "Active" },
    { city: "Tokyo", lat: "jp-east2", ping: "42ms", status: "Syncd" },
    { city: "Sydney", lat: "au-south1", ping: "68ms", status: "Standby" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-brand-light)] text-brand-dark flex flex-col pt-24 select-none pb-12 relative">
      {/* Grid Canvas Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-24 right-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-brand-neon/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-24 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 relative z-10 items-stretch my-4">
        {/* LEFT PANEL COLUMN (Cores details & Solana wallet connections) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Header Title alignment */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToLanding}
              className="p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-black rounded-xl transition-all cursor-pointer flex items-center justify-center group active:scale-95 shadow-xs"
              aria-label="Back to home overview"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <p className="font-mono text-[9px] text-brand-neon-dark uppercase font-black tracking-widest leading-none">
                // DISTRIBUTED_RESOURCES
              </p>
              <h2 className="font-display font-black text-xl text-gray-950 uppercase tracking-tight">
                WASM CLIENT MONITOR
              </h2>
            </div>
          </div>

          {/* Hardware Specifications detected block */}
          <div className="bg-white border border-gray-150 p-5 rounded-2xl space-y-4 shadow-xs">
            <h3 className="font-mono text-[10px] font-black text-gray-450 uppercase tracking-wider border-b border-gray-100 pb-2.5 flex items-center justify-between">
              <span>LOCAL_HARDWARE_INDEX</span>
              <Cpu className="w-3.5 h-3.5 text-gray-400" />
            </h3>

            <div className="grid grid-cols-2 gap-3.5 font-mono text-[11px]">
              <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-gray-800">
                <span className="text-gray-400 block text-[8px] uppercase tracking-wider font-bold">
                  V8 CPU Threads
                </span>
                <span className="text-gray-950 font-black block mt-0.5">
                  8 Logical Cores
                </span>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-gray-800">
                <span className="text-gray-400 block text-[8px] uppercase tracking-wider font-bold">
                  Assembly Compiler
                </span>
                <span className="text-brand-neon-dark font-black block mt-0.5">
                  WASM Supported
                </span>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-gray-800">
                <span className="text-gray-400 block text-[8px] uppercase tracking-wider font-bold">
                  Sandbox Isolation
                </span>
                <span className="text-blue-600 font-bold block mt-0.5">
                  Level 3 Secure
                </span>
              </div>
              <div className="bg-gray-55 border border-gray-100 p-3 rounded-lg text-gray-800">
                <span className="text-gray-500 block text-[8px] uppercase tracking-wider font-bold">
                  Allocated Buffer
                </span>
                <span className="text-gray-955 font-black block mt-0.5">
                  128MB Cache
                </span>
              </div>
            </div>
          </div>

          {/* Solana ledger keys & Claims processing */}
          <div className="bg-white border border-gray-150 p-5 rounded-2xl space-y-4 shadow-xs">
            <h3 className="font-mono text-[10px] font-black text-gray-455 uppercase tracking-wider border-b border-gray-100 pb-2.5 flex items-center justify-between">
              <span>LEDGER_WALLET_HANDSHAKE</span>
              <Coins className="w-3.5 h-3.5 text-gray-400" />
            </h3>

            {isLoggedIn ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="font-mono text-[8px] uppercase font-bold text-gray-400 tracking-wider">
                    Solana Target Account
                  </span>
                  <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-150 font-mono text-[10px] text-gray-700 relative shadow-inner">
                    <span className="break-all pr-2 select-all font-semibold font-sans">
                      {displayAddress}
                    </span>
                    <button
                      onClick={copyWalletKey}
                      className="text-gray-400 hover:text-brand-neon-dark transition-colors shrink-0 cursor-pointer p-1"
                      title="Copy exact base58 address"
                    >
                      {copiedKey ? (
                        <CheckCircle className="w-3.5 h-3.5 text-brand-neon-dark animate-bounce" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-55 p-3.5 rounded-xl border border-gray-150 space-y-2.5 shadow-xs">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-gray-500 font-bold uppercase text-[9px] tracking-wider">
                      WALLET STANDING BALANCE:
                    </span>
                    <span className="text-brand-neon-dark font-black text-xs">
                      {walletBalance > 0
                        ? `$${walletBalance.toFixed(6)}`
                        : "$0.000000"}
                    </span>
                  </div>
                  <div className="bg-teal-50 border border-teal-100 p-3 rounded-lg text-[9.5px] text-teal-800 font-semibold font-sans text-left flex items-start space-x-1.5 leading-snug">
                    <CheckCircle className="w-4 h-4 text-teal-650 shrink-0 mt-0.5" />
                    <span>
                      Any yield compiled is automatically and instantly added to
                      your wallet's standing balance in real-time. No manual
                      claiming is required!
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-500/5 border border-amber-200 rounded-xl text-center space-y-3">
                <AlertCircle className="w-6 h-6 text-amber-650 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-mono text-[10px] font-black uppercase text-amber-805 tracking-wider">
                    Ledger Unsynchronized
                  </h4>
                  <p className="text-[10px] text-gray-550 font-sans leading-relaxed">
                    Solana wallet mapping can play claims and verification once
                    a secure host handshake connection is authenticated.
                  </p>
                </div>
                <button
                  onClick={onStartProject}
                  className="px-4 py-2 bg-black text-brand-neon hover:bg-gray-900 rounded-lg text-[9px] font-mono tracking-wide font-black uppercase transition-all w-full cursor-pointer shadow-xs"
                >
                  Connect Solana Identity
                </button>
              </div>
            )}
          </div>

          {/* Active peer validators global latency list */}
          <div className="bg-white border border-gray-150 p-5 rounded-2xl space-y-3 shadow-xs">
            <h3 className="font-mono text-[10px] font-black text-gray-450 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center justify-between">
              <span>PEER_VALIDATOR_MESH</span>
              <span className="font-mono text-[8px] text-gray-400">
                4 GATES ACTIVE
              </span>
            </h3>

            <div className="space-y-2">
              {peerCities.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-[11px] font-mono"
                >
                  <span className="text-gray-600 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-brand-neon-dark rounded-full shrink-0" />
                    <span>
                      {p.city} ({p.lat})
                    </span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">{p.ping}</span>
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded-sm border border-gray-150 text-[8px] font-black text-gray-500 uppercase">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL COLUMN (Real time dials & Terminal Log stream console) */}
        <div className="lg:col-span-8 bg-white border border-gray-150 rounded-[28px] overflow-hidden flex flex-col justify-between items-stretch min-h-[480px] lg:min-h-[580px] shadow-sm relative">
          {/* Top Bar metrics and status */}
          <div className="bg-gray-50 border-b border-gray-150 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2.5">
              <Activity className="w-4 h-4 text-brand-neon-dark shrink-0 animate-pulse" />
              <div className="font-mono text-[10px] leading-none">
                <span className="text-gray-900 block font-bold uppercase tracking-wider">
                  WASM_SANDBOX_WORKER_CORE
                </span>
                <span className="text-gray-400 block mt-1">
                  STATE_HASH: {isRunning ? "DISTRIBUTING" : "STANDBY"}
                </span>
              </div>
            </div>

            <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 font-mono text-[10px] flex items-center space-x-2 shadow-2xs">
              <span
                className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-brand-neon-dark animate-ping" : "bg-gray-300"}`}
              />
              <span
                className={
                  isRunning
                    ? "text-brand-neon-dark font-black"
                    : "text-gray-400 font-bold"
                }
              >
                {isRunning ? "STATE_ONLINE" : "STATE_OFFLINE_STANDBY"}
              </span>
            </span>
          </div>

          <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 flex-1 flex flex-col justify-between">
            {/* Top Row: Dials and Statistics */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl font-mono relative overflow-hidden group shadow-2xs">
                <span className="text-gray-400 block text-[8px] uppercase tracking-wider font-bold">
                  Inference Rate
                </span>
                <span className="text-gray-950 font-black text-base block mt-1 leading-tight">
                  {isRunning
                    ? `${stats.speed.toLocaleString()} tok/s`
                    : "0.0 tok/s"}
                </span>
                <span className="absolute bottom-2 right-2 text-[9px] text-gray-200 font-mono font-bold uppercase">
                  SPEED
                </span>
              </div>

              <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl font-mono relative overflow-hidden group shadow-2xs">
                <span className="text-gray-400 block text-[8px] uppercase tracking-wider font-bold">
                  Consensus Shares
                </span>
                <span className="text-gray-950 font-black text-base block mt-1 leading-tight">
                  {isRunning ? stats.jobsCompleted : "0 SHARE"}
                </span>
                <span className="absolute bottom-2 right-2 text-[9px] text-gray-200 font-mono font-bold uppercase">
                  SHARES
                </span>
              </div>

              <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl font-mono relative overflow-hidden group shadow-2xs">
                <span className="text-gray-400 block text-[8px] uppercase tracking-wider font-bold">
                  Tokens Processed
                </span>
                <span className="text-gray-950 font-black text-base block mt-1 leading-tight">
                  {stats.tokensProcessed.toLocaleString()}
                </span>
                <span className="absolute bottom-2 right-2 text-[9px] text-gray-200 font-mono font-bold uppercase">
                  BLK_SIZE
                </span>
              </div>

              <div className="bg-gray-55 border border-teal-500/30 bg-teal-50/10 p-4 rounded-xl font-mono relative overflow-hidden group shadow-2xs">
                <span className="text-teal-600 block text-[8px] uppercase tracking-wider font-semibold">
                  Wallet Balance
                </span>
                <span className="text-teal-650 font-black text-base block mt-1 leading-tight animate-pulse">
                  {walletBalance > 0
                    ? `$${walletBalance.toFixed(6)}`
                    : "$0.000000"}
                </span>
                <span className="absolute bottom-2 right-2 text-teal-600/10 font-mono font-bold uppercase">
                  BALANCE
                </span>
              </div>
            </div>

            {/* Central Terminal Console Stream and Filters */}
            <div className="bg-[#fcfdfe] border border-gray-150 rounded-2xl p-4 sm:p-5 flex-1 flex flex-col justify-between min-h-[240px] sm:min-h-[290px] mt-2 relative shadow-inner">
              {/* Terminal Title Log Bar */}
              <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 gap-3">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-gray-400" />
                  <span className="font-mono text-xs font-bold text-gray-700">
                    live-worker-debug-shell --filter
                  </span>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: "all", label: "ALL" },
                    { id: "wasm", label: "WASM" },
                    { id: "network", label: "M_NET" },
                    { id: "ledger", label: "BLOCK" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveLogFilter(f.id as any)}
                      className={`px-2.5 py-1 rounded text-[8.5px] font-mono tracking-wider font-bold transition-all cursor-pointer uppercase ${
                        activeLogFilter === f.id
                          ? "bg-black text-brand-neon"
                          : "bg-gray-100 hover:bg-gray-250 text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scroller logs lists */}
              <div className="flex-1 overflow-y-auto font-mono text-[10.5px] space-y-2.5 max-h-[220px] pr-2 pt-3 custom-scrollbar text-left selection:bg-brand-neon selection:text-black select-text">
                {filteredLogs.map((log, index) => (
                  <div
                    key={index}
                    className="leading-normal flex items-start space-x-2"
                  >
                    <span className="text-gray-400 font-bold shrink-0">
                      [{log.time}]
                    </span>

                    {log.category === "system" && (
                      <span className="text-purple-600 font-black shrink-0">
                        [SYSTEM]
                      </span>
                    )}
                    {log.category === "wasm" && (
                      <span className="text-amber-600 font-black shrink-0">
                        [WASM_CORE]
                      </span>
                    )}
                    {log.category === "network" && (
                      <span className="text-blue-600 font-black shrink-0">
                        [CONN_MESH]
                      </span>
                    )}
                    {log.category === "ledger" && (
                      <span className="text-brand-neon-dark font-black shrink-0">
                        [LEDGER_OK]
                      </span>
                    )}

                    <span
                      className={`font-sans leading-relaxed text-[11px] ${
                        log.category === "ledger"
                          ? "text-gray-950 font-bold"
                          : "text-gray-600 font-medium"
                      }`}
                    >
                      {log.text}
                    </span>
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <div className="py-12 text-center text-gray-405 font-mono text-[11px] uppercase tracking-wider font-black">
                    No matching ledger tags compiled. Activate worker thread
                    execution.
                  </div>
                )}
                <div ref={logEndRef} />
              </div>

              {/* Console status footer indicators */}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between font-mono text-[9px] text-gray-400 select-none">
                <span className="flex items-center space-x-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-brand-neon-dark animate-pulse" : "bg-gray-300"}`}
                  />
                  <span>SYNCHRONIZE_METHOD: AUTOMATED_LEDGER_BROADCASTS</span>
                </span>
                <span>STATE_SECURED // SHARDS: V8</span>
              </div>
            </div>

            {/* Huge Big run node action toggle CTA */}
            <div className="pt-4">
              <button
                onClick={handleToggleNode}
                className={`w-full py-4 rounded-xl flex items-center justify-center space-x-2.5 text-xs font-bold font-mono uppercase tracking-wider cursor-pointer transition-all active:scale-[0.98] shadow-xs ${
                  isRunning
                    ? "bg-red-500 hover:bg-red-650 text-white"
                    : "bg-black hover:bg-gray-900 text-brand-neon border border-black"
                }`}
              >
                {isRunning ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-white text-white" />
                    <span>Suspend Active Node Worker Thread</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-brand-neon text-brand-neon animate-pulse" />
                    <span>Run browser node stream</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
