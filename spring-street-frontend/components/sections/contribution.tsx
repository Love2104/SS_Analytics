"use client";

import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Treemap } from "recharts";
import type { DerivedAnalytics } from "@/lib/use-market-data";
import { currency, percent } from "@/components/format";

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

function TooltipBox({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string; share: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: "var(--radius-lg)", padding: "12px 16px", boxShadow: "var(--shadow-lg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.payload.fill }} />
        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{d.name}</span>
      </div>
      <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{currency(d.value)}</div>
      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{percent(d.payload.share)} of portfolio</div>
    </div>
  );
}

function TreemapContent(props: { x?: number; y?: number; width?: number; height?: number; name?: string; fill?: string; value?: number }) {
  const { x = 0, y = 0, width = 0, height = 0, name, fill, value } = props;
  if (width < 30 || height < 30) return null;
  return (
    <g>
      <rect x={x + 2} y={y + 2} width={Math.max(0, width - 4)} height={Math.max(0, height - 4)} fill={fill} rx={4} />
      <text x={x + width / 2} y={y + height / 2 - 4} textAnchor="middle" fill="var(--bg-base)" fontSize={13} fontWeight={700} fontFamily="var(--font-mono)">
        {name}
      </text>
      {height > 50 && value !== undefined && (
        <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" fill="var(--bg-base)" opacity={0.8} fontSize={11} fontFamily="var(--font-mono)" fontWeight={500}>
          {currency(value)}
        </text>
      )}
    </g>
  );
}

// Capital flow SVG Sankey
function CapitalFlow({ contribution }: { contribution: DerivedAnalytics["contribution"] }) {
  const total = contribution.reduce((s, c) => s + c.value, 0);
  const W = 320, H = 240;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxHeight: 240 }} aria-label="Capital allocation flow">
      {/* Portfolio node */}
      <rect x={10} y={40} width={52} height={160} rx={10} fill="var(--surface-3)" stroke="var(--border-default)" strokeWidth={1} />
      <text x={36} y={30} textAnchor="middle" fill="var(--text-tertiary)" fontSize={9} fontFamily="var(--font-mono)" style={{ textTransform: "uppercase" }}>Portfolio</text>
      <text x={36} y={128} textAnchor="middle" fill="var(--accent-cyan)" fontSize={9} fontFamily="var(--font-mono)" fontWeight={600} transform="rotate(-90 36 128)">
        {currency(total).replace("$", "$")}
      </text>

      {/* Flow paths & asset nodes */}
      {contribution.map((item, i) => {
        const yCenter = 40 + (i + 0.5) * (160 / contribution.length);
        const strokeW = Math.max(2, (item.value / total) * 50);
        const nodeY = yCenter - 14;

        return (
          <g key={item.ticker}>
            {/* Bezier path */}
            <path
              d={`M 62 ${yCenter} C 120 ${yCenter} 160 ${yCenter} 220 ${yCenter}`}
              fill="none"
              stroke={item.fill}
              strokeWidth={strokeW}
              strokeLinecap="round"
              opacity={0.4}
            />
            {/* Asset node */}
            <rect x={220} y={nodeY} width={68} height={28} rx={6} fill={item.fill} />
            <text x={254} y={nodeY + 18} textAnchor="middle" fill="var(--bg-base)" fontSize={11} fontWeight={700} fontFamily="var(--font-mono)">{item.ticker}</text>
          </g>
        );
      })}
    </svg>
  );
}

interface ContributionProps {
  analytics: DerivedAnalytics;
}

export function Contribution({ analytics }: ContributionProps) {
  const { contribution } = analytics;
  const topContributor = [...contribution].sort((a,b) => b.value - a.value)[0];

  return (
    <section className="section" aria-label="Asset contribution analysis">
      <SectionHeader eyebrow="02 · Attribution" title="Where portfolio value is concentrated" />

      <div className="grid-1-to-3">
        {/* Donut chart */}
        <motion.div
          className="card card-pad"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="chart-header" style={{ marginBottom: 0 }}>
            <div>
              <div className="chart-title">Allocation Weights</div>
              <div className="chart-subtitle">% of total portfolio value</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={contribution}
                dataKey="value"
                nameKey="ticker"
                innerRadius={68}
                outerRadius={100}
                paddingAngle={3}
                strokeWidth={0}
                animationDuration={800}
              >
                {contribution.map((item) => (
                  <Cell key={item.ticker} fill={item.fill} />
                ))}
              </Pie>
              <Tooltip content={<TooltipBox />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend below */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {contribution.map((item) => (
              <div key={item.ticker} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.fill }} />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.name}</span>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)" }}>{percent(item.share)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Treemap */}
        <motion.div
          className="card card-pad"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          <div className="chart-header">
            <div>
              <div className="chart-title">Relative Position Size</div>
              <div className="chart-subtitle">Proportional market value</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <Treemap
              data={contribution}
              dataKey="value"
              nameKey="ticker"
              stroke="var(--bg-base)"
              content={<TreemapContent />}
              animationDuration={800}
            />
          </ResponsiveContainer>
          <div style={{ marginTop: 12 }} className="insight-block">
            <div className="insight-tag">Key Finding</div>
            <p className="insight-body" style={{ marginTop: 6 }}>
              {topContributor?.name} drives {percent(topContributor?.share ?? 0)} of the portfolio. Monitor for concentration risk.
            </p>
          </div>
        </motion.div>

        {/* Capital Flow */}
        <motion.div
          className="card card-pad"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.16 }}
        >
          <div className="chart-header">
            <div>
              <div className="chart-title">Capital Flow</div>
              <div className="chart-subtitle">Portfolio allocation by asset</div>
            </div>
          </div>
          <CapitalFlow contribution={contribution} />

          {/* Bar chart below */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            {contribution.map((item) => (
              <div key={item.ticker}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{item.ticker}</span>
                  <span style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{currency(item.value)}</span>
                </div>
                <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
                  <motion.div
                    style={{ height: "100%", background: item.fill, borderRadius: 99 }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.share}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
