import type { InsightsResponse, OHLCBar, PortfolioMetrics, PortfolioSnapshot, TickerMetrics } from "@/types/market";

// ──────────────────────────────────────────────
// Seeded deterministic random (no library needed)
// ──────────────────────────────────────────────
function mulberry32(seed: number) {
  return () => {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

function randn(mean: number, std: number) {
  // Box–Muller
  const u = Math.max(1e-10, rand());
  const v = rand();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ──────────────────────────────────────────────
// Build mock portfolio history (5+ years)
// ──────────────────────────────────────────────
const TICKERS = ["AAPL", "MSFT", "GOOGL", "NVDA", "AMZN"];
const TICKER_NAMES: Record<string, string> = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corp.",
  GOOGL: "Alphabet Inc.",
  NVDA: "NVIDIA Corp.",
  AMZN: "Amazon.com Inc.",
};

const MOCK_PRICES: Record<string, number> = {
  AAPL: 189.3,
  MSFT: 418.5,
  GOOGL: 175.4,
  NVDA: 875.2,
  AMZN: 182.7,
};

const MOCK_DRIFTS: Record<string, number> = {
  AAPL: 0.00045,
  MSFT: 0.00055,
  GOOGL: 0.00040,
  NVDA: 0.00095,
  AMZN: 0.00042,
};

const MOCK_VOLS: Record<string, number> = {
  AAPL: 0.018,
  MSFT: 0.019,
  GOOGL: 0.021,
  NVDA: 0.038,
  AMZN: 0.022,
};

function buildHistory(days: number): PortfolioSnapshot[] {
  const rng = mulberry32(99);
  // Simulate individual price paths
  const paths: Record<string, number[]> = {};
  for (const ticker of TICKERS) {
    const prices: number[] = [MOCK_PRICES[ticker] * 0.38]; // start ~3.5 years ago
    for (let i = 1; i < days; i++) {
      const u1 = Math.max(1e-10, rng());
      const u2 = rng();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const drift = MOCK_DRIFTS[ticker];
      const vol = MOCK_VOLS[ticker];
      prices.push(prices[i - 1] * Math.exp(drift - 0.5 * vol * vol + vol * z));
    }
    paths[ticker] = prices;
  }

  // Build snapshots (equal weight, 100 shares each)
  const SHARES = 100;
  const today = new Date();
  const history: PortfolioSnapshot[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const contributions: Record<string, number> = {};
    let total = 0;
    for (const ticker of TICKERS) {
      const val = paths[ticker][i] * SHARES;
      contributions[ticker] = val;
      total += val;
    }
    history.push({ date: d.toISOString().slice(0, 10), total_value: total, contributions });
  }
  return history;
}

function computeMetrics(ticker: string, history: PortfolioSnapshot[]): TickerMetrics {
  const values = history.map((h) => h.contributions[ticker]);
  const n = values.length;
  const totalReturn = (values[n - 1] - values[0]) / values[0];
  const years = n / 252;
  const cagr = (Math.pow(1 + totalReturn, 1 / years) - 1) * 100;
  const dailyReturns = values.slice(1).map((v, i) => (v - values[i]) / values[i]);
  const mean = dailyReturns.reduce((s, r) => s + r, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / dailyReturns.length;
  const vol = Math.sqrt(variance) * Math.sqrt(252) * 100;
  const sharpe = vol > 0 ? (cagr - 4.5) / vol : 0;
  let peak = values[0];
  let maxDD = 0;
  for (const v of values) {
    peak = Math.max(peak, v);
    maxDD = Math.max(maxDD, ((peak - v) / peak) * 100);
  }
  return {
    ticker,
    cagr: parseFloat(cagr.toFixed(2)),
    volatility: parseFloat(vol.toFixed(2)),
    sharpe: parseFloat(sharpe.toFixed(3)),
    max_drawdown: parseFloat(maxDD.toFixed(2)),
    current_price: parseFloat((values[n - 1] / 100).toFixed(2)),
    weight_percent: 20,
  };
}

// ──────────────────────────────────────────────
// Build OHLC mock data for a ticker
// ──────────────────────────────────────────────
export function buildMockOHLC(ticker: string, bars = 180): OHLCBar[] {
  const rng = mulberry32(ticker.charCodeAt(0) * 37 + ticker.charCodeAt(1));
  let price = MOCK_PRICES[ticker] * 0.72;
  const drift = MOCK_DRIFTS[ticker];
  const vol = MOCK_VOLS[ticker];
  const today = new Date();
  const result: OHLCBar[] = [];

  for (let i = bars; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const open = price;
    const u1 = Math.max(1e-10, rng());
    const u2 = rng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    price = price * Math.exp(drift - 0.5 * vol * vol + vol * z);
    const close = price;
    const high = Math.max(open, close) * (1 + rng() * 0.012);
    const low = Math.min(open, close) * (1 - rng() * 0.012);
    const volume = Math.floor(randn(8_000_000, 3_000_000));

    result.push({
      date: date.toISOString().slice(0, 10),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.max(1_000_000, volume),
    });
  }
  return result;
}

// ──────────────────────────────────────────────
// Main mock data export
// ──────────────────────────────────────────────
let _cached: InsightsResponse | null = null;

export function getMockInsights(): InsightsResponse {
  if (_cached) return _cached;

  const history = buildHistory(1300); // ~5 years
  const assets: TickerMetrics[] = TICKERS.map((t) => computeMetrics(t, history));

  const values = history.map((h) => h.total_value);
  const n = values.length;
  const totalReturn = (values[n - 1] - values[0]) / values[0];
  const years = n / 252;
  const cagr = (Math.pow(1 + totalReturn, 1 / years) - 1) * 100;
  const dailyReturns = values.slice(1).map((v, i) => (v - values[i]) / values[i]);
  const mean = dailyReturns.reduce((s, r) => s + r, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / dailyReturns.length;
  const vol = Math.sqrt(variance) * Math.sqrt(252) * 100;
  const sharpe = vol > 0 ? (cagr - 4.5) / vol : 0;
  let peak = values[0];
  let maxDD = 0;
  for (const v of values) {
    peak = Math.max(peak, v);
    maxDD = Math.max(maxDD, ((peak - v) / peak) * 100);
  }

  const portfolio: PortfolioMetrics = {
    total_return: parseFloat((totalReturn * 100).toFixed(2)),
    cagr: parseFloat(cagr.toFixed(2)),
    volatility: parseFloat(vol.toFixed(2)),
    sharpe: parseFloat(sharpe.toFixed(3)),
    max_drawdown: parseFloat(maxDD.toFixed(2)),
    assets,
  };

  _cached = {
    generated_at: new Date().toISOString(),
    tickers: TICKERS,
    portfolio,
    portfolio_history: history,
  };

  return _cached;
}

export { TICKER_NAMES };
