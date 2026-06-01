"use client";

import { motion } from "framer-motion";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line,
  LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import type { DerivedAnalytics } from "@/lib/use-market-data";
import { percent, signedPercent } from "@/components/format";

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="section-header">
      <div className="section-label">
        <div className="section-accent-bar" />
        <div>
          <div className="section-eyebrow">{eyebrow}</div>
          <h2 className="section-title">{title}</h2>
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label, formatter }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: "var(--radius-lg)", padding: "10px 14px", boxShadow: "var(--shadow-lg)" }}>
      <div style={{ fontSize: 10, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 600, color: p.color }}>
          {formatter ? formatter(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

// Monthly heatmap
function MonthlyHeatmap({ heatmap }: { heatmap: DerivedAnalytics["heatmap"] }) {
  const maxAbs = Math.max(...heatmap.map((c) => Math.abs(c.value)), 1);
  return (
    <div className="heatmap-grid">
      {heatmap.map((cell) => {
        const pos = cell.value >= 0;
        const intensity = 0.25 + (Math.abs(cell.value) / maxAbs) * 0.6;
        return (
          <motion.div
            key={cell.month}
            className={`heatmap-cell heatmap-cell--${pos ? "pos" : "neg"}`}
            style={{ opacity: intensity }}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: intensity, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.08, opacity: 1 }}
            transition={{ duration: 0.25 }}
            title={`${cell.label}: ${signedPercent(cell.value)}`}
          >
            <div className="heatmap-month">{cell.label}</div>
            <div className={`heatmap-val ${pos ? "pos" : "neg"}`}>{signedPercent(cell.value, 1)}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

interface PerformanceProps {
  analytics: DerivedAnalytics;
}

export function Performance({ analytics }: PerformanceProps) {
  return (
    <section className="section" aria-label="Performance analytics">
      <SectionHeader eyebrow="03 · Behavior" title="Return consistency, volatility & drawdown" />

      {/* Heatmap — full width */}
      <motion.div
        className="card card-pad"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        style={{ marginBottom: 16 }}
      >
        <div className="chart-header">
          <div>
            <div className="chart-title">Monthly Return Heatmap</div>
            <div className="chart-subtitle">36-month rolling view — green = gain, red = loss</div>
          </div>
          <div className="insight-block" style={{ maxWidth: 280, padding: "8px 12px" }}>
            <div className="insight-tag">Pattern</div>
            <p className="insight-body" style={{ marginTop: 4, fontSize: 12 }}>
              More green months than red suggests a positive trend bias across the observed period.
            </p>
          </div>
        </div>
        <MonthlyHeatmap heatmap={analytics.heatmap} />
      </motion.div>

      {/* 3-col grid: rolling return, volatility, drawdown */}
      <div className="grid-3">
        {/* Rolling 1Y Return */}
        <motion.div
          className="card card-pad"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="chart-header">
            <div>
              <div className="chart-title">Rolling 1Y Return</div>
              <div className="chart-subtitle">Trailing 12-month performance</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analytics.rollingReturns} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="date" hide tick={{ fontSize: 9 }} />
              <YAxis tick={{ fill: "var(--chart-tick)", fontSize: 10, fontFamily: "var(--font-mono)" }} tickFormatter={(v) => `${v.toFixed(0)}%`} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip formatter={signedPercent} />} />
              <Line dataKey="rolling" stroke="#10b981" strokeWidth={2} dot={false} animationDuration={800} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 12 }} className="insight-block insight-block--action">
            <div className="insight-tag">Why It Matters</div>
            <p className="insight-body" style={{ marginTop: 6 }}>
              Consistent positive rolling returns indicate compounding is working as intended.
            </p>
          </div>
        </motion.div>

        {/* Realized Volatility */}
        <motion.div
          className="card card-pad"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.10 }}
        >
          <div className="chart-header">
            <div>
              <div className="chart-title">Realized Volatility</div>
              <div className="chart-subtitle">63-day rolling annualized vol.</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.volatility.slice(-120)} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis tick={{ fill: "var(--chart-tick)", fontSize: 10, fontFamily: "var(--font-mono)" }} tickFormatter={(v) => `${v.toFixed(0)}%`} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip formatter={percent} />} />
              <Bar dataKey="volatility" fill="#8b5cf6" fillOpacity={0.75} radius={[3, 3, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 12 }} className="insight-block insight-block--neutral">
            <div className="insight-tag">Interpretation</div>
            <p className="insight-body" style={{ marginTop: 6 }}>
              Lower bars represent calmer markets. Spikes indicate elevated uncertainty periods.
            </p>
          </div>
        </motion.div>

        {/* Drawdown */}
        <motion.div
          className="card card-pad"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <div className="chart-header">
            <div>
              <div className="chart-title">Drawdown Path</div>
              <div className="chart-subtitle">Peak-to-trough decline</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={analytics.drawdown.slice(-400)} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="ddGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis tick={{ fill: "var(--chart-tick)", fontSize: 10, fontFamily: "var(--font-mono)" }} tickFormatter={(v) => `${v.toFixed(0)}%`} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
              <Area dataKey="drawdown" stroke="#ef4444" strokeWidth={1.5} fill="url(#ddGrad)" dot={false} animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 12 }} className="insight-block insight-block--risk">
            <div className="insight-tag">Risk Signal</div>
            <p className="insight-body" style={{ marginTop: 6 }}>
              Deep drawdowns test conviction. A flat line near 0% signals strong recovery ability.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
