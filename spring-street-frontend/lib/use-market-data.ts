"use client";

import { useEffect, useState } from "react";
import { getMockInsights } from "@/lib/mock-data";
import { getCompanyColor } from "@/lib/colors";
import type { InsightsResponse, OHLCBar, PortfolioSnapshot, TickerMetrics } from "@/types/market";

// ──────────────────────────────────────────────
// Timeframe definitions
// ──────────────────────────────────────────────
export type Timeframe = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y" | "MAX";

const TIMEFRAME_BARS: Record<Timeframe, number> = {
  "1D":  1,
  "1W":  5,
  "1M":  21,
  "3M":  63,
  "6M":  126,
  "1Y":  252,
  "2Y":  504,
  "5Y":  1260,
  "MAX": 99999,
};

export type ViewMode = "market" | "portfolio" | "insights";

export function getViewMode(tf: Timeframe): ViewMode {
  if (["1D", "1W", "1M"].includes(tf)) return "market";
  if (["6M", "1Y", "2Y", "5Y", "MAX"].includes(tf)) return "portfolio";
  return "portfolio"; // 3M falls here
}

// ──────────────────────────────────────────────
// Derived analytics types
// ──────────────────────────────────────────────
export type GrowthPoint = { date: string; portfolio: number; baseline: number };
export type HeatmapCell = { month: string; label: string; value: number };

export type DerivedAnalytics = {
  latest: PortfolioSnapshot;
  best: TickerMetrics;
  worst: TickerMetrics;
  growth: GrowthPoint[];
  heatmap: HeatmapCell[];
  rollingReturns: Array<{ date: string; rolling: number }>;
  volatility: Array<{ date: string; volatility: number }>;
  drawdown: Array<{ date: string; drawdown: number }>;
  contribution: Array<{ name: string; ticker: string; value: number; share: number; fill: string }>;
  riskScore: number;
  healthScore: number;
  fearGreed: number;
};

export type Insight = { what: string; why: string; action: string };

// ──────────────────────────────────────────────
// Computation helpers
// ──────────────────────────────────────────────
const COLORS = ["#00d4ff", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];
const TICKER_NAMES: Record<string, string> = {
  AAPL: "Apple",
  MSFT: "Microsoft",
  GOOGL: "Alphabet",
  NVDA: "NVIDIA",
  AMZN: "Amazon",
};

function dailyReturns(vals: number[]) {
  return vals.slice(1).map((v, i) => {
    const prev = vals[i];
    return prev === 0 ? 0 : (v - prev) / prev;
  });
}

function stddev(vals: number[]) {
  if (!vals.length) return 0;
  const m = vals.reduce((s, v) => s + v, 0) / vals.length;
  return Math.sqrt(vals.reduce((s, v) => s + (v - m) ** 2, 0) / vals.length);
}

function buildHeatmap(history: PortfolioSnapshot[]): HeatmapCell[] {
  const grouped = new Map<string, { first: number; last: number }>();
  history.forEach((s) => {
    const month = s.date.slice(0, 7);
    const entry = grouped.get(month);
    if (!entry) { grouped.set(month, { first: s.total_value, last: s.total_value }); return; }
    entry.last = s.total_value;
  });
  return Array.from(grouped.entries()).slice(-36).map(([month, e]) => ({
    month,
    label: new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    value: e.first === 0 ? 0 : ((e.last - e.first) / e.first) * 100,
  }));
}

function buildRolling(history: PortfolioSnapshot[], window: number) {
  return history.slice(window).map((s, i) => {
    const prev = history[i];
    return { date: s.date, rolling: prev.total_value === 0 ? 0 : ((s.total_value - prev.total_value) / prev.total_value) * 100 };
  });
}

function buildVolatility(history: PortfolioSnapshot[], window: number) {
  const rets = dailyReturns(history.map((h) => h.total_value));
  return rets.slice(window).map((_, i) => {
    const slice = rets.slice(i, i + window);
    return { date: history[i + window].date, volatility: stddev(slice) * Math.sqrt(252) * 100 };
  });
}

function buildDrawdown(history: PortfolioSnapshot[]) {
  let peak = history[0]?.total_value ?? 0;
  return history.map((s) => {
    peak = Math.max(peak, s.total_value);
    return { date: s.date, drawdown: peak === 0 ? 0 : ((s.total_value - peak) / peak) * 100 };
  });
}

function sliceHistory(history: PortfolioSnapshot[], tf: Timeframe) {
  const bars = TIMEFRAME_BARS[tf];
  return history.slice(-Math.min(bars, history.length));
}

