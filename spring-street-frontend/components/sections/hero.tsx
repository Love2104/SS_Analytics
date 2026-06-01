"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import type { InsightsResponse } from "@/types/market";
import type { DerivedAnalytics, Timeframe } from "@/lib/use-market-data";
import { currency, signedPercent } from "@/components/format";

// ──────────────────────────────────────────────
// Animated counter
// ──────────────────────────────────────────────
function AnimatedNumber({ value, formatter }: { value: number; formatter: (v: number) => string }) {
  const [display, setDisplay] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) { setDisplay(value); return; }
    const start = performance.now();
    const duration = 1200;
    let raf = 0;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(value * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);

  return <>{formatter(display)}</>;
}

// ──────────────────────────────────────────────
// Portfolio Health Score
// ──────────────────────────────────────────────
function HealthScore({ score }: { score: number }) {
  const color = score >= 70 ? "var(--accent-green)" : score >= 45 ? "var(--accent-amber)" : "var(--accent-red)";
  const label = score >= 70 ? "Excellent" : score >= 45 ? "Good" : "Needs Review";
  const r = 44;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ * 0.75; // 75% arc
  const offset = circ * 0.125; // start offset for 75% arc

  return (
    <div className="health-score-wrap">
      <div style={{ position: "relative", width: 110, height: 90 }}>
        <svg width="110" height="90" viewBox="0 0 110 90" aria-label={`Health score: ${score}`}>
          {/* Track */}
          <circle
            cx="55" cy="62" r={r}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="7"
            strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            transform="rotate(135 55 62)"
          />
          {/* Fill */}
          <motion.circle
            cx="55" cy="62" r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            transform="rotate(135 55 62)"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${filled} ${circ - filled}` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-mono)", color, lineHeight: 1 }}>
            <AnimatedNumber value={score} formatter={(v) => Math.round(v).toString()} />
          </div>
          <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)", marginTop: 2 }}>
            {label}
          </div>
        </div>
      </div>
      <div className="health-score-label">Portfolio Health</div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Fear & Greed Indicator
// ──────────────────────────────────────────────
function FearGreedGauge({ value }: { value: number }) {
  const getColor = (v: number) => {
    if (v <= 25) return "var(--accent-red)";
    if (v <= 45) return "var(--accent-amber)";
    if (v <= 55) return "var(--text-secondary)";
    if (v <= 75) return "#22c55e";
    return "var(--accent-green)";
  };
  const getLabel = (v: number) => {
    if (v <= 25) return "Extreme Fear";
    if (v <= 45) return "Fear";
    if (v <= 55) return "Neutral";
    if (v <= 75) return "Greed";
    return "Extreme Greed";
  };
  const color = getColor(value);
  const label = getLabel(value);
  // Needle angle: -135deg (0) to +135deg (100)
  const angle = -135 + (value / 100) * 270;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: 100, height: 58 }}>
        <svg width="100" height="58" viewBox="0 0 100 58" aria-label={`Market sentiment: ${label} (${value})`}>
          {/* Gauge arc segments */}
          {[
            { start: -135, end: -81, color: "#ef4444" },
            { start: -81, end: -27, color: "#f59e0b" },
            { start: -27, end: 27, color: "#94a3b8" },
            { start: 27, end: 81, color: "#22c55e" },
            { start: 81, end: 135, color: "#10b981" },
          ].map((seg, i) => {
            const r = 40;
            const cx = 50, cy = 50;
            const toRad = (d: number) => (d * Math.PI) / 180;
            const x1 = cx + r * Math.cos(toRad(seg.start));
            const y1 = cy + r * Math.sin(toRad(seg.start));
            const x2 = cx + r * Math.cos(toRad(seg.end));
            const y2 = cy + r * Math.sin(toRad(seg.end));
            const large = Math.abs(seg.end - seg.start) > 180 ? 1 : 0;
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
                fill="none"
                stroke={seg.color}
                strokeWidth="6"
                strokeLinecap="round"
                opacity={0.7}
              />
            );
          })}
          {/* Needle */}
          <motion.g
            initial={{ rotate: -135 }}
            animate={{ rotate: angle }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            style={{ originX: "50px", originY: "50px" }}
          >
            <line x1="50" y1="50" x2="50" y2="16" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="50" r="4" fill={color} />
          </motion.g>
        </svg>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color }}>
        {label}
      </div>
      <div style={{ fontSize: 10, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Market Sentiment
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Ticker Tape
// ──────────────────────────────────────────────
function TickerTape({ data }: { data: InsightsResponse }) {
  const items = [...data.portfolio.assets, ...data.portfolio.assets];
  return (
    <div className="ticker-tape" aria-label="Live portfolio ticker">
      <div className="ticker-tape-inner">
        {items.map((asset, i) => (
          <span key={`${asset.ticker}-${i}`} className="ticker-item">
            <span className="ticker-item-symbol">{asset.ticker}</span>
            <span className={asset.cagr >= 0 ? "ticker-item-gain" : "ticker-item-loss"}>
              {signedPercent(asset.cagr)}
            </span>
            <span style={{ color: "var(--text-tertiary)" }}>{currency(asset.current_price)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Hero section
// ──────────────────────────────────────────────
const TIMEFRAMES: Timeframe[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "2Y", "5Y", "MAX"];

interface HeroProps {
  data: InsightsResponse;
  analytics: DerivedAnalytics;
}

export function Hero({ data, analytics }: HeroProps) {
  const totalReturn = data.portfolio.total_return;
  const positive = totalReturn >= 0;

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  };

  return (
    <section className="hero" aria-label="Portfolio overview">
      {/* Background grid */}
      <div className="hero-bg" aria-hidden="true" style={{ overflow: "hidden" }}>
        <div className="hero-bg-grid" />
      </div>

      {/* Ticker tape */}
      <TickerTape data={data} />

      {/* Hero content */}
      <motion.div
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left: Copy */}
        <div>
          <motion.div variants={itemVariants}>
            <span className="hero-kicker">
              <Sparkles size={11} />
              Spring Street Market Console
            </span>
          </motion.div>

          <motion.h1 className="hero-headline" variants={itemVariants}>
            Portfolio intelligence<br />
            <span style={{ color: "var(--accent-cyan)" }}>worth acting on.</span>
          </motion.h1>

          <motion.p className="hero-subline" variants={itemVariants}>
            Live analytics across performance, concentration, drawdown, and attribution — for decisions that need context, not noise.
          </motion.p>

          {/* Quick stats row */}
          <motion.div
            variants={itemVariants}
            style={{ display: "flex", gap: 20, marginTop: 28, flexWrap: "wrap" }}
          >
            {[
              { label: "Total Return", value: signedPercent(data.portfolio.total_return), positive },
              { label: "CAGR", value: signedPercent(data.portfolio.cagr), positive: data.portfolio.cagr >= 0 },
              { label: "Sharpe", value: data.portfolio.sharpe.toFixed(2), positive: data.portfolio.sharpe >= 1 },
              { label: "Max Drawdown", value: `-${data.portfolio.max_drawdown.toFixed(1)}%`, positive: false },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.09em" }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono)", color: stat.positive ? "var(--accent-green)" : "var(--accent-red)", marginTop: 2, letterSpacing: "-0.02em" }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Summary card */}
        <motion.div
          variants={itemVariants}
          className="card card--glow hero-card"
          style={{ backdropFilter: "blur(24px)" }}
        >
          {/* Portfolio value */}
          <div>
            <div className="hero-metric-label">Portfolio Value</div>
            <div className="hero-metric-value">
              <AnimatedNumber value={analytics.latest.total_value} formatter={currency} />
            </div>
          </div>

          <div className="divider" />

          {/* Return */}
          <div className="hero-metric-row">
            <div>
              <div className="hero-metric-label">Total Return</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: positive ? "var(--accent-green)" : "var(--accent-red)", letterSpacing: "-0.02em" }}>
                <AnimatedNumber value={totalReturn} formatter={signedPercent} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: positive ? "var(--accent-green)" : "var(--accent-red)" }}>
              {positive ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
            </div>
          </div>

          <div className="divider" />

          {/* Gauges row */}
          <div style={{ display: "flex", justifyContent: "space-around", gap: 8, paddingTop: 4 }}>
            <HealthScore score={analytics.healthScore} />
            <div style={{ width: 1, background: "var(--border-subtle)" }} />
            <FearGreedGauge value={analytics.fearGreed} />
          </div>

          {/* Data freshness */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4, borderTop: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
              {data.tickers.length} holdings
            </span>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
              Updated {new Date(data.generated_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ──────────────────────────────────────────────
// Timeframe Selector (exported for reuse)
// ──────────────────────────────────────────────
const TFS: Timeframe[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "2Y", "5Y", "MAX"];

export function TimeframeSelector({ timeframe, setTimeframe }: { timeframe: Timeframe; setTimeframe: (tf: Timeframe) => void }) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const containerRef = { current: null as HTMLDivElement | null };
  const refs = TFS.map(() => ({ current: null as HTMLButtonElement | null }));

  useEffect(() => {
    const idx = TFS.indexOf(timeframe);
    const btn = refs[idx]?.current;
    if (btn) {
      setIndicatorStyle({ left: btn.offsetLeft, width: btn.offsetWidth });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  return (
    <div
      className="timeframe-selector"
      role="group"
      aria-label="Select timeframe"
      ref={(el) => { containerRef.current = el; }}
    >
      <motion.div
        className="timeframe-indicator"
        animate={indicatorStyle}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "absolute", top: 3, bottom: 3, borderRadius: "var(--radius-full)" }}
      />
      {TFS.map((tf, i) => (
        <button
          key={tf}
          ref={refs[i]}
          className={`timeframe-btn${timeframe === tf ? " active" : ""}`}
          onClick={() => setTimeframe(tf)}
          aria-pressed={timeframe === tf}
          aria-label={`Timeframe: ${tf}`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
