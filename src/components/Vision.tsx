import { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Terminal,
  RefreshCw,
  Layers,
  Play,
  Square,
  Check,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Vision() {
  const [isRunning, setIsRunning] = useState(false);
  const [hardware, setHardware] = useState({
    processor: "Auto Detect",
    browser: "Generic Browser",
    wasm: "Supported ✅",
    compute: "Ready",
  });

  const [stats, setStats] = useState({
    jobsCompleted: 0,
    tokensProcessed: 0,
    yieldEarnings: 0,
    computeSpeed: 0,
  });

  const [logs, setLogs] = useState<string[]>([
    "System Ready.",
    "Connect your browser to the decentralized compute network and start contributing resources.",
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto detect hardware on mount
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const cores = navigator.hardwareConcurrency
        ? `${navigator.hardwareConcurrency} Cores`
        : "8 Cores (Hyper-Threaded)";
      const agent = navigator.userAgent;
      let browserName = "Chrome Runtime";
      if (agent.indexOf("Firefox") > -1) {
        browserName = "Firefox Runtime";
      } else if (
        agent.indexOf("Safari") > -1 &&
        agent.indexOf("Chrome") === -1
      ) {
        browserName = "Safari Runtime";
      } else if (agent.indexOf("Edge") > -1) {
        browserName = "Edge Runtime";
      }
      setHardware({
        processor: cores,
        browser: browserName,
        wasm: "Supported ✅",
        compute: "Ready",
      });
    }
  }, []);

  // Diagnostics streamer loop when running
  useEffect(() => {
    if (!isRunning) return;

    // Reset stats or start from current positive
    const statsInterval = setInterval(() => {
      setStats((prev) => {
        const addedTokens = Math.floor(Math.random() * 150) + 50;
        const newSpeed = Math.floor(Math.random() * 300) + 1100;
        const addedYield = Number((addedTokens * 0.00014).toFixed(5));
        return {
          jobsCompleted: prev.jobsCompleted + (Math.random() > 0.7 ? 1 : 0),
          tokensProcessed: prev.tokensProcessed + addedTokens,
          yieldEarnings: Number((prev.yieldEarnings + addedYield).toFixed(5)),
          computeSpeed: newSpeed,
        };
      });
    }, 1500);

    const logTemplates = [
      "Downloading AI model weights via decentralized CDN...",
      "Shard [7a89] response verified from node partner us-west-4.",
      "Allocating L1/L2 browser execution cache...",
      "Executing sub-tensor backpropagation for model testing.",
      "Token compilation: completed in 812ms with zero errors.",
      "Mining share submitted to validator layer 01.",
      "Validating neural parameters against secure signature...",
      "Incoming job request: text-generation inference task.",
      "Verifying consensus hash signatures...",
    ];

    const logInterval = setInterval(() => {
      const randomMsg =
        logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      setLogs((prev) => [...prev.slice(-30), `[${timeStr}] ${randomMsg}`]);
    }, 2500);

    return () => {
      clearInterval(statsInterval);
      clearInterval(logInterval);
    };
  }, [isRunning]);

  // Handle start / stop node
  const toggleNode = () => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    if (!isRunning) {
      setIsRunning(true);
      setLogs((prev) => [
        ...prev,
        `[${timeStr}] Initializing browser Assembly runtime...`,
        `[${timeStr}] Authentication Token approved. Peer handshake established.`,
        `[${timeStr}] Listening for globally distributed workload payloads...`,
      ]);
    } else {
      setIsRunning(false);
      setStats((prev) => ({ ...prev, computeSpeed: 0 }));
      setLogs((prev) => [
        ...prev,
        `[${timeStr}] De-allocating worker thread assets. Instance suspended.`,
      ]);
    }
  };



  return (
    <section
      id="works"
      className="py-24 bg-gray-50/50 border-b border-gray-100 select-none overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Top Tag label */}
        <div className="flex justify-center flex-col items-center space-y-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
            <span className="w-2.5 h-2.5 bg-brand-neon rounded-full animate-pulse" />
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-gray-500">
              WEBASSEMBLY WORKER TERMINAL
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-950 max-w-4xl leading-tight">
            Deploy runtime from your tab.{" "}
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-500 bg-clip-text text-transparent">
              No setups.
            </span>
          </h2>
          <p className="font-sans text-xs sm:text-sm text-gray-500 leading-relaxed font-semibold max-w-xl">
            Connect your browser directly to the ComputeInfra decentralized
            network to execute lightweight AI inference workloads and earn from
            your unused power.
          </p>
        </div>

        {/* Outer terminal frame */}
        <div className="max-w-4xl mx-auto bg-slate-950 rounded-[32px] overflow-hidden shadow-2xl border border-slate-900 flex flex-col items-stretch">
          {/* Terminal Title Bar */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-950">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="pl-3 font-mono text-[11px] font-bold text-slate-400">
                wasm-worker-client-v1.0.8
              </span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
              <Shield className="w-3.5 h-3.5 text-brand-neon" />
              <span className="font-mono text-[9px] font-bold text-slate-300">
                SECURED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-900">
            {/* Left Box: Hardware and Metrics */}
            <div className="p-6 md:p-8 space-y-8 flex flex-col justify-between">
              {/* Hardware Detected Segment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h3 className="font-mono text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-brand-neon shrink-0 animate-pulse" />
                    <span>Hardware Detected</span>
                  </h3>
                  <span className="w-2 h-2 bg-brand-neon rounded-full animate-ping" />
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase tracking-wider">
                      Processor
                    </span>
                    <span className="text-slate-200 font-bold">
                      {hardware.processor}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase tracking-wider">
                      Browser Runtime
                    </span>
                    <span className="text-slate-200 font-bold">
                      {hardware.browser}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase tracking-wider">
                      WASM Execution
                    </span>
                    <span className="text-brand-neon font-bold">
                      {hardware.wasm}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase tracking-wider">
                      Available Compute
                    </span>
                    <span className="text-blue-400 font-bold">
                      {hardware.compute}
                    </span>
                  </div>
                </div>
              </div>

              {/* Node Statistics Segment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h3 className="font-mono text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-brand-neon shrink-0" />
                    <span>Node Statistics</span>
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    LIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-4 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase tracking-wider">
                      Jobs Completed
                    </span>
                    <span className="text-2xl font-black text-slate-100">
                      {stats.jobsCompleted}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase tracking-wider">
                      Tokens Processed
                    </span>
                    <span className="text-2xl font-black text-slate-100">
                      {stats.tokensProcessed.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase tracking-wider">
                      Yield Earnings
                    </span>
                    <span className="text-2xl font-black text-brand-neon">
                      {stats.yieldEarnings > 0
                        ? `${stats.yieldEarnings} Credits`
                        : "0 Credits"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase tracking-wider">
                      Compute Speed
                    </span>
                    <span className="text-lg font-black text-slate-200">
                      {stats.computeSpeed === 0
                        ? "0 tok/sec"
                        : `${stats.computeSpeed.toLocaleString()} tok/sec`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Node Button CTA */}
              <div className="pt-4">
                <button
                  onClick={toggleNode}
                  className={`w-full py-4 rounded-2xl flex items-center justify-center space-x-2 text-xs font-bold font-mono uppercase tracking-wide cursor-pointer transition-all active:scale-[0.98] ${
                    isRunning
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/10"
                      : "bg-brand-neon hover:bg-brand-neon-hover text-black shadow-lg shadow-brand-neon/15"
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Square className="w-4 h-4 fill-white text-white" />
                      <span>Stop Active Node</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-black text-black animate-pulse" />
                      <span>Run a Node</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Box: Live Diagnostics Console Stream */}
            <div className="p-6 md:p-8 bg-black/40 flex flex-col justify-between min-h-[360px]">
              <div className="space-y-2 flex-grow flex flex-col justify-between">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 tracking-wider block border-b border-slate-900 pb-2">
                  Live Diagnostics Stream
                </span>

                {/* Scroller Area */}
                <div className="font-mono text-[11px] text-slate-300 space-y-2 h-[260px] overflow-y-auto pr-2 pt-2 select-text custom-scrollbar">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className="leading-relaxed whitespace-pre-wrap"
                    >
                      {log.startsWith("[") ? (
                        <>
                          <span className="text-slate-500">
                            {log.substring(0, 10)}
                          </span>
                          <span className="text-slate-200">
                            {log.substring(10)}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400">{log}</span>
                      )}
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>

              {/* Status Indicators bar */}
              <div className="border-t border-slate-900 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="flex items-center space-x-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-brand-neon animate-pulse" : "bg-slate-600"}`}
                  />
                  <span>THREAD_COUNT: STABLE</span>
                </span>
                <span>STATE_AUTODETECT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
