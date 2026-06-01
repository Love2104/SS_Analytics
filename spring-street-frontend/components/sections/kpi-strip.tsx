"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { InsightsResponse } from "@/types/market";
import type { DerivedAnalytics } from "@/lib/use-market-data";
import { currency, signedPercent, number, percent } from "@/components/format";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { getCompanyColor, hexToRgba } from "@/lib/colors";

function AnimatedNumber({ value, formatter }: { value: number; formatter: (v: number) => string }) {
  const [display, setDisplay] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) { setDisplay(value); return; }
    const start = performance.now();
    const duration = 1100;
    let raf = 0;
    function tick(now: number) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);

  return <>{formatter(display)}</>;
}

function Sparkline({ values, positive, customColor }: { values: number[]; positive: boolean; customColor?: string }) {
  const color = customColor || (positive ? "var(--accent-green)" : "var(--accent-red)");
  const data = values.map((v, i) => ({ v, i }));
  return (
    <div style={{ height: 36, marginTop: "auto" }}>
      <ResponsiveContainer width="100%" height={36}>
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${color.replace(/[^a-zA-Z0-9]/g, "")}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-${color.replace(/[^a-zA-Z0-9]/g, "")})`}
            dot={false}
            animationDuration={800}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: number;
  detail: string;
  positive: boolean;
  formatter: (v: number) => string;
  sparkValues: number[];
  delay?: number;
  color?: string;
}

function KpiCard({ label, value, detail, positive, formatter, sparkValues, delay = 0, color }: KpiCardProps) {
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  const badgeColor = color || (positive ? "var(--accent-green)" : "var(--accent-red)");
  const badgeBg = color ? hexToRgba(color, 0.1) : (positive ? "var(--gain-bg)" : "var(--loss-bg)");
  const badgeBorder = color ? hexToRgba(color, 0.3) : (positive ? "var(--gain-border)" : "var(--loss-border)");

  return (
    <motion.div
      className="card card--lift kpi-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      tabIndex={0}
      role="region"
      aria-label={`${label}: ${formatter(value)}`}
    >
      <div className="kpi-card-header">
        <span className="kpi-label">{label}</span>
        <div
          className="kpi-trend-badge"
          style={{ background: badgeBg, color: badgeColor, border: `1px solid ${badgeBorder}` }}
        >
          <Icon size={10} />
        </div>
      </div>

      <div className="kpi-value" style={color ? { color } : undefined}>
        <AnimatedNumber value={value} formatter={formatter} />
      </div>

      <div className="kpi-detail">{detail}</div>

      <Sparkline values={sparkValues} positive={positive} customColor={color} />
    </motion.div>
  );
}

interface KpiStripProps {
  data: InsightsResponse;
  analytics: DerivedAnalytics;
}

export function KpiStrip({ data, analytics }: KpiStripProps) {
  const sparkValues = data.portfolio_history.slice(-90).map((s) => s.total_value);

  const cards = [
    {
      label: "Portfolio Value",
      value: analytics.latest.total_value,
      formatter: currency,
      detail: "Current mark-to-market value",
      positive: true,
    },
    {
      label: "Total Return",
      value: data.portfolio.total_return,
      formatter: signedPercent,
      detail: "Compound growth since inception",
      positive: data.portfolio.total_return >= 0,
    },
    {
      label: "Annualized Return",
      value: data.portfolio.cagr,
      formatter: signedPercent,
      detail: "CAGR — long-run return velocity",
      positive: data.portfolio.cagr >= 0,
    },
    {
      label: "Sharpe Ratio",
      value: data.portfolio.sharpe,
      formatter: (v: number) => number(v, 2),
      detail: "Risk-adjusted return quality",
      positive: data.portfolio.sharpe >= 1,
    },
    {
      label: "Best Performer",
      value: analytics.best.cagr,
      formatter: () => analytics.best.ticker,
      detail: `${signedPercent(analytics.best.cagr)} CAGR`,
      positive: true,
      color: getCompanyColor(analytics.best.ticker),
    },
    {
      label: "Worst Performer",
      value: Math.abs(analytics.worst.cagr),
      formatter: () => analytics.worst.ticker,
      detail: `${signedPercent(analytics.worst.cagr)} CAGR`,
      positive: false,
      color: getCompanyColor(analytics.worst.ticker),
    },
  ];

  return (
    <div className="kpi-grid" role="region" aria-label="Key performance indicators">
      {cards.map((card, i) => (
        <KpiCard
          key={card.label}
          {...card}
          sparkValues={sparkValues}
          delay={i * 0.06}
        />
      ))}
    </div>
  );
}
