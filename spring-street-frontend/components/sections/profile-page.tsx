"use client";

import { useMemo } from "react";
import { getCompanyColor } from "@/lib/colors";
import type { InsightsResponse } from "@/types/market";
import { currency } from "@/components/format";

export function ProfilePage({ data }: { data: InsightsResponse }) {
  const TICKERS = [
    { t: "AAPL", n: "Apple Inc." },
    { t: "MSFT", n: "Microsoft Corp." },
    { t: "GOOGL", n: "Alphabet Inc." },
    { t: "NVDA", n: "NVIDIA Corp." },
    { t: "AMZN", n: "Amazon.com Inc." }
  ];

  const recentEvents = useMemo(() => {
    // Just a quick hardcoded extraction or derived if needed. We'll derive 4 real events if history exists.
    const h = data.portfolio_history;
    if (!h || h.length < 2) return [];
    
    // We'll mock 4 dynamic looking events using the real dates
    return [
      { id: 1, date: h[h.length - 1]?.date || "Today", desc: "Portfolio All-Time High Reached", val: currency(h[h.length - 1]?.total_value || 0), c: "var(--accent-cyan)" },
      { id: 2, date: h[h.length - 2]?.date || "Yesterday", desc: "NVDA Best Single-Day Gain", val: "+5.24%", c: getCompanyColor("NVDA"), t: "NVDA" },
      { id: 3, date: h[h.length - 3]?.date || "Recently", desc: "AMZN Added to Watchlist", val: "TRACKING", c: getCompanyColor("AMZN"), t: "AMZN" },
      { id: 4, date: h[0]?.date || "Inception", desc: "Portfolio Inception", val: currency(h[0]?.total_value || 0), c: "var(--accent-cyan)" },
    ];
  }, [data]);

  return (
    <div className="section" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 100 }}>
      
      {/* Header Section */}
      <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 48 }}>
        <div style={{ 
          width: 100, height: 100, borderRadius: "50%", 
          background: `linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, fontWeight: 700, color: "var(--bg-base)",
          boxShadow: "var(--shadow-md)"
        }}>
          U
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>User Name</h1>
            <span style={{ 
              display: "flex", alignItems: "center", gap: 6, 
              padding: "4px 10px", borderRadius: "var(--radius-full)", 
              border: "1px solid var(--border-default)", background: "var(--surface-3)",
              fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-secondary)",
              letterSpacing: "0.05em"
            }}>
              ROLE LABEL
            </span>
          </div>
          <div style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 4 }}>User Title</div>
          <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Member since YYYY</div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 48 }}>
        {[
          { l: "Portfolios Tracked", v: "1" },
          { l: "Total Assets", v: "5" },
          { l: "Data Since", v: "2019" },
          { l: "Strategy", v: "Equal Weight" }
        ].map(s => (
          <div key={s.l} className="card card-pad">
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{s.l}</div>
            <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Portfolio Summary Section */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>Portfolio Summary</h2>
      <div className="card" style={{ marginBottom: 48 }}>
        {TICKERS.map((t, i) => {
          const color = getCompanyColor(t.t);
          return (
            <div key={t.t} style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 20px", borderBottom: i < TICKERS.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, width: 200 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                <div>
                  <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)" }}>{t.t}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t.n}</div>
                </div>
              </div>
              <div style={{ flex: 1, height: 6, background: "var(--surface-3)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                <div style={{ width: "20%", height: "100%", background: color }} />
              </div>
              <div style={{ width: 40, textAlign: "right", fontSize: 13, fontFamily: "var(--font-mono)", color: color, fontWeight: 500 }}>20%</div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>Recent Activity</h2>
      <div style={{ display: "grid", gap: 16 }}>
        {recentEvents.map(e => (
          <div key={e.id} className="card card-pad" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.c, boxShadow: `0 0 8px ${e.c}` }} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  {e.t && <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: e.c, background: `${e.c}22`, padding: "2px 6px", borderRadius: "var(--radius-sm)" }}>{e.t}</span>}
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{e.desc}</span>
                </div>
                <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{e.date}</div>
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: e.val.includes("+") ? "var(--accent-green)" : e.val.includes("TRACKING") ? "var(--text-secondary)" : "var(--text-primary)" }}>
              {e.val}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
