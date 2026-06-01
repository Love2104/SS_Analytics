"use client";

import { motion } from "framer-motion";
import {
  Area, AreaChart, CartesianGrid, Line, ResponsiveContainer,
  Tooltip, XAxis, YAxis, ReferenceLine
} from "recharts";
import type { InsightsResponse } from "@/types/market";
import type { DerivedAnalytics, Insight, Timeframe } from "@/lib/use-market-data";
import { compactCurrency, currency, signedPercent } from "@/components/format";
import { getCompanyColor, hexToRgba } from "@/lib/colors";
import { TrendingUp, CalendarDays } from "lucide-react";
import { TimeframeSelector } from "./hero";

function SectionHeader({ eyebrow, title, aside }: { eyebrow: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="section-header">
      <div className="section-label">
        <div className="section-accent-bar" />
        <div>
          <div className="section-eyebrow">{eyebrow}</div>
          <h2 className="section-title">{title}</h2>
        </div>
      </div>
      {aside}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "12px 16px", boxShadow: "var(--shadow-lg)", minWidth: 220 }}>
      <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)" }}>
        <CalendarDays size={12} style={{ display: "inline", marginRight: 6, verticalAlign: "-2px" }} />
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {payload.map((p) => (
          <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{p.name}</span>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              {typeof p.value === "number" ? currency(p.value) : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PortfolioGrowthProps {
  analytics: DerivedAnalytics;
  insight: Insight;
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
}

export function PortfolioGrowth({ analytics, insight, timeframe, setTimeframe }: PortfolioGrowthProps) {
  const minVal = Math.min(...analytics.growth.map((p) => Math.min(p.portfolio, p.baseline)));
  const maxVal = Math.max(...analytics.growth.map((p) => Math.max(p.portfolio, p.baseline)));
  const top3 = [...analytics.contribution].sort((a,b) => b.value - a.value).slice(0, 3);

  return (
    <section className="section" aria-label="Portfolio growth chart">
      <SectionHeader
        eyebrow="01 · Performance"
        title="Growth versus initial capital base"
        aside={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "var(--accent-cyan)" }} />
                Portfolio
              </div>
              <div className="legend-item">
                <div className="legend-dash" style={{ borderColor: "var(--accent-amber)" }} />
                Baseline
              </div>
            </div>
          </div>
        }
      />

      <div className="chart-grid-layout">
        {/* Main chart */}
        <motion.div
          className="card card-pad"
          style={{ minHeight: 480 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="chart-header">
            <div>
              <div className="chart-title">Portfolio Value Over Time</div>
              <div className="chart-subtitle">Rebased to initial investment capital</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--accent-green)", fontFamily: "var(--font-mono)" }}>
              <TrendingUp size={14} />
              All-time tracking
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={analytics.growth} margin={{ top: 10, right: 8, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--chart-tick)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                minTickGap={60}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "var(--chart-tick)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                tickFormatter={compactCurrency}
                width={72}
                tickLine={false}
                axisLine={false}
                domain={[minVal * 0.97, maxVal * 1.02]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                dataKey="portfolio"
                name="Portfolio"
                stroke="#00d4ff"
                strokeWidth={2.5}
                fill="url(#portfolioGradient)"
                dot={false}
                activeDot={{ r: 5, fill: "#00d4ff", stroke: "#000", strokeWidth: 2 }}
                animationDuration={900}
              />
              <Area
                dataKey="baseline"
                name="Initial Capital"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                fill="transparent"
                dot={false}
                activeDot={{ r: 4, fill: "#f59e0b", stroke: "var(--bg-base)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
            <TimeframeSelector timeframe={timeframe} setTimeframe={setTimeframe} />
          </div>
        </motion.div>

        {/* Insights stack */}
        <motion.div
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
          initial={{ opacity: 0, x: 12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Main Insight Panel */}
          <div className="card" style={{ padding: "20px", background: "var(--surface-1)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
              AI Analysis
            </h3>
            
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: "var(--accent-cyan)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                <TrendingUp size={14} /> Key Finding
              </div>
              <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5 }}>
                {insight.what}
              </p>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: "var(--accent-amber)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                <TrendingUp size={14} /> Driver
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {insight.why}
              </p>
            </div>
            
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: "var(--accent-green)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                <TrendingUp size={14} /> Takeaway
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {insight.action}
              </p>
            </div>
          </div>

          {/* Top 3 Performers */}
          <div className="card" style={{ padding: "20px", background: "var(--surface-1)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
              Top 3 Contributors
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {top3.map((item, i) => (
                <div key={item.ticker} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: hexToRgba(item.fill, 0.15), color: item.fill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.ticker}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)" }}>
                      {currency(item.value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini return summary */}
          <div className="card" style={{ padding: "20px", background: "var(--surface-1)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
              Period Summary
            </h3>
            {[
              { label: "Start", value: compactCurrency(analytics.growth[0]?.portfolio ?? 0) },
              { label: "End", value: compactCurrency(analytics.growth[analytics.growth.length - 1]?.portfolio ?? 0) },
              { label: "Data Points", value: analytics.growth.length.toLocaleString() },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{row.label}</span>
                <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
