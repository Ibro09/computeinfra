import { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import LogoBar from "./components/LogoBar";
import AboutUs from "./components/AboutUs";
import Services from "./components/Services";
import Vision from "./components/Vision";
import Process from "./components/Process";
import TickerBanners from "./components/TickerBanners";
import WhyChooseUs from "./components/WhyChooseUs";
import BentoBenefits from "./components/BentoBenefits";
import Footer from "./components/Footer";
import StartProjectModal from "./components/StartProjectModal";
import PricingPlansModal from "./components/PricingPlansModal";
import ChatPage from "./components/ChatPage";
import BrowserPage from "./components/BrowserPage";
import WalletPage from "./components/WalletPage";

export default function App() {
  const [currentView, setCurrentView] = useState<
    "landing" | "chat" | "browser" | "wallet"
  >("landing");
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Scroll to top on mount

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("compute_infra_logged_in") === "true";
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem("compute_infra_user_email") || "";
  });
  const [userAddress, setUserAddress] = useState(() => {
    return localStorage.getItem("compute_infra_user_address") || "";
  });

  // Earnings & Worker States
  const [cumulativeEarnings, setCumulativeEarnings] = useState(() => {
    return Number(
      localStorage.getItem("compute_infra_cumulative_earnings") || "0.000000",
    );
  });
  const [globalJobsCompleted, setGlobalJobsCompleted] = useState(() => {
    return Number(localStorage.getItem("compute_infra_jobs_completed") || "0");
  });
  const [globalTokensProcessed, setGlobalTokensProcessed] = useState(() => {
    return Number(
      localStorage.getItem("compute_infra_tokens_processed") || "0",
    );
  });
  const [isNodeRunning, setIsNodeRunning] = useState(false);

  // Standing claimed reserves balance
  const [claimedBalance, setClaimedBalance] = useState(() => {
    return Number(localStorage.getItem("compute_infra_claimed_balance") || "0");
  });

  // Load database info if user is authenticated at mount
  useEffect(() => {
    if (isLoggedIn && userEmail) {
      fetch("/api/auth/register-or-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.user) {
            setCumulativeEarnings(data.user.earnings ?? 0);
            setGlobalJobsCompleted(data.user.jobsCompleted ?? 0);
            setGlobalTokensProcessed(data.user.tokensProcessed ?? 0);
            setClaimedBalance(data.user.balance ?? 0);
            const nextAddress = data.user.address ?? "";
            setUserAddress(nextAddress);
            localStorage.setItem("compute_infra_user_address", nextAddress);
            localStorage.setItem(
              "compute_infra_cumulative_earnings",
              (data.user.earnings ?? 0).toString(),
            );
            localStorage.setItem(
              "compute_infra_jobs_completed",
              (data.user.jobsCompleted ?? 0).toString(),
            );
            localStorage.setItem(
              "compute_infra_tokens_processed",
              (data.user.tokensProcessed ?? 0).toString(),
            );
            localStorage.setItem(
              "compute_infra_claimed_balance",
              (data.user.balance ?? 0).toString(),
            );
          }
        })
        .catch((e) =>
          console.warn(
            "Endpoint offline fallback (using local persistent states).",
            e.message,
          ),
        );
    }
  }, [isLoggedIn, userEmail]);

  // Periodically synchronizing user information (earnings, jobs, tokens, balance) with MongoDB
  useEffect(() => {
    if (!isLoggedIn || !userEmail) return;

    const interval = setInterval(() => {
      fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          earnings: cumulativeEarnings,
          jobsCompleted: globalJobsCompleted,
          tokensProcessed: globalTokensProcessed,
          balance: claimedBalance,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.user) {
            // Sync standing balance changes down
            setClaimedBalance(data.user.balance ?? 0);
            localStorage.setItem(
              "compute_infra_claimed_balance",
              (data.user.balance ?? 0).toString(),
            );
          }
        })
        .catch((e) =>
          console.warn("Auto-sync background endpoint unreachable", e.message),
        );
    }, 4500);

    return () => clearInterval(interval);
  }, [
    isLoggedIn,
    userEmail,
    cumulativeEarnings,
    globalJobsCompleted,
    globalTokensProcessed,
    claimedBalance,
  ]);

  const persistUserState = async (
    nextEarnings: number,
    nextJobs: number,
    nextTokens: number,
    nextBalance: number,
  ) => {
    if (!isLoggedIn || !userEmail) return;

    setCumulativeEarnings(nextEarnings);
    setGlobalJobsCompleted(nextJobs);
    setGlobalTokensProcessed(nextTokens);
    setClaimedBalance(nextBalance);

    localStorage.setItem(
      "compute_infra_cumulative_earnings",
      nextEarnings.toString(),
    );
    localStorage.setItem("compute_infra_jobs_completed", nextJobs.toString());
    localStorage.setItem(
      "compute_infra_tokens_processed",
      nextTokens.toString(),
    );
    localStorage.setItem(
      "compute_infra_claimed_balance",
      nextBalance.toString(),
    );

    try {
      const response = await fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          earnings: Number(nextEarnings.toFixed(6)),
          jobsCompleted: Number(nextJobs),
          tokensProcessed: Number(nextTokens),
          balance: Number(nextBalance.toFixed(6)),
        }),
      });
      const data = await response.json();

      if (data.success && data.user) {
        const syncedBalance = Number(data.user.balance ?? nextBalance);
        setClaimedBalance(syncedBalance);
        localStorage.setItem(
          "compute_infra_claimed_balance",
          syncedBalance.toString(),
        );
      }
    } catch (e: any) {
      console.warn("User sync endpoint unreachable", e.message);
    }
  };

  const handleUpdateEarnings = (
    addedYield: number,
    completedJob: number,
    addedTokens: number,
  ) => {
    setCumulativeEarnings((prev) => {
      const next = Number((prev + addedYield).toFixed(6));
      localStorage.setItem(
        "compute_infra_cumulative_earnings",
        next.toString(),
      );
      return next;
    });
    setClaimedBalance((prev) => {
      const next = Number((prev + addedYield).toFixed(6));
      localStorage.setItem("compute_infra_claimed_balance", next.toString());
      return next;
    });
    setGlobalJobsCompleted((prev) => {
      const next = prev + completedJob;
      localStorage.setItem("compute_infra_jobs_completed", next.toString());
      return next;
    });
    setGlobalTokensProcessed((prev) => {
      const next = prev + addedTokens;
      localStorage.setItem("compute_infra_tokens_processed", next.toString());
      return next;
    });
  };

  const handleClaimEarnings = () => {
    setCumulativeEarnings(0);
    localStorage.setItem("compute_infra_cumulative_earnings", "0");
  };

  const handleLogin = (email: string, dbUser?: any) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    localStorage.setItem("compute_infra_logged_in", "true");
    localStorage.setItem("compute_infra_user_email", email);

    if (dbUser) {
      setCumulativeEarnings(dbUser.earnings ?? 0);
      setGlobalJobsCompleted(dbUser.jobsCompleted ?? 0);
      setGlobalTokensProcessed(dbUser.tokensProcessed ?? 0);
      setClaimedBalance(dbUser.balance ?? 0);
      const nextAddress = dbUser.address ?? "";
      setUserAddress(nextAddress);
      localStorage.setItem("compute_infra_user_address", nextAddress);
      localStorage.setItem(
        "compute_infra_cumulative_earnings",
        (dbUser.earnings ?? 0).toString(),
      );
      localStorage.setItem(
        "compute_infra_jobs_completed",
        (dbUser.jobsCompleted ?? 0).toString(),
      );
      localStorage.setItem(
        "compute_infra_tokens_processed",
        (dbUser.tokensProcessed ?? 0).toString(),
      );
      localStorage.setItem(
        "compute_infra_claimed_balance",
        (dbUser.balance ?? 0).toString(),
      );
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    setIsNodeRunning(false);
    setCumulativeEarnings(0);
    setGlobalJobsCompleted(0);
    setGlobalTokensProcessed(0);
    setClaimedBalance(0);
    setUserAddress("");
    localStorage.removeItem("compute_infra_logged_in");
    localStorage.removeItem("compute_infra_user_email");
    localStorage.removeItem("compute_infra_user_address");
    localStorage.removeItem("compute_infra_cumulative_earnings");
    localStorage.removeItem("compute_infra_jobs_completed");
    localStorage.removeItem("compute_infra_tokens_processed");
    localStorage.removeItem("compute_infra_claimed_balance");
  };

  const handleSelectPlanFromPricing = (planName: string) => {
    // Open project modal so they can provide spec details for the plan
    setIsStartModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-brand-light text-brand-dark overflow-x-hidden selection:bg-brand-neon selection:text-black">
      {/* Primary header overlay */}
      <Header
        activeSection={
          currentView === "chat"
            ? "services"
            : currentView === "browser"
              ? "works"
              : activeSection
        }
        onStartProject={() => setIsStartModalOpen(true)}
        currentView={currentView}
        onSwitchView={(view) => setCurrentView(view)}
        isLoggedIn={isLoggedIn}
        userEmail={userEmail}
        cumulativeEarnings={cumulativeEarnings}
        walletBalance={claimedBalance}
        globalJobsCompleted={globalJobsCompleted}
        globalTokensProcessed={globalTokensProcessed}
        onClaimEarnings={handleClaimEarnings}
        isNodeRunning={isNodeRunning}
        onToggleNode={() => setIsNodeRunning((prev) => !prev)}
      />

      {currentView === "landing" ? (
        <>
          {/* Main flow of landing sections */}
          <main>
            {/* Section 1: Hero entry layout */}
            <Hero
              onStartProject={() => setIsStartModalOpen(true)}
              onViewPricing={() => setIsPricingModalOpen(true)}
            />

            {/* Section 2: Logo bar */}
            <LogoBar />

            {/* Section 3: About stats, sound graphs */}
            <AboutUs />

            {/* Section 4: 4-Column Service grids */}
            <Services
              onStartProject={() => setIsStartModalOpen(true)}
              isLoggedIn={isLoggedIn}
              userEmail={userEmail}
              onLogout={handleLogout}
            />

            {/* Section 5: Dynamic statement & mockup mockups */}
            <Vision />

            {/* Section 6: Sticky side-by-side progression steps */}
            {/* <Process onStartProject={() => setIsStartModalOpen(true)} /> */}

            {/* Section 7: Typographical ticker marquee runners */}
            <TickerBanners />

            {/* Section 8: Agency comparison cards column */}
            <WhyChooseUs onStartProject={() => setIsStartModalOpen(true)} />

            {/* Section 9: Structured bento grid benefit badges */}
            <BentoBenefits />
          </main>

          {/* Section 10: Multi-visual Contact forms and floors */}
          <Footer
            onStartProject={() => setIsStartModalOpen(true)}
            onSwitchView={(view) => setCurrentView(view)}
          />
        </>
      ) : currentView === "chat" ? (
        <ChatPage
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          onStartProject={() => setIsStartModalOpen(true)}
          onBackToLanding={() => setCurrentView("landing")}
        />
      ) : currentView === "browser" ? (
        <BrowserPage
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          onStartProject={() => setIsStartModalOpen(true)}
          onBackToLanding={() => setCurrentView("landing")}
          cumulativeEarnings={cumulativeEarnings}
          globalJobsCompleted={globalJobsCompleted}
          globalTokensProcessed={globalTokensProcessed}
          onUpdateEarnings={handleUpdateEarnings}
          onClaimEarnings={handleClaimEarnings}
          onPersistBalance={persistUserState}
          isNodeRunning={isNodeRunning}
          setIsNodeRunning={setIsNodeRunning}
          walletBalance={claimedBalance}
          userAddress={userAddress}
        />
      ) : (
        <WalletPage
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          cumulativeEarnings={cumulativeEarnings}
          globalJobsCompleted={globalJobsCompleted}
          globalTokensProcessed={globalTokensProcessed}
          onClaimEarnings={handleClaimEarnings}
          isNodeRunning={isNodeRunning}
          onToggleNode={() => setIsNodeRunning((prev) => !prev)}
          onUpdateEarnings={handleUpdateEarnings}
          onBackToLanding={() => setCurrentView("landing")}
          onSwitchView={(view) => setCurrentView(view)}
          walletBalance={claimedBalance}
          userAddress={userAddress}
          onUpdateClaimedBalance={(newBal) => {
            setClaimedBalance(newBal);
            localStorage.setItem(
              "compute_infra_claimed_balance",
              newBal.toString(),
            );
          }}
        />
      )}

      {/* OVERLAYS & MODALS */}
      <StartProjectModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        userEmail={userEmail}
      />

      <PricingPlansModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onSelectPlan={handleSelectPlanFromPricing}
      />
    </div>
  );
}