export function deriveAnalytics(data: InsightsResponse, tf: Timeframe): DerivedAnalytics {
  const full = data.portfolio_history;
  const latest = full[full.length - 1];
  const period = sliceHistory(full, tf);
  const baseline = period[0]?.total_value ?? 0;
  const total = latest.total_value;

  const sorted = [...data.portfolio.assets].sort((a, b) => b.cagr - a.cagr);
  const contribution = data.tickers.map((ticker) => {
    const value = latest.contributions[ticker] ?? 0;
    return { name: TICKER_NAMES[ticker] ?? ticker, ticker, value, share: total ? (value / total) * 100 : 0, fill: getCompanyColor(ticker) };
  });

  const riskScore = Math.max(0, Math.min(100, 100 - data.portfolio.volatility - data.portfolio.max_drawdown / 2 + data.portfolio.sharpe * 8));
  const healthScore = Math.max(0, Math.min(100,
    (data.portfolio.sharpe > 0 ? 20 : 0) +
    (data.portfolio.cagr > 10 ? 20 : data.portfolio.cagr > 5 ? 12 : 0) +
    (data.portfolio.max_drawdown < 20 ? 20 : data.portfolio.max_drawdown < 35 ? 10 : 0) +
    (data.portfolio.total_return > 50 ? 20 : data.portfolio.total_return > 20 ? 12 : 0) +
    (data.portfolio.volatility < 20 ? 20 : data.portfolio.volatility < 30 ? 10 : 0)
  ));
  const fearGreed = Math.max(5, Math.min(95, 50 + data.portfolio.cagr * 1.2 - data.portfolio.volatility * 0.8));

  return {
    latest,
    best: sorted[0],
    worst: sorted[sorted.length - 1],
    growth: period.map((s) => ({ date: s.date, portfolio: s.total_value, baseline })),
    heatmap: buildHeatmap(full),
    rollingReturns: buildRolling(full, 252).slice(-504),
    volatility: buildVolatility(full, 63).slice(-504),
    drawdown: buildDrawdown(full).slice(-504),
    contribution,
    riskScore,
    healthScore,
    fearGreed,
  };
}

export function makeInsight(data: InsightsResponse, analytics: DerivedAnalytics): Insight {
  const leader = analytics.contribution.reduce((best, item) => (item.value > best.value ? item : best), analytics.contribution[0]);
  const { best, worst } = analytics;
  return {
    what: `${leader.ticker} drives ${leader.share.toFixed(1)}% of total value. Watch for concentration limits.`,
    why: `${best.ticker} leads at +${best.cagr.toFixed(1)}% CAGR. ${worst.ticker} lags at ${worst.cagr > 0 ? "+" : ""}${worst.cagr.toFixed(1)}%.`,
    action: data.portfolio.sharpe >= 1 
      ? `Strong risk-adjusted profile (${data.portfolio.sharpe.toFixed(2)} Sharpe). Maintain allocations.` 
      : `High volatility relative to returns. Re-evaluate ${worst.ticker} position.`,
  };
}

export function buildOHLCFromHistory(history: PortfolioSnapshot[], ticker: string): OHLCBar[] {
  // Use the actual historical contributions to derive a realistic deterministic price path
  // so we don't rely on random walks/mock data.
  const result: OHLCBar[] = [];
  for (let i = 0; i < history.length; i++) {
    const s = history[i];
    const val = s.contributions[ticker] || 100;
    // We add slight deterministic variation to simulate high/low using modulo of date
    const daySeed = s.date.charCodeAt(s.date.length - 1) % 5;
    const varPct = 0.005 + (daySeed * 0.002);
    
    // Derived proxy price
    const close = parseFloat((val / 100).toFixed(2));
    let open = close;
    if (i > 0) open = parseFloat((history[i-1].contributions[ticker] / 100).toFixed(2));
    
    result.push({
      date: s.date,
      open,
      close,
      high: parseFloat((Math.max(open, close) * (1 + varPct)).toFixed(2)),
      low: parseFloat((Math.min(open, close) * (1 - varPct)).toFixed(2)),
      volume: 5000000 + (daySeed * 1000000)
    });
  }
  return result;
}

// ──────────────────────────────────────────────
// Main data hook
// ──────────────────────────────────────────────
export function useMarketData() {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>("1Y");

  useEffect(() => {
    setLoading(true);
    // Try real API first, fall back to mock
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    fetch(`${baseUrl}/api/metrics`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("API unavailable");
        return r.json() as Promise<InsightsResponse>;
      })
      .then((d) => {
        if (!d.tickers?.length || !d.portfolio_history?.length) throw new Error("Incomplete data");
        setData(d);
      })
      .catch(() => {
        // Use rich mock data
        setData(getMockInsights());
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error, timeframe, setTimeframe };
}

export function useMockOHLC(ticker: string, history?: PortfolioSnapshot[]): { bars: OHLCBar[]; loading: boolean } {
  const [bars, setBars] = useState<OHLCBar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!history || history.length === 0) return;
    setLoading(true);
    // Use actual deterministic data from portfolio history instead of random mock
    const t = setTimeout(() => {
      setBars(buildOHLCFromHistory(history, ticker));
      setLoading(false);
    }, 100);
    return () => clearTimeout(t);
  }, [ticker, history]);

  return { bars, loading };
}
