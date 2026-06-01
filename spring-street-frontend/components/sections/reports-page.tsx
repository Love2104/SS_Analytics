"use client";

import { useMemo } from "react";
import { getCompanyColor } from "@/lib/colors";
import type { InsightsResponse } from "@/types/market";
import type { DerivedAnalytics } from "@/lib/use-market-data";
import { currency, signedPercent } from "@/components/format";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function ReportsPage({ data, analytics }: { data: InsightsResponse, analytics: DerivedAnalytics }) {
  const assets = data.portfolio.assets;
  
  const donutData = useMemo(() => {
    return assets.map(a => ({
      name: a.ticker,
      value: 20, // Equal weight 20%
      color: getCompanyColor(a.ticker)
    }));
  }, [assets]);

  return (
    <div className="section" style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 100 }}>
      <div style={{ marginBottom: 40 }}>
        <h1 className="section-title">Reports</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>Automated performance and risk analysis.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        
        {/* Performance Report */}
        <div className="card card-pad" style={{ display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 24 }}>Performance Report</h2>
          
          <div style={{ display: "grid", gap: 16, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-secondary)" }}>Total Return</span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: data.portfolio.total_return >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>{signedPercent(data.portfolio.total_return)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-secondary)" }}>CAGR</span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{signedPercent(data.portfolio.cagr)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--text-secondary)" }}>Sharpe Ratio</span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{data.portfolio.sharpe.toFixed(2)}</span>
            </div>
            
            {/* Tiny sparkline representation */}
            <div style={{ height: 60, marginTop: "auto", display: "flex", alignItems: "flex-end", gap: 2 }}>
              {analytics.growth.slice(-30).map((g, i) => {
                const max = Math.max(...analytics.growth.slice(-30).map(x => x.portfolio));
                const min = Math.min(...analytics.growth.slice(-30).map(x => x.portfolio));
                const h = Math.max(10, ((g.portfolio - min) / (max - min)) * 100);
                return <div key={i} style={{ flex: 1, height: `${h}%`, background: "var(--border-focus)", opacity: 0.5, borderRadius: "1px 1px 0 0" }} />
              })}
            </div>
          </div>

          <div style={{ marginTop: 24, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Generated: {new Date().toLocaleDateString()}</span>
            <button style={{ padding: "4px 12px", background: "var(--surface-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", color: "var(--text-primary)" }}>Export PDF</button>
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="card card-pad">
          <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 24 }}>Risk Analysis</h2>
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>Maximum Drawdown</div>
            <div style={{ display: "grid", gap: 12 }}>
              {assets.map(a => {
                const dd = Math.abs(a.max_drawdown);
                const color = dd < 20 ? "var(--accent-green)" : dd <= 40 ? "var(--accent-amber)" : "var(--accent-red)";
                return (
                  <div key={a.ticker} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 45, fontSize: 12, fontFamily: "var(--font-mono)" }}>{a.ticker}</div>
                    <div style={{ flex: 1, height: 6, background: "var(--surface-3)", borderRadius: "var(--radius-full)" }}>
                      <div style={{ width: `${Math.min(100, dd)}%`, height: "100%", background: color, borderRadius: "inherit" }} />
                    </div>
                    <div style={{ width: 45, textAlign: "right", fontSize: 12, fontFamily: "var(--font-mono)", color }}>{dd.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>Volatility (Ann.)</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-primary)" }}>Portfolio</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{(data.portfolio.volatility * Math.sqrt(252) * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Asset Breakdown */}
        <div className="card card-pad" style={{ display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 24 }}>Asset Breakdown</h2>
          
          <div style={{ position: "relative", height: 220, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>5 ASSETS</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>$100K</div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: "auto" }}>
            {donutData.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
