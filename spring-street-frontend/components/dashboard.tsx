"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider, useTheme } from "@/components/providers/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FAB } from "@/components/layout/fab";
import { CommandPalette } from "@/components/command-palette";
import { ScrollProgress } from "@/components/scroll-progress";
import { SkeletonDashboard } from "@/components/skeleton";
import { Hero } from "@/components/sections/hero";
import { KpiStrip } from "@/components/sections/kpi-strip";
import { PortfolioGrowth } from "@/components/sections/portfolio-growth";
import { Contribution } from "@/components/sections/contribution";
import { Performance } from "@/components/sections/performance";
import { RiskAnalytics } from "@/components/sections/risk-analytics";
import { OHLCExplorer } from "@/components/sections/ohlc-explorer";
import { HoldingsTable } from "@/components/sections/holdings-table";
import { InsightsMode } from "@/components/sections/insights-mode";
import { WatchlistPanel, ActivityFeed } from "@/components/sections/watchlist-activity";
import { useMarketData, deriveAnalytics, makeInsight } from "@/lib/use-market-data";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { SettingsPage } from "@/components/sections/settings-page";
import { ReportsPage } from "@/components/sections/reports-page";
import { ActivityPage } from "@/components/sections/activity-page";
import { ProfilePage } from "@/components/sections/profile-page";
import { CompanyPage } from "@/components/sections/company-page";

// ──────────────────────────────────────────────
// Error state
// ──────────────────────────────────────────────
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 20, textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "var(--radius-xl)", background: "var(--loss-bg)", border: "1px solid var(--loss-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AlertTriangle size={24} color="var(--accent-red)" />
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Data unavailable</div>
        <div style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 380, lineHeight: 1.6 }}>{message}</div>
      </div>
      <button
        onClick={onRetry}
        className="btn-ghost"
        style={{ display: "flex", gap: 8, alignItems: "center" }}
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main content
// ──────────────────────────────────────────────
function DashboardContent() {
  const { data, loading, error, timeframe, setTimeframe } = useMarketData();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  const { setTheme } = useTheme();
  const { getCompanyColor, hexToRgba } = require("@/lib/colors");

  // Sync sidebar state on mount
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    setSidebarCollapsed(stored === "true");
  }, []);

  // Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const analytics = useMemo(() => (data ? deriveAnalytics(data, timeframe) : null), [data, timeframe]);
  const insight = data && analytics ? makeInsight(data, analytics) : null;

  const handleNavigate = (target: string) => {
    setMobileSidebarOpen(false); // Close sidebar on mobile navigation
    if (target.startsWith("company-")) {
      setActiveCompany(target.split("-")[1]);
      setActiveSection("company");
    } else {
      setActiveCompany(null);
      setActiveSection(target);
    }
    const el = document.getElementById(`section-${target}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onCollapse={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className={`main-area${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
        <Navbar
          sidebarCollapsed={sidebarCollapsed}
          onSearchOpen={() => setCmdOpen(true)}
          lastUpdated={data?.generated_at ?? null}
          onNavigate={handleNavigate}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="page-content" id="main-content" tabIndex={-1}>
          <ScrollProgress />

          {loading && <SkeletonDashboard />}

          {!loading && error && (
            <ErrorState message={error} onRetry={() => window.location.reload()} />
          )}

          <AnimatePresence mode="wait">
            {!loading && data && analytics && insight && (
              <>
                {(activeSection === "dashboard" || activeSection === "portfolio") && (
                  <motion.div
                    key="main-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Top Company Switcher */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 8, marginTop: 16 }}>
                      {data.tickers.map(t => (
                        <button
                          key={t}
                          onClick={() => handleNavigate(`company-${t}`)}
                          style={{
                            padding: "6px 16px",
                            borderRadius: "var(--radius-full)",
                            border: `1px solid var(--border-subtle)`,
                            background: "transparent",
                            color: "var(--text-secondary)",
                            fontSize: 13,
                            fontWeight: 600,
                            fontFamily: "var(--font-mono)",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseOver={(e) => {
                            const c = getCompanyColor(t);
                            e.currentTarget.style.color = c;
                            e.currentTarget.style.borderColor = c;
                            e.currentTarget.style.background = hexToRgba(c, 0.1);
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.color = "var(--text-secondary)";
                            e.currentTarget.style.borderColor = "var(--border-subtle)";
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {/* Hero */}
                    <div id="section-dashboard">
                  <Hero
                    data={data}
                    analytics={analytics}
                  />
                </div>

                {/* KPI Strip */}
                <div id="section-portfolio" style={{ marginTop: 24 }}>
                  <KpiStrip data={data} analytics={analytics} />
                </div>

                {/* Watchlist + Activity sidebar row */}
                <div className="two-col-grid" style={{ marginTop: 48 }}>
                  <WatchlistPanel />
                  <ActivityFeed />
                </div>

                {/* Portfolio Growth */}
                <div id="section-market">
                  <PortfolioGrowth analytics={analytics} insight={insight} timeframe={timeframe} setTimeframe={setTimeframe} />
                </div>

                {/* Contribution */}
                <Contribution analytics={analytics} />

                {/* Performance */}
                <div id="section-analytics">
                  <Performance analytics={analytics} />
                </div>

                {/* Risk */}
                <RiskAnalytics data={data} analytics={analytics} />

                {/* OHLC Explorer */}
                <OHLCExplorer />

                {/* Insights Mode */}
                <InsightsMode data={data} analytics={analytics} />

                {/* Holdings Table */}
                <div id="section-watchlist">
                  <HoldingsTable assets={data.portfolio.assets} />
                </div>

                {/* Footer */}
                <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Spring Street Market Intelligence</div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
                      Data powered by Yahoo Finance. For informational purposes only. Not financial advice.
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                    v2.0 · {new Date().getFullYear()}
                  </div>
                </div>
              </motion.div>
            )}

                {activeSection === "reports" && (
                  <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ReportsPage data={data} analytics={analytics} />
                  </motion.div>
                )}

                {activeSection === "activity" && (
                  <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ActivityPage data={data} />
                  </motion.div>
                )}

                {activeSection === "company" && activeCompany && (
                  <motion.div key="company" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <CompanyPage ticker={activeCompany} data={data} onNavigate={handleNavigate} />
                  </motion.div>
                )}

                {activeSection === "settings" && (
                  <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SettingsPage />
                  </motion.div>
                )}

                {activeSection === "profile" && (
                  <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ProfilePage data={data} />
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile UX Elements */}
      <BottomNav
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onSearch={() => setCmdOpen(true)}
      />
      
      <FAB onClick={() => setCmdOpen(true)} />

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onNavigate={handleNavigate}
        onTheme={setTheme}
      />
    </div>
  );
}

// ──────────────────────────────────────────────
// Root export with providers
// ──────────────────────────────────────────────
export function App() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}
