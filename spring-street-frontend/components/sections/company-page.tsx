"use client";

import { motion } from "framer-motion";
import { getCompanyColor, hexToRgba, getBearishColor } from "@/lib/colors";
import type { InsightsResponse } from "@/types/market";
import type { DerivedAnalytics, Timeframe } from "@/lib/use-market-data";
import { buildOHLCFromHistory } from "@/lib/use-market-data";
import { currency, signedPercent, compactNumber } from "@/components/format";
import { ArrowUpRight, ArrowDownRight, Activity, BarChart2 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, YAxis, XAxis, Tooltip as RechartsTooltip } from "recharts";
import { useState, useEffect } from "react";
import type { OHLCBar } from "@/types/market";
import { TimeframeSelector } from "./hero";

// Reuse candlestick chart for company page
function CandleChart({ bars, ticker }: { bars: OHLCBar[], ticker: string }) {
  const recent = bars.slice(-80);
  if (!recent.length) return null;

  const compColor = getCompanyColor(ticker);
  const bearColor = getBearishColor(compColor);
  const volBase = hexToRgba(compColor, 0.2);
  const volHover = hexToRgba(compColor, 0.5);

  const min = Math.min(...recent.map((b) => b.low));
  const max = Math.max(...recent.map((b) => b.high));
  const span = Math.max(max - min, 1);
  const maxVol = Math.max(...recent.map((b) => b.volume), 1);
  const W = 960, H = 300;
  const barW = Math.floor(W / recent.length) - 1;
  const paddingTop = 16, paddingBottom = 60; 
  const priceH = H - paddingTop - paddingBottom;
  const volH = 40; 

  const y = (price: number) => paddingTop + (1 - (price - min) / span) * priceH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxHeight: 300, display: "block" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const yPos = paddingTop + t * priceH;
        const price = max - t * span;
        return (
          <g key={t}>
            <line x1={0} x2={W} y1={yPos} y2={yPos} stroke="var(--chart-grid)" strokeWidth={1} />
            <text x={W - 4} y={yPos - 3} textAnchor="end" fill="var(--chart-tick)" fontSize={9} fontFamily="var(--font-mono)">
              {currency(price).replace(".00", "")}
            </text>
          </g>
        );
      })}
      {recent.map((bar, i) => {
        const x = i * (barW + 1) + barW / 2;
        const bullish = bar.close >= bar.open;
        const color = bullish ? compColor : bearColor;
        const highY = y(bar.high);
        const lowY = y(bar.low);
        const openY = y(bar.open);
        const closeY = y(bar.close);
        const bodyTop = Math.min(openY, closeY);
        const bodyH = Math.max(2, Math.abs(closeY - openY));

        const vH = (bar.volume / maxVol) * volH;
        const vY = H - vH;

        return (
          <motion.g key={bar.date} initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ delay: i * 0.004, duration: 0.25 }} style={{ transformOrigin: `${x}px ${(highY + lowY) / 2}px` }}>
            <rect x={x - barW / 2} y={vY} width={barW} height={vH} fill={volBase} onMouseOver={(e) => (e.currentTarget.style.fill = volHover)} onMouseOut={(e) => (e.currentTarget.style.fill = volBase)} />
            <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth={1} />
            <rect x={x - barW / 2} y={bodyTop} width={barW} height={bodyH} fill={color} rx={1} />
          </motion.g>
        );
      })}
    </svg>
  );
}

