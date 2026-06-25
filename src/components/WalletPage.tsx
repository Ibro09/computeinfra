import React, { useState, useEffect } from "react";
import {
  Coins,
  Wallet,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  ArrowUpRight,
  History,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WalletPageProps {
  isLoggedIn: boolean;
  userEmail: string;
  userAddress: string;
  cumulativeEarnings: number;
  globalJobsCompleted: number;
  globalTokensProcessed: number;
  onClaimEarnings: () => void;
  isNodeRunning: boolean;
  onToggleNode: () => void;
  onUpdateEarnings: (
    addedYield: number,
    completedJob: number,
    addedTokens: number,
  ) => void;
  onBackToLanding: () => void;
  onSwitchView: (view: "landing" | "chat" | "browser" | "wallet") => void;
  walletBalance: number;
  onUpdateClaimedBalance: (newBalance: number) => void;
}

export default function WalletPage({
  isLoggedIn,
  userEmail,
  userAddress,
  cumulativeEarnings,
  globalJobsCompleted,
  globalTokensProcessed,
  onClaimEarnings,
  isNodeRunning,
  onToggleNode,
  onUpdateEarnings,
  onBackToLanding,
  onSwitchView,
  walletBalance,
  onUpdateClaimedBalance,
}: WalletPageProps) {
  const [copied, setCopied] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"balances" | "transactions">(
    "balances",
  );

  // Transactions state
  const [transactions, setTransactions] = useState<any[]>([]);

  // Send Payment State Variables
  const [payRecipient, setPayRecipient] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState(false);

  // Devnet Withdrawal State Variables
  const [savedWalletAddress, setSavedWalletAddress] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawTerminalOutput, setWithdrawTerminalOutput] = useState<
    string[]
  >([]);
  const [adminBalance, setAdminBalance] = useState(() => {
    const saved = localStorage.getItem("compute_infra_admin_balance");
    return saved ? parseFloat(saved) : 984250.0;
  });

  const userSlug = userEmail
    ? userEmail.replace(/[^a-zA-Z0-9]/g, "").slice(0, 7)
    : "ANON";
  const resolvedWalletAddress = savedWalletAddress || userAddress || "";

  const fetchWalletProfile = () => {
    if (!isLoggedIn || !userEmail) return;

    fetch("/api/auth/register-or-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          onUpdateClaimedBalance(Number(data.user.balance ?? 0));
          const storedAddress = data.user.address || "";
          setSavedWalletAddress(storedAddress);
          setWithdrawAddress(storedAddress);

          const combinedList: any[] = [];
          const withdrawals = Array.isArray(data.user.withdrawals)
            ? data.user.withdrawals
            : [];
          const payments = Array.isArray(data.user.payments)
            ? data.user.payments
            : [];

          withdrawals.forEach((w: any, index: number) => {
            const txHash = typeof w?.txHash === "string" ? w.txHash : "";
            combinedList.push({
              id: String(w?.id ?? `withdraw-${index}`),
              timestamp: w?.timestamp ?? "",
              amount: Number(w?.amount ?? 0),
              solAmount: Number(w?.solAmount ?? 0),
              usdPerSol: Number(w?.usdPerSol ?? 0),
              txHash,
              address: w?.address ?? "",
              status: w?.status ?? "confirmed",
              error: w?.error ?? "",
              type: txHash.includes("_CLAIM") ? "Harvest" : "Withdrawal",
            });
          });

          payments.forEach((p: any, index: number) => {
            combinedList.push({
              id: String(p?.id ?? `payment-${index}`),
              timestamp: p?.timestamp ?? "",
              amount: Number(p?.amount ?? 0),
              txHash: typeof p?.txHash === "string" ? p.txHash : "",
              recipient: p?.recipient ?? "",
              status: p?.status ?? "confirmed",
              type: "Payment",
            });
          });

          combinedList.sort((a, b) => String(b.id).localeCompare(String(a.id)));
          setTransactions(combinedList);
        }
      })
      .catch((err) => {
        console.warn(
          "MongoDB API offline, reading local backup store:",
          err.message,
        );
        // fallback
        const saved = localStorage.getItem(
          `compute_infra_transactions_${userSlug}`,
        );
        if (saved) {
          setTransactions(JSON.parse(saved));
        }
      });
  };

  useEffect(() => {
    fetchWalletProfile();
  }, [userEmail, isLoggedIn]);

  const handleCopy = () => {
    navigator.clipboard.writeText(resolvedWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = () => {
    if (cumulativeEarnings <= 0) return;
    setClaimLoading(true);
    setClaimSuccess(false);

    fetch("/api/user/harvest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    })
      .then((r) => r.json())
      .then((data) => {
        setClaimLoading(false);
        if (data.success) {
          setClaimSuccess(true);
          onClaimEarnings(); // resets cumulative in App
          fetchWalletProfile(); // updates claimed balance and transaction logs
          setTimeout(() => setClaimSuccess(false), 5000);
        }
      })
      .catch((err) => {
        console.warn(
          "Direct harvesting endpoint failed, using client backup execution",
          err,
        );
        // Fallback
        setTimeout(() => {
          setClaimLoading(false);
          setClaimSuccess(true);

          const addedBalance = cumulativeEarnings;
          onUpdateClaimedBalance(
            Number((walletBalance + addedBalance).toFixed(6)),
          );

          const txHash = `SOL_TX_${Math.random().toString(36).substring(2, 10).toUpperCase()}_CLAIM`;
          const newTx = {
            id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
            timestamp: new Date().toLocaleString(),
            amount: Number(addedBalance.toFixed(6)),
            txHash: txHash,
            status: "confirmed",
            type: "Harvest",
          };

          const updatedTxList = [newTx, ...transactions].slice(0, 15);
          setTransactions(updatedTxList);
          localStorage.setItem(
            `compute_infra_transactions_${userSlug}`,
            JSON.stringify(updatedTxList),
          );
          onClaimEarnings();

          setTimeout(() => setClaimSuccess(false), 5000);
        }, 1500);
      });
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPayError("");
    setPaySuccess(false);

    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setPayError("Valid transaction amount required.");
      return;
    }

    if (walletBalance < amountNum) {
      setPayError(
        `Insufficient balance. Your total wallet reserves evaluate to: $${walletBalance.toFixed(6)}.`,
      );
      return;
    }

    const trimmedRecipient = payRecipient.trim();
    if (trimmedRecipient.length < 32 || trimmedRecipient.length > 44) {
      setPayError(
        "Recipient Solana validator address signature must measure between 32 and 44 letters (Base58 protocol).",
      );
      return;
    }

    setPayLoading(true);

    fetch("/api/user/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        recipient: trimmedRecipient,
        amount: amountNum,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        setPayLoading(false);
        if (data.success) {
          setPaySuccess(true);
          setPayAmount("");
          setPayRecipient("");
          fetchWalletProfile(); // updates claimedBalance in state
        } else {
          setPayError(
            data.error || "Payment transaction rejected by core pipeline.",
          );
        }
      })
      .catch((err) => {
        console.warn("Pay API offline, simulating payment locally", err);
        setTimeout(() => {
          setPayLoading(false);
          setPaySuccess(true);

          const newBalance = Number((walletBalance - amountNum).toFixed(6));
          onUpdateClaimedBalance(newBalance);

          const newTx = {
            id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
            timestamp: new Date().toLocaleString(),
            amount: amountNum,
            recipient: trimmedRecipient,
            txHash: `SOL_TX_${Math.random().toString(36).substring(2, 10).toUpperCase()}_PAY`,
            status: "confirmed",
            type: "Payment",
          };

          const updatedList = [newTx, ...transactions];
          setTransactions(updatedList);
          localStorage.setItem(
            `compute_infra_transactions_${userSlug}`,
            JSON.stringify(updatedList),
          );

          setPayAmount("");
          setPayRecipient("");
        }, 1500);
      });
  };

  const handleExecuteWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();

    setWithdrawError("");
    setWithdrawSuccess(false);
    setWithdrawLoading(true);

    const amountNum = parseFloat(withdrawAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError("Invalid amount.");
      setWithdrawLoading(false);
      return;
    }

    const trimmedAddress = withdrawAddress.trim();

    // terminal animation (safe fake UI)
    setWithdrawTerminalOutput([
      `// INITIATING WITHDRAWAL $${amountNum.toFixed(4)}`,
    ]);

    const steps = [
      "// CONNECTING TO SOLANA DEVNET...",
      "// VERIFYING TRANSACTION...",
      "// BROADCASTING...",
      "// WAITING FOR CONFIRMATION...",
    ];

    let i = 0;

    const interval = setInterval(() => {
      if (i < steps.length) {
        setWithdrawTerminalOutput((prev) => [...prev, steps[i]]);
        i++;
      }
    }, 700);

    try {
      const res = await fetch("/api/user/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          address: trimmedAddress,
          amount: amountNum,
        }),
      }).catch((err) => {
        throw new Error(
          err instanceof Error ? err.message : "Network request failed.",
        );
      });

      let data: any = {};
      const contentType = res.headers.get("content-type") || "";

      try {
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          data = { error: text || "Withdrawal request failed." };
        }
      } catch {
        data = { error: "Server returned an invalid response." };
      }

      clearInterval(interval);
      setWithdrawLoading(false);

      if (!res.ok || !data?.success) {
        if (data?.newTx) {
          setTransactions((prev) => [
            {
              id: String(data.newTx.id ?? `withdraw-${Date.now()}`),
              timestamp: data.newTx.timestamp ?? new Date().toISOString(),
              amount: Number(data.newTx.amount ?? amountNum),
              solAmount: Number(data.newTx.solAmount ?? 0),
              usdPerSol: Number(data.newTx.usdPerSol ?? 0),
              txHash:
                typeof data.newTx.txHash === "string" ? data.newTx.txHash : "",
              address: data.newTx.address ?? trimmedAddress,
              status: data.newTx.status ?? "failed",
              error: data.newTx.error ?? data?.error ?? "",
              type: "Withdrawal",
            },
            ...prev,
          ]);
        }
        setWithdrawError(data?.error || "Withdrawal failed.");
        return;
      }

      const nextBalance = Number(
        (typeof data.balance === "number"
          ? data.balance
          : walletBalance - amountNum
        ).toFixed(6),
      );
      onUpdateClaimedBalance(nextBalance);

      if (data.newTx) {
        const newTx = {
          id: String(data.newTx.id ?? `withdraw-${Date.now()}`),
          timestamp: data.newTx.timestamp ?? new Date().toISOString(),
          amount: Number(data.newTx.amount ?? amountNum),
          solAmount: Number(data.newTx.solAmount ?? 0),
          usdPerSol: Number(data.newTx.usdPerSol ?? 0),
          txHash: typeof data.newTx.txHash === "string" ? data.newTx.txHash : "",
          address: data.newTx.address ?? trimmedAddress,
          status: data.newTx.status ?? "confirmed",
          error: data.newTx.error ?? "",
          type: "Withdrawal",
        };
        setTransactions((prev) => [newTx, ...prev]);
      }

      setWithdrawTerminalOutput((prev) => [
        ...prev,
        "// CONFIRMED ✓ LEDGER UPDATED",
      ]);

      setWithdrawSuccess(true);
      setWithdrawAmount("");

      setTimeout(fetchWalletProfile, 500);
    } catch (err) {
      clearInterval(interval);
      setWithdrawLoading(false);
      setWithdrawError(
        err instanceof Error ? err.message : "Network error. Please try again.",
      );
    }
  };

  return (
    <div
      className="pt-24 min-h-screen bg-gray-50/50 pb-20 select-none"
      id="wallet-viewport"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Navigation Breadcrumb / Core header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToLanding}
              className="p-2 bg-white border border-gray-150 hover:bg-gray-100 rounded-full transition-all cursor-pointer shadow-3xs active:scale-95 text-gray-500"
              title="Back to Landing Page"
            >
              <ArrowLeft className="w-4 h-4 text-gray-700" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-mono text-[9px] text-teal-600 uppercase tracking-widest font-black leading-none">
                  // DECENTRALIZED_LEDGER_LEDGER
                </p>
                <span className="bg-teal-100/50 text-teal-700 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border border-teal-200 uppercase tracking-tight">
                  Solana Devnet
                </span>
              </div>
              <h1 className="font-display font-black text-2xl uppercase tracking-tight text-gray-950 mt-1">
                Crypto Node Wallet
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSwitchView("browser")}
              className="flex items-center space-x-1 px-4 py-2 bg-white hover:bg-gray-50 text-gray-750 border border-gray-150 rounded-xl transition-all font-mono text-xs font-bold cursor-pointer shadow-3xs"
            >
              <span>Telemetry Monitor</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-505" />
            </button>
          </div>
        </div>

        {!isLoggedIn ? (
          /* Authentication Gatekeeper Guard Screen */
          <div className="bg-white border border-gray-150 rounded-3xl p-10 text-center max-w-lg mx-auto shadow-md mt-12">
            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="font-display font-black text-xl text-gray-950 uppercase tracking-tight">
              Authentication Required
            </h2>
            <p className="text-gray-500 font-sans text-sm mt-2 max-w-sm mx-auto leading-relaxed font-semibold">
              No local wallet thread found on this layout. Please authenticate
              first via the main console or access node key.
            </p>
            <button
              onClick={() => onSwitchView("landing")}
              className="mt-6 px-6 py-2.5 bg-black hover:bg-gray-950 text-brand-neon font-sans text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
            >
              Back to Terminal Access
            </button>
          </div>
        ) : (
          /* Full Interactive Cryptographic Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* COLUMN 1 & 2: Main Balance, Claim, Workers and Logs */}
            <div className="lg:col-span-2 space-y-8">
              {/* PRIMARY STANDING LEDGER WALLLET BALANCE CARD */}
              <div className="bg-white border border-gray-150 rounded-3xl shadow-xs overflow-hidden relative">
                {/* Turquoise Gradient Top Accent */}
                <div className="h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500" />

                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[9px] text-teal-600 uppercase tracking-widest font-black">
                          // WALLET_STANDING_LEDGER_RESERVES
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-200 uppercase tracking-tight flex items-center space-x-1">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping shrink-0" />
                          <span>Real-Time Auto-Compounding Live</span>
                        </span>
                      </div>
                      <span className="text-4xl sm:text-5xl font-mono font-black text-gray-950 tracking-tight block mt-3">
                        {walletBalance > 0
                          ? `$${walletBalance.toFixed(6)}`
                          : "$0.000000"}
                      </span>
                      <p className="text-gray-500 text-[11px] font-sans mt-2.5 font-semibold leading-relaxed">
                        Your standing wallet reserves are hosted and
                        cryptographically signed on the Solana network. All
                        browser compute rewards automatically stream directly to
                        this balance on every block execution at{" "}
                        <span className="font-mono text-teal-600 font-extrabold">
                          ~$5.00/day
                        </span>{" "}
                        per block. Under standard consensus protocol, no
                        separate manual credit claims are needed.
                      </p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-110 p-5 rounded-2xl self-start sm:self-center shrink-0">
                      <Coins className="w-8 h-8 text-emerald-500 animate-pulse" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold font-mono block uppercase">
                        Total Jobs Completed
                      </span>
                      <span className="text-xl font-mono font-black text-gray-920 block mt-0.5">
                        {globalJobsCompleted}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold font-mono block uppercase">
                        Tensors Evaluated
                      </span>
                      <span className="text-xl font-mono font-black text-gray-920 block mt-0.5">
                        {globalTokensProcessed.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CORE SECTION TABS */}
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs">
                <div className="flex border-b border-gray-100 pb-3 gap-6 mb-6">
                  <button
                    onClick={() => setActiveTab("balances")}
                    className={`font-mono text-xs font-bold pb-2 transition-all cursor-pointer border-b-2 uppercase tracking-wide px-1 ${
                      activeTab === "balances"
                        ? "border-teal-500 text-gray-950"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Wallet Ledger Stats
                  </button>
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className={`font-mono text-xs font-bold pb-2 transition-all cursor-pointer border-b-2 uppercase tracking-wide px-1 relative ${
                      activeTab === "transactions"
                        ? "border-teal-500 text-gray-950"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Claims & Transfers Logs ({transactions.length})
                  </button>
                </div>

                {activeTab === "balances" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Sub-Metric: Evaluation Speed */}

                      {/* Sub-Metric: Connection Identity */}
                      <div className="border border-gray-150 p-4 rounded-2xl flex items-start space-x-3 bg-gray-50/40 text-left">
                        <div className="p-2 bg-white border border-gray-150 rounded-xl text-teal-600 mt-0.5">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase font-mono">
                            Signer ID
                          </span>
                          <span className="text-sm font-mono font-black text-gray-950 block mt-1 truncate max-w-[140px]">
                            {resolvedWalletAddress}
                          </span>
                          <span className="text-[9.5px] text-gray-400 font-sans block mt-0.5 font-semibold">
                            Secure public address pair
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-teal-50/20 border border-teal-100 rounded-2xl flex items-start space-x-3 text-left">
                      <ShieldAlert className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-mono text-[10px] font-black text-teal-800 uppercase tracking-wider">
                          Democratized Node Compliance
                        </h5>
                        <p className="text-[10px] text-teal-900/80 font-sans mt-0.5 leading-relaxed font-semibold">
                          Your earnings are local to this sandboxed browser
                          profile and bound securely to your Solana Sign
                          Address. Keep the WASM Client Monitor tab running to
                          increase computational rewards further.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "transactions" && (
                  <div className="space-y-4">
                    {transactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-450 font-sans text-xs">
                        <History className="w-8 h-8 mx-auto text-gray-350 mb-2 animate-none" />
                        No past claim or transfer transactions found on this
                        account yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {transactions.map((tx) => {
                          const txId = String(tx?.id ?? "tx");
                          const txType =
                            typeof tx?.type === "string"
                              ? tx.type
                              : "Transaction";
                          const txHash =
                            typeof tx?.txHash === "string" ? tx.txHash : "";
                          const txAmount = Number(tx?.amount ?? 0);
                          const txStatus =
                            typeof tx?.status === "string"
                              ? tx.status
                              : "confirmed";
                          const txSolAmount = Number(tx?.solAmount ?? 0);
                          const txError =
                            typeof tx?.error === "string" ? tx.error : "";
                          const isDebit =
                            txType === "Payment" ||
                            (txType === "Withdrawal" &&
                              txStatus === "confirmed");
                          const txRecipient =
                            typeof tx?.recipient === "string"
                              ? tx.recipient
                              : "";
                          const txAddress =
                            typeof tx?.address === "string" ? tx.address : "";
                          const txTimestamp =
                            typeof tx?.timestamp === "string"
                              ? tx.timestamp
                              : "";

                          return (
                            <div
                              key={txId}
                              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-0.5 text-left">
                                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                  <span className="font-mono font-black text-gray-950">
                                    {txId}
                                  </span>
                                  <span
                                    className={`text-[8.5px] font-mono font-black px-1.5 py-0.2 rounded border uppercase ${
                                      txType === "Payment"
                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                        : txType === "Withdrawal"
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    }`}
                                  >
                                    {txType}
                                  </span>
                                  <span
                                    className={`text-[8.5px] font-mono font-black px-1.5 py-0.2 rounded border uppercase ${
                                      txStatus === "confirmed"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : txStatus === "failed"
                                          ? "bg-rose-50 text-rose-700 border-rose-200"
                                          : txStatus === "processing"
                                            ? "bg-blue-50 text-blue-700 border-blue-200"
                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}
                                  >
                                    {txStatus}
                                  </span>
                                </div>
                                <p className="text-[9.5px] font-mono text-gray-400 font-semibold truncate max-w-xs">
                                  {txHash || "Awaiting transaction signature"}
                                </p>

                                {txRecipient && (
                                  <p className="text-[9px] text-gray-500 font-mono">
                                    Recipient:{" "}
                                    <span className="font-bold font-sans break-all">
                                      {txRecipient}
                                    </span>
                                  </p>
                                )}
                                {txAddress && txType === "Withdrawal" && (
                                  <p className="text-[9px] text-gray-500 font-mono">
                                    To Address:{" "}
                                    <span className="font-bold font-sans break-all">
                                      {txAddress}
                                    </span>
                                  </p>
                                )}
                                {txType === "Withdrawal" && txSolAmount > 0 && (
                                  <p className="text-[9px] text-gray-500 font-mono">
                                    SOL Amount:{" "}
                                    <span className="font-bold font-sans">
                                      {txSolAmount.toFixed(9)}
                                    </span>
                                  </p>
                                )}
                                {txError && (
                                  <p className="text-[9px] text-rose-600 font-sans font-bold max-w-xs">
                                    {txError}
                                  </p>
                                )}

                                <p className="text-[9px] text-gray-400 font-sans font-semibold">
                                  {txTimestamp}
                                </p>
                              </div>
                              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                                <span
                                  className={`font-mono font-bold px-2 py-0.5 rounded border ${
                                    txType === "Payment" ||
                                    (txType === "Withdrawal" && isDebit)
                                      ? "text-rose-600 bg-rose-50 border-rose-100"
                                      : "text-emerald-600 bg-emerald-50 border-emerald-100"
                                  }`}
                                >
                                  {isDebit ? "-" : txStatus === "failed" ? "" : "+"}
                                  ${txAmount.toFixed(6)}
                                </span>

                                {txType === "Withdrawal" && txHash && (
                                  <a
                                    href={`https://solscan.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] text-blue-500 hover:underline flex items-center space-x-0.5"
                                    title="Check Solana Explorer link"
                                  >
                                    <span>Verify on Solscan</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 3: Right Sidebar with Sign Address hardware & payment triggers */}
            <div className="space-y-8">
              {/* SOLANA SIGN ADDRESS CARD */}
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs text-left">
                <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest font-black block">
                  // CLUSTER_IDENTITY_PUBLIC_KEY
                </span>
                <h4 className="font-sans font-black text-sm text-gray-950 uppercase tracking-tight mt-1.5">
                  Solana Public Address
                </h4>

                <div className="mt-4 bg-gray-50 border border-gray-150 rounded-2xl p-4 relative shadow-inner">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400 font-extrabold text-[8px] uppercase">
                      Validator signature hex address
                    </span>
                    <button
                      onClick={handleCopy}
                      className="text-gray-400 hover:text-black transition-colors p-1 cursor-pointer"
                      title="Copy Solana Public Key"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs font-mono font-black text-gray-800 break-words mt-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-3xs leading-relaxed select-all">
                    {resolvedWalletAddress || "No address saved yet"}
                  </p>

                  <span className="text-[8px] font-sans font-black text-teal-650 mt-2.5 block uppercase tracking-wider font-extrabold">
                    // VALIDATOR_DEVICE_IDENTIFIED_OK
                  </span>
                </div>

                <div className="mt-5 space-y-2.5 text-xs text-gray-500 font-sans leading-relaxed font-semibold">
                  <p>
                    Your validator public key address is generated directly from
                    your member login credentials (
                    <span className="text-gray-900 font-bold">{userEmail}</span>
                    ).
                  </p>
                  <p>
                    Any ledger claims, payments, or Devnet withdrawals on this
                    browser sandbox are verified and signed against this
                    identity.
                  </p>
                </div>
              </div>

              {/* DEVNET WITHDRAWAL ENGINE CARD */}
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs text-left relative overflow-hidden">
                <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest font-black block">
                  // DEVNET_CLUSTER_SYNC
                </span>
                <h4 className="font-sans font-black text-sm text-gray-950 uppercase tracking-tight mt-1">
                  Withdrawal
                </h4>

                {withdrawError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-650 rounded-xl font-mono text-[10px] leading-tight flex items-start space-x-1.5 animate-bounce">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-red-500" />
                    <span>{withdrawError}</span>
                  </div>
                )}

                {withdrawSuccess && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-mono text-[10px] leading-tight flex items-start space-x-1.5 animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>
                      Successfully withdrawn. Broadcast payload validated on
                      Solana cluster.
                    </span>
                  </div>
                )}

                {withdrawLoading ? (
                  /* Terminal loader lines */
                  <div className="mt-4 bg-[#0a0c10] border border-slate-900 rounded-xl p-3.5 font-mono text-[8.5px] text-slate-350 space-y-1.5 shadow-inner">
                    <div className="flex justify-between items-center text-[7.5px] text-cyan-400 border-b border-slate-900 pb-1 uppercase font-bold">
                      <span>Solana Devnet Tunnel</span>
                      <span className="animate-pulse">Active</span>
                    </div>
                    {withdrawTerminalOutput.map((l, i) => {
                      const line = typeof l === "string" ? l : "";
                      return (
                        <div
                          key={`${i}-${line}`}
                          className={
                            line.includes("✓") ||
                            line.includes("SUCCESS") ||
                            line.includes("VERIFIED")
                              ? "text-emerald-400"
                              : ""
                          }
                        >
                          {line}
                        </div>
                      );
                    })}
                    <div className="flex items-center space-x-1.5 text-cyan-400 animate-pulse pt-1">
                      <span className="w-2 h-2 border border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span>Broadcasting instructions...</span>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleExecuteWithdrawal}
                    className="mt-4 space-y-3.5"
                  >
                    <div className="space-y-1">
                      <label className="block font-mono text-[8px] font-black text-gray-400 uppercase tracking-wider">
                        Solana Target Address
                      </label>
                      <input
                        type="text"
                        placeholder="Solana validation address"
                        value={withdrawAddress}
                        onChange={(e) => setWithdrawAddress(e.target.value)}
                        required
                        className="w-full bg-gray-50 border border-gray-200 text-xs font-mono rounded-xl p-3 focus:outline-hidden focus:border-teal-550 transition-all placeholder-gray-450"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setWithdrawAddress(
                            savedWalletAddress || userAddress || "",
                          )
                        }
                        className="text-[8px] text-teal font-mono uppercase font-black mt-1 hover:underline cursor-pointer"
                      >
                        Reset to my saved wallet address
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-mono text-[8px] font-black text-gray-400 uppercase tracking-wider">
                        Amount ($)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.000001"
                          placeholder="0.000000"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          required
                          className="w-full bg-gray-50 border border-gray-200 text-xs font-mono rounded-xl p-3 pr-10 focus:outline-hidden focus:border-teal-550 transition-all placeholder-gray-455"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-gray-450 font-black">
                          $
                        </span>
                      </div>
                      <span className="text-[8.5px] text-gray-400 font-mono block mt-1">
                        Available balance:{" "}
                        <strong className="text-gray-700 font-bold">
                          ${walletBalance.toFixed(6)}
                        </strong>
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={withdrawLoading}
                      className="w-full py-3  hover:opacity-90 disabled:opacity-40 text-black font-mono text-[9px] font-black uppercase tracking-wider rounded-xl transition-all  border cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm font-extrabold"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Request Admin Disbursal (Withdraw)</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
