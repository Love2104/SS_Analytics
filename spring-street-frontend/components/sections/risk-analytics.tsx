"use client";

import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";
import type { InsightsResponse } from "@/types/market";
import type { DerivedAnalytics } from "@/lib/use-market-data";
import { percent, number } from "@/components/format";
import { ShieldCheck, TrendingDown, Zap, AlertTriangle, CheckCircle, Info } from "lucide-react";

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

// Composite risk gauge (semi-circle)
function RiskGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 60 ? "var(--accent-green)" : score >= 35 ? "var(--accent-amber)" : "var(--accent-red)";
  const r = 80;
  const cx = 120, cy = 130;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ * 0.5; // half circle

  return (
    <div className="risk-gauge-wrap">
      <div style={{ position: "relative" }}>
        <svg width="240" height="140" viewBox="0 0 240 140" aria-label={`Risk score: ${score}`}>
          {/* Track */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Fill */}
          <motion.path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${filled} ${circ}` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
            style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
          />
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = Math.PI + (tick / 100) * Math.PI;
            const x1 = cx + (r - 16) * Math.cos(angle);
            const y1 = cy + (r - 16) * Math.sin(angle);
            const x2 = cx + (r - 6) * Math.cos(angle);
            const y2 = cy + (r - 6) * Math.sin(angle);
            return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--border-default)" strokeWidth="1.5" />;
          })}
          {/* Labels */}
          {[
            { tick: 0, label: "0" },
            { tick: 50, label: "50" },
            { tick: 100, label: "100" },
          ].map((t) => {
            const angle = Math.PI + (t.tick / 100) * Math.PI;
            const x = cx + (r - 28) * Math.cos(angle);
            const y = cy + (r - 28) * Math.sin(angle);
            return (
              <text key={t.tick} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">{t.label}</text>
            );
          })}
        </svg>
        {/* Center value */}
        <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, textAlign: "center" }}>
          <div className="risk-score-num" style={{ color }}>{Math.round(score)}</div>
          <div className="risk-score-label">/ 100 — {label}</div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail, color }: { icon: React.ElementType; label: string; value: string; detail: string; color: string }) {
  return (
    <motion.div
      className="card card--lift"
      style={{ padding: "20px" }}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{ marginTop: 20, fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
        {value}
      </div>
      <div style={{ marginTop: 4, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
        {label}
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.4 }}>{detail}</div>
    </motion.div>
  );
}

interface RiskAnalyticsProps {
  data: InsightsResponse;
  analytics: DerivedAnalytics;
}

export function RiskAnalytics({ data, analytics }: RiskAnalyticsProps) {
  const riskLabel = analytics.riskScore >= 60 ? "Low Risk" : analytics.riskScore >= 35 ? "Moderate" : "High Risk";

  const radialData = [
    { name: "Risk Score", value: analytics.riskScore, fill: "#00d4ff" },
    { name: "Sharpe Quality", value: Math.min(100, data.portfolio.sharpe * 40), fill: "#10b981" },
    { name: "Drawdown Pressure", value: Math.min(100, data.portfolio.max_drawdown * 2), fill: "#ef4444" },
  ];

  const metricCards = [
    {
      icon: ShieldCheck,
      label: "Sharpe Ratio",
      value: number(data.portfolio.sharpe, 2),
      detail: data.portfolio.sharpe >= 1 ? "Good risk-adjusted returns — above the 1.0 threshold." : "Below optimal. Returns may not justify volatility.",
      color: data.portfolio.sharpe >= 1 ? "var(--accent-green)" : "var(--accent-amber)",
    },
    {
      icon: TrendingDown,
      label: "Max Drawdown",
      value: `-${percent(data.portfolio.max_drawdown)}`,
      detail: data.portfolio.max_drawdown < 25 ? "Moderate peak-to-trough decline. Well within historical norms." : "Significant drawdown observed. Review downside hedging.",
      color: data.portfolio.max_drawdown < 25 ? "var(--accent-amber)" : "var(--accent-red)",
    },
    {
      icon: Zap,
      label: "Annualized Vol.",
      value: `${percent(data.portfolio.volatility)}`,
      detail: data.portfolio.volatility < 20 ? "Relatively contained volatility for a growth-oriented portfolio." : "Elevated volatility. Diversification may reduce oscillation.",
      color: data.portfolio.volatility < 20 ? "var(--accent-green)" : "var(--accent-amber)",
    },
  ];

  return (
    <section className="section" aria-label="Risk analytics">
      <SectionHeader eyebrow="04 · Risk" title="Risk quality and downside characteristics" />

      <div style={{ display: "grid", gridTemplateColumns: "340px minmax(0, 1fr)", gap: 16, alignItems: "start" }}>
        {/* Gauge */}
        <motion.div
          className="card card-pad"
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <RiskGauge score={analytics.riskScore} label={riskLabel} />

          {/* Radial chart */}
          <div style={{ width: "100%", height: 180 }}>
            <div className="chart-title" style={{ marginBottom: 8, textAlign: "center" }}>Component Breakdown</div>
            <ResponsiveContainer width="100%" height={160}>
              <RadialBarChart
                innerRadius="28%"
                outerRadius="85%"
                data={radialData}
                startAngle={180}
                endAngle={-180}
              >
                <RadialBar dataKey="value" background={{ fill: "var(--border-subtle)" }} cornerRadius={8} />
                <Tooltip
                  formatter={(v: unknown) => [`${Number(v).toFixed(1)}`, ""]}
                  contentStyle={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: "var(--radius-lg)", fontSize: 12 }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
              {radialData.map((d) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.fill }} />
                    <span style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: d.fill }}>{d.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: metric cards + insights */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="grid-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {metricCards.map((card) => (
              <MetricCard key={card.label} {...card} />
            ))}
          </div>

          {/* Risk insights */}
          <div className="card card-pad">
            <div className="chart-title" style={{ marginBottom: 14 }}>Risk Assessment</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  icon: data.portfolio.sharpe >= 1 ? CheckCircle : AlertTriangle,
                  color: data.portfolio.sharpe >= 1 ? "var(--accent-green)" : "var(--accent-amber)",
                  title: "Return Quality",
                  body: `Sharpe of ${data.portfolio.sharpe.toFixed(2)} ${data.portfolio.sharpe >= 1 ? "exceeds" : "falls below"} the 1.0 quality threshold. ${data.portfolio.sharpe >= 1 ? "Risk-adjusted performance is solid." : "Consider whether volatility is compensated."}`,
                },
                {
                  icon: Info,
                  color: "var(--accent-blue)",
                  title: "Drawdown Context",
                  body: `Maximum observed decline of ${percent(data.portfolio.max_drawdown)} from peak. Recovery capability is reflected in the current composite risk score of ${Math.round(analytics.riskScore)}/100.`,
                },
                {
                  icon: data.portfolio.volatility < 25 ? CheckCircle : AlertTriangle,
                  color: data.portfolio.volatility < 25 ? "var(--accent-green)" : "var(--accent-amber)",
                  title: "Volatility Profile",
                  body: `Annualized volatility of ${percent(data.portfolio.volatility)} is ${data.portfolio.volatility < 20 ? "within a healthy range for a diversified equity portfolio." : "elevated. Sector concentration or individual stock risk may be driving dispersion."}`,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "var(--radius-md)", background: `${item.color}18`, border: `1px solid ${item.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <Icon size={14} color={item.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>{item.title}</div>
                      <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