export function CompanyPage({ ticker, data, onNavigate }: { ticker: string, data: InsightsResponse, onNavigate?: (s: string) => void }) {
  const color = getCompanyColor(ticker);
  const bgColor = hexToRgba(color, 0.03);
  
  const asset = data.portfolio.assets.find(a => a.ticker === ticker);
  const [timeframe, setTimeframe] = useState<Timeframe>("1Y");
  const [chartType, setChartType] = useState<"candle" | "line">("candle");
  const [bars, setBars] = useState<OHLCBar[]>([]);

  useEffect(() => {
    // Generate deterministic historical data
    const fullHistory = buildOHLCFromHistory(data.portfolio_history, ticker);
    
    // Slice based on timeframe
    const tfCounts: Record<Timeframe, number> = {
      "1D": 1, "1W": 5, "1M": 21, "3M": 63, "6M": 126, "1Y": 252, "2Y": 500, "5Y": 800, "MAX": 9999
    };
    const count = tfCounts[timeframe] || 120;
    
    setBars(fullHistory.slice(-Math.min(count, fullHistory.length)));
  }, [ticker, timeframe, data.portfolio_history]);

  if (!asset) return null;

  const latest = bars[bars.length - 1];
  const prev = bars[bars.length - 2];
  const dayChange = latest && prev ? latest.close - prev.close : 0;
  const dayChangePct = prev?.close ? (dayChange / prev.close) * 100 : 0;
  const isUp = dayChange >= 0;

  return (
    <div style={{ backgroundColor: bgColor, minHeight: "100%", padding: "32px", borderRadius: "var(--radius-lg)", borderTop: `2px solid ${color}` }}>
      
      {/* Company Switcher Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32, overflowX: "auto", paddingBottom: 8 }}>
        {data.tickers.map(t => {
          const isActive = t === ticker;
          return (
            <button
              key={t}
              onClick={() => onNavigate?.(`company-${t}`)}
              style={{
                padding: "6px 16px",
                borderRadius: "var(--radius-full)",
                border: `1px solid ${isActive ? getCompanyColor(t) : "var(--border-subtle)"}`,
                background: isActive ? hexToRgba(getCompanyColor(t), 0.1) : "transparent",
                color: isActive ? getCompanyColor(t) : "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--bg-base)", fontWeight: 700, fontSize: 18 }}>
            {ticker[0]}
          </div>
          <div>
            <h1 className="section-title" style={{ color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 12 }}>
              {ticker}
              <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: "var(--radius-full)", border: `1px solid ${color}`, color: color, background: hexToRgba(color, 0.1) }}>
                EQUITY
              </span>
            </h1>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { l: "Current Price", v: currency(asset.current_price) },
          { l: "CAGR", v: signedPercent(asset.cagr), c: asset.cagr >= 0 ? color : getBearishColor(color) },
          { l: "Volatility", v: (asset.volatility * 100).toFixed(2) + "%" },
          { l: "Max Drawdown", v: `-${Math.abs(asset.max_drawdown).toFixed(2)}%`, c: getBearishColor(color) },
          { l: "Sharpe", v: asset.sharpe.toFixed(2) }
        ].map(s => (
          <div key={s.l} className="card card-pad" style={{ borderTop: `2px solid ${color}`, background: "var(--surface-1)" }}>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{s.l}</div>
            <div style={{ fontSize: 24, fontWeight: 600, fontFamily: "var(--font-mono)", color: s.c || "var(--text-primary)" }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: "20px", background: "var(--surface-1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Price Action & Volume</h2>
            
            {/* Chart Type Toggle */}
            <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: 6, padding: 2 }}>
              <button 
                onClick={() => setChartType("candle")}
                style={{ padding: "4px 12px", fontSize: 12, borderRadius: 4, background: chartType === "candle" ? "var(--surface-hover)" : "transparent", color: chartType === "candle" ? "var(--text-primary)" : "var(--text-tertiary)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                <BarChart2 size={12} /> Candle
              </button>
              <button 
                onClick={() => setChartType("line")}
                style={{ padding: "4px 12px", fontSize: 12, borderRadius: 4, background: chartType === "line" ? "var(--surface-hover)" : "transparent", color: chartType === "line" ? "var(--text-primary)" : "var(--text-tertiary)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                <Activity size={12} /> Line
              </button>
            </div>
          </div>
          
          {latest && (
            <div style={{ display: "flex", gap: 16, fontSize: 12, fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "var(--text-secondary)" }}>Vol: <span style={{ color: "var(--text-primary)" }}>{compactNumber(latest.volume)}</span></span>
              <span style={{ color: isUp ? color : getBearishColor(color) }}>
                {isUp ? "+" : ""}{dayChangePct.toFixed(2)}% Today
              </span>
            </div>
          )}
        </div>
        
        {bars.length > 0 ? (
          chartType === "candle" ? (
            <CandleChart bars={bars} ticker={ticker} />
          ) : (
            <div style={{ height: 300, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bars}>
                  <defs>
                    <linearGradient id={`grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <RechartsTooltip 
                    contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: 8, padding: "8px 12px", boxShadow: "var(--shadow-lg)" }}
                    itemStyle={{ color: color, fontFamily: "var(--font-mono)", fontWeight: 600 }}
                    labelStyle={{ color: "var(--text-tertiary)", marginBottom: 4, fontSize: 11, fontFamily: "var(--font-mono)" }}
                    formatter={(value: any) => [currency(Number(value)), "Close"]}
                    labelFormatter={(label) => typeof label === 'string' ? label : label?.toString()}
                  />
                  <Area type="monotone" dataKey="close" stroke={color} strokeWidth={2} fill={`url(#grad-${ticker})`} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )
        ) : (
          <div style={{ height: 300 }} />
        )}

        <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
          <TimeframeSelector timeframe={timeframe} setTimeframe={setTimeframe} />
        </div>
      </div>
      
    </div>
  );
}
