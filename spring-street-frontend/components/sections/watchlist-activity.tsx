"use client";

import { motion } from "framer-motion";
import { getMockInsights } from "@/lib/mock-data";
import { currency, signedPercent } from "@/components/format";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Star, TrendingUp } from "lucide-react";

const WATCHLIST_TICKERS = ["AAPL", "MSFT", "GOOGL", "NVDA", "AMZN"];
const NAMES: Record<string, string> = {
  AAPL: "Apple", MSFT: "Microsoft", GOOGL: "Alphabet", NVDA: "NVIDIA", AMZN: "Amazon",
};

function MiniSparkline({ values, positive }: { values: number[]; positive: boolean }) {
  const data = values.map((v) => ({ v }));
  return (
    <div style={{ width: 60, height: 28 }}>
      <ResponsiveContainer width="100%" height={28}>
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`wl-${positive}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={positive ? "var(--accent-green)" : "var(--accent-red)"} stopOpacity={0.3} />
              <stop offset="100%" stopColor={positive ? "var(--accent-green)" : "var(--accent-red)"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area dataKey="v" stroke={positive ? "var(--accent-green)" : "var(--accent-red)"} strokeWidth={1.5} fill={`url(#wl-${positive})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WatchlistPanel() {
  const data = getMockInsights();
  const history = data.portfolio_history;

  const items = WATCHLIST_TICKERS.map((ticker) => {
    const asset = data.portfolio.assets.find((a) => a.ticker === ticker);
    const sparkValues = history.slice(-30).map((h) => h.contributions[ticker] ?? 0);
    return {
      ticker,
      name: NAMES[ticker],
      price: asset?.current_price ?? 0,
      cagr: asset?.cagr ?? 0,
      sparkValues,
    };
  });

  return (
    <div className="card card-pad" style={{ height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Star size={14} color="var(--accent-amber)" />
        <div className="chart-title">Watchlist</div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
          {items.length} tracked
        </div>
      </div>

      <div>
        {items.map((item, i) => (
          <motion.div
            key={item.ticker}
            className="watchlist-item"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            <div style={{ flex: 1 }}>
              <div className="watchlist-ticker">{item.ticker}</div>
              <div className="watchlist-name">{item.name}</div>
            </div>
            <MiniSparkline values={item.sparkValues} positive={item.cagr >= 0} />
            <div>
              <div className="watchlist-price">{currency(item.price)}</div>
              <div className="watchlist-change" style={{ color: item.cagr >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                {signedPercent(item.cagr)} yr
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Activity Feed
// ──────────────────────────────────────────────
type Activity = { dot: string; text: string; time: string };

const ACTIVITY: Activity[] = [
  { dot: "var(--accent-green)", text: "NVDA surged +4.2% on strong data center revenue.", time: "Just now" },
  { dot: "var(--accent-cyan)", text: "Portfolio reached a new all-time high value.", time: "2h ago" },
  { dot: "var(--accent-purple)", text: "Sharpe ratio improved to 1.24 over trailing 252 days.", time: "Yesterday" },
  { dot: "var(--accent-amber)", text: "AAPL reported quarterly earnings, beat estimates by 7%.", time: "2d ago" },
  { dot: "var(--accent-red)", text: "Market volatility elevated — VIX above 20.", time: "3d ago" },
  { dot: "var(--accent-green)", text: "MSFT cloud segment growth accelerated to 28% YoY.", time: "4d ago" },
];

export function ActivityFeed() {
  return (
    <div className="card card-pad">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <TrendingUp size={14} color="var(--accent-cyan)" />
        <div className="chart-title">Recent Activity</div>
      </div>

      <div>
        {ACTIVITY.map((item, i) => (
          <motion.div
            key={i}
            className="activity-item"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
          >
            <div className="activity-dot" style={{ background: item.dot }} />
            <div>
              <div className="activity-text">{item.text}</div>
              <div className="activity-time">{item.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
