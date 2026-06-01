"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InsightsResponse } from "@/types/market";
import { getCompanyColor } from "@/lib/colors";
import { currency, signedPercent } from "@/components/format";

type EventType = "GAINS" | "LOSSES" | "MILESTONES";

interface ActivityEvent {
  id: string;
  date: string;
  type: EventType;
  ticker?: string;
  description: string;
  value: string;
  color: string;
}

export function ActivityPage({ data }: { data: InsightsResponse }) {
  const [filter, setFilter] = useState<"ALL" | EventType>("ALL");

  const events = useMemo(() => {
    const history = data.portfolio_history;
    if (!history || history.length < 2) return [];

    const result: ActivityEvent[] = [];

    // Milestones
    const inception = history[0];
    result.push({
      id: "inception",
      date: inception.date,
      type: "MILESTONES",
      description: "Portfolio Inception",
      value: currency(inception.total_value),
      color: "var(--accent-cyan)"
    });

    let maxVal = inception.total_value;
    let maxDate = inception.date;
    for (const d of history) {
      if (d.total_value > maxVal) {
        maxVal = d.total_value;
        maxDate = d.date;
      }
    }
    result.push({
      id: "ath",
      date: maxDate,
      type: "MILESTONES",
      description: "All-Time High Reached",
      value: currency(maxVal),
      color: "var(--accent-cyan)"
    });

    // Best/Worst per ticker
    const tickers = data.tickers;
    tickers.forEach(ticker => {
      let bestPct = -Infinity;
      let worstPct = Infinity;
      let bestDate = "";
      let worstDate = "";

      for (let i = 1; i < history.length; i++) {
        const prev = history[i - 1].contributions[ticker] || 1;
        const curr = history[i].contributions[ticker] || 1;
        const pct = ((curr - prev) / prev) * 100;
        
        if (pct > bestPct) { bestPct = pct; bestDate = history[i].date; }
        if (pct < worstPct) { worstPct = pct; worstDate = history[i].date; }
      }

      const color = getCompanyColor(ticker);

      if (bestPct !== -Infinity) {
        result.push({
          id: `best-${ticker}`,
          date: bestDate,
          type: "GAINS",
          ticker,
          description: "Best Single-Day Gain",
          value: `+${bestPct.toFixed(2)}%`,
          color
        });
      }

      if (worstPct !== Infinity) {
        result.push({
          id: `worst-${ticker}`,
          date: worstDate,
          type: "LOSSES",
          ticker,
          description: "Worst Single-Day Loss",
          value: `${worstPct.toFixed(2)}%`,
          color
        });
      }
    });

    // Sort by date descending
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data]);

  const filtered = filter === "ALL" ? events : events.filter(e => e.type === filter);

  return (
    <div className="section" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 100 }}>
      <div style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="section-title">Activity Feed</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>Historical market events and milestones.</p>
        </div>
        
        <div style={{ display: "flex", gap: 8, background: "var(--surface-3)", padding: 4, borderRadius: "var(--radius-full)", border: "1px solid var(--border-subtle)" }}>
          {["ALL", "GAINS", "LOSSES", "MILESTONES"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              style={{
                padding: "4px 12px",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                borderRadius: "var(--radius-full)",
                background: filter === f ? "var(--border-focus)" : "transparent",
                color: filter === f ? "var(--bg-base)" : "var(--text-secondary)",
                fontWeight: filter === f ? 600 : 400,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", marginLeft: 120 }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 1, background: "var(--border-subtle)" }} />
        
        <div style={{ display: "grid", gap: 24 }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((ev, i) => (
              <motion.div
                key={ev.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                style={{ position: "relative", display: "flex", alignItems: "center", gap: 24 }}
              >
                <div style={{ position: "absolute", left: -140, width: 100, textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)" }}>
                  {ev.date}
                </div>
                
                <div style={{ width: 11, height: 11, borderRadius: "50%", background: ev.color, border: "2px solid var(--bg-base)", position: "absolute", left: -5, zIndex: 1 }} />
                
                <div className="card card-pad" style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {ev.ticker && (
                      <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 600, color: ev.color, background: `${ev.color}22`, padding: "2px 8px", borderRadius: "var(--radius-sm)" }}>
                        {ev.ticker}
                      </span>
                    )}
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{ev.description}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: ev.type === "LOSSES" ? "var(--accent-red)" : ev.type === "GAINS" ? "var(--accent-green)" : "var(--text-primary)" }}>
                    {ev.value}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
