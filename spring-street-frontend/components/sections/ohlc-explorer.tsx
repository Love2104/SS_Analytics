"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { buildMockOHLC } from "@/lib/mock-data";
import type { OHLCBar } from "@/types/market";
import { currency, compactNumber } from "@/components/format";
import { getCompanyColor, getBearishColor, hexToRgba } from "@/lib/colors";

const TICKERS = ["AAPL", "MSFT", "GOOGL", "NVDA", "AMZN"];

function SectionHeader({ eyebrow, title, chip, color }: { eyebrow: string; title: string; chip?: string; color?: string }) {
  return (
    <div className="section-header">
      <div className="section-label">
        <div className="section-accent-bar" style={color ? { background: color, boxShadow: `0 0 12px ${hexToRgba(color, 0.5)}` } : undefined} />
        <div>
          <div className="section-eyebrow">{eyebrow}</div>
          <h2 className="section-title">{title}</h2>
        </div>
      </div>
      {chip && <span style={{ padding: "6px 14px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-full)", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", background: "var(--surface-3)" }}>{chip}</span>}
    </div>
  );
}

function PriceStatItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-mono)", color: color ?? "var(--text-primary)" }}>{value}</div>
    </div>
  );
}

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
  const paddingTop = 16, paddingBottom = 60; // Extra padding for volume
  const priceH = H - paddingTop - paddingBottom;
  const volH = 40; // Max height for volume bars

  const y = (price: number) => paddingTop + (1 - (price - min) / span) * priceH;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxHeight: 300, display: "block" }}
      role="img"
      aria-label="OHLC candlestick chart"
    >
      {/* Grid lines */}
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

      {/* Candles & Volume */}
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
          <motion.g
            key={bar.date}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: i * 0.004, duration: 0.25 }}
            style={{ transformOrigin: `${x}px ${(highY + lowY) / 2}px` }}
          >
            {/* Volume Bar */}
            <rect
              x={x - barW / 2}
              y={vY}
              width={barW}
              height={vH}
              fill={volBase}
              onMouseOver={(e) => (e.currentTarget.style.fill = volHover)}
              onMouseOut={(e) => (e.currentTarget.style.fill = volBase)}
            />
            {/* Wick */}
            <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth={1} />
            {/* Body */}
            <rect
              x={x - barW / 2}
              y={bodyTop}
              width={barW}
              height={bodyH}
              fill={color}
              rx={1}
            />
          </motion.g>
        );
      })}
    </svg>
  );
}

export function OHLCExplorer() {
  const [selected, setSelected] = useState(TICKERS[0]);
  const [bars, setBars] = useState<OHLCBar[]>([]);
  const [loading, setLoading] = useState(true);

  function loadBars(ticker: string) {
    setSelected(ticker);
    setLoading(true);
    setBars([]);
    // Simulate async
    setTimeout(() => {
      setBars(buildMockOHLC(ticker, 120));
      setLoading(false);
    }, 280);
  }

  useEffect(() => { loadBars(TICKERS[0]); }, []);

  const latest = bars[bars.length - 1];
  const prev = bars[bars.length - 2];
  const dayChange = latest && prev ? latest.close - prev.close : 0;
  const dayChangePct = prev?.close ? (dayChange / prev.close) * 100 : 0;
  const isUp = dayChange >= 0;

  return (
    <section className="section" aria-label="OHLC security explorer">
      <SectionHeader eyebrow="05 · Security Drilldown" title="OHLC tape and recent price structure" chip={selected} color={getCompanyColor(selected)} />

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        style={{ 
          borderTop: `2px solid ${getCompanyColor(selected)}`, 
          backgroundColor: hexToRgba(getCompanyColor(selected), 0.03) 
        }}
      >
        {/* Ticker selector */}
        <div style={{ display: "flex", gap: 8, padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
          {TICKERS.map((ticker) => (
            <button
              key={ticker}
              onClick={() => loadBars(ticker)}
              aria-pressed={selected === ticker}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                border: `1px solid ${selected === ticker ? getCompanyColor(ticker) : "var(--border-subtle)"}`,
                background: selected === ticker ? hexToRgba(getCompanyColor(ticker), 0.08) : "var(--surface-3)",
                color: selected === ticker ? getCompanyColor(ticker) : "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: selected === ticker ? 600 : 400,
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              {ticker}
            </button>
          ))}
        </div>

        {/* Price stats */}
        {latest && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
            <PriceStatItem label="Current" value={currency(latest.close)} />
            <PriceStatItem label="Open" value={currency(latest.open)} />
            <PriceStatItem label="High" value={currency(latest.high)} color="var(--accent-green)" />
            <PriceStatItem label="Low" value={currency(latest.low)} color="var(--accent-red)" />
            <PriceStatItem label="Volume" value={compactNumber(latest.volume)} />
          </div>
        )}

        {/* Day change badge */}
        {latest && (
          <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>Day Change</span>
            <span
              className="badge"
              style={{
                background: isUp ? "var(--gain-bg)" : "var(--loss-bg)",
                color: isUp ? "var(--accent-green)" : "var(--accent-red)",
                border: `1px solid ${isUp ? "var(--gain-border)" : "var(--loss-border)"}`,
              }}
            >
              {isUp ? "+" : "−"}{Math.abs(dayChange).toFixed(2)} ({Math.abs(dayChangePct).toFixed(2)}%)
            </span>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
              Last: {latest.date}
            </span>
          </div>
        )}

        {/* Chart */}
        <div style={{ padding: "16px 20px" }}>
          {loading ? (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div className="skeleton" style={{ width: 200, height: 12 }} />
                <div className="skeleton" style={{ width: 140, height: 12 }} />
              </div>
            </div>
          ) : (
            <CandleChart bars={bars} ticker={selected} />
          )}
        </div>
      </motion.div>
    </section>
  );
}
