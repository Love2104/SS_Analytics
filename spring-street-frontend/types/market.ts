export type OHLCBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type TickerOHLC = {
  ticker: string;
  bars: OHLCBar[];
};

export type PortfolioSnapshot = {
  date: string;
  total_value: number;
  contributions: Record<string, number>;
};

export type TickerMetrics = {
  ticker: string;
  cagr: number;
  volatility: number;
  sharpe: number;
  max_drawdown: number;
  current_price: number;
  weight_percent: number;
};

export type PortfolioMetrics = {
  total_return: number;
  cagr: number;
  volatility: number;
  sharpe: number;
  max_drawdown: number;
  assets: TickerMetrics[];
};

export type InsightsResponse = {
  generated_at: string;
  tickers: string[];
  portfolio: PortfolioMetrics;
  portfolio_history: PortfolioSnapshot[];
};

export type PortfolioResponse = {
  tickers: string[];
  history: PortfolioSnapshot[];
};
