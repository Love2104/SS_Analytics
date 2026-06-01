"use client";

import { motion } from "framer-motion";
import type { InsightsResponse } from "@/types/market";
import type { DerivedAnalytics } from "@/lib/use-market-data";
import { currency, signedPercent } from "@/components/format";
import { TrendingUp, TrendingDown, Shield, AlertOctagon, Lightbulb, Target } from "lucide-react";

interface InsightsModeProps {
  data: InsightsResponse;
  analytics: DerivedAnalytics;
}

type InsightItem = {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  title: string;
  body: string;
};

export function InsightsMode({ data, analytics }: InsightsModeProps) {
  const p = data.portfolio;
  const { best, worst, contribution } = analytics;

  const strengths: InsightItem[] = [
    {
      icon: TrendingUp,
      color: "var(--accent-green)",
      bg: "var(--gain-bg)",
      border: "var(--gain-border)",
      title: `${best.ticker} leads the portfolio`,
      body: `${best.ticker} delivers the highest CAGR at ${signedPercent(best.cagr)}, demonstrating strong compounding capability over the measured period.`,
    },
    {
      icon: Shield,
      color: "var(--accent-blue)",
      bg: "rgba(59,130,246,0.08)",
      border: "rgba(59,130,246,0.2)",
      title: "Sharpe ratio above threshold",
      body: `A Sharpe of ${p.sharpe.toFixed(2)} indicates risk-adjusted returns are favorable — each unit of risk is being rewarded ${p.sharpe > 1.2 ? "very well" : "adequately"}.`,
    },
  ];

  const weaknesses: InsightItem[] = [
    {
      icon: TrendingDown,
      color: "var(--accent-red)",
      bg: "var(--loss-bg)",
      border: "var(--loss-border)",
      title: `${worst.ticker} is the weakest compounder`,
      body: `${worst.ticker} delivers only ${signedPercent(worst.cagr)} CAGR — significantly trailing the portfolio average. Review whether the thesis remains intact.`,
    },
    {
      icon: AlertOctagon,
      color: "var(--accent-amber)",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.2)",
      title: `Max drawdown at ${p.max_drawdown.toFixed(1)}%`,
      body: `The portfolio has experienced a peak-to-trough decline of ${p.max_drawdown.toFixed(1)}%. Understanding the cause of this drawdown is critical for position sizing.`,
    },
  ];

  const opportunities: InsightItem[] = [
    {
      icon: Lightbulb,
      color: "var(--accent-purple)",
      bg: "rgba(139,92,246,0.08)",
      border: "rgba(139,92,246,0.2)",
      title: "Rebalancing opportunity",
      body: `${contribution[0]?.name} has grown to ${contribution[0]?.share.toFixed(1)}% of portfolio value. A rebalance back toward equal weight may reset risk exposure.`,
    },
    {
      icon: Target,
      color: "var(--accent-cyan)",
      bg: "rgba(0,212,255,0.08)",
      border: "rgba(0,212,255,0.2)",
      title: "Volatility compression phase",
      body: `Periods of lower realized volatility often precede directional moves. Current market sentiment score of ${analytics.fearGreed.toFixed(0)} suggests positioning may be appropriate to review.`,
    },
  ];

  function renderCategory(title: string, items: InsightItem[], delay = 0) {
    return (
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", marginBottom: 12 }}>
          {title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: delay + i * 0.08 }}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: "var(--radius-lg)",
                  border: `1px solid ${item.border}`,
                  background: item.bg,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "var(--radius-md)",
                  background: `${item.color}18`,
                  border: `1px solid ${item.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Icon size={17} color={item.color} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 5 }}>{item.title}</div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{item.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section className="section" aria-label="AI-style market insights">
      <div className="section-header">
        <div className="section-label">
          <div className="section-accent-bar" />
          <div>
            <div className="section-eyebrow">07 · Insights</div>
            <h2 className="section-title">SWOT analysis & portfolio observations</h2>
          </div>
        </div>
      </div>

      <div className="two-col-grid">
        <motion.div
          className="card card-pad"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          {renderCategory("✦ Strengths", strengths, 0)}
          {renderCategory("▾ Weaknesses", weaknesses, 0.1)}
        </motion.div>

        <motion.div
          className="card card-pad"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.08 }}
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          {renderCategory("◎ Opportunities", opportunities, 0.15)}

          {/* Portfolio summary table */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", marginBottom: 12 }}>
              ▲ Portfolio Snapshot
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              {[
                { label: "Portfolio Value", value: currency(analytics.latest.total_value) },
                { label: "Total Return", value: signedPercent(p.total_return), color: p.total_return >= 0 ? "var(--accent-green)" : "var(--accent-red)" },
                { label: "CAGR", value: signedPercent(p.cagr), color: p.cagr >= 0 ? "var(--accent-green)" : "var(--accent-red)" },
                { label: "Sharpe Ratio", value: p.sharpe.toFixed(2) },
                { label: "Volatility", value: `${p.volatility.toFixed(1)}%` },
                { label: "Max Drawdown", value: `-${p.max_drawdown.toFixed(1)}%`, color: "var(--accent-red)" },
                { label: "Holdings", value: data.tickers.join(", ") },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "11px 14px",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 600, color: row.color ?? "var(--text-primary)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
