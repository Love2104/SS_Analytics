package models

type OHLCBar struct {
	Date   string  `json:"date"`
	Open   float64 `json:"open"`
	High   float64 `json:"high"`
	Low    float64 `json:"low"`
	Close  float64 `json:"close"`
	Volume float64 `json:"volume"`
}

type TickerOHLC struct {
	Ticker string    `json:"ticker"`
	Bars   []OHLCBar `json:"bars"`
}

type PortfolioSnapshot struct {
	Date          string             `json:"date"`
	TotalValue    float64            `json:"total_value"`
	Contributions map[string]float64 `json:"contributions"`
}

type TickerMetrics struct {
	Ticker        string  `json:"ticker"`
	CAGR          float64 `json:"cagr"`
	Volatility    float64 `json:"volatility"`
	Sharpe        float64 `json:"sharpe"`
	MaxDrawdown   float64 `json:"max_drawdown"`
	CurrentPrice  float64 `json:"current_price"`
	WeightPercent float64 `json:"weight_percent"`
}

type PortfolioMetrics struct {
	TotalReturn float64         `json:"total_return"`
	CAGR        float64         `json:"cagr"`
	Volatility  float64         `json:"volatility"`
	Sharpe      float64         `json:"sharpe"`
	MaxDrawdown float64         `json:"max_drawdown"`
	Assets      []TickerMetrics `json:"assets"`
}

type InsightsResponse struct {
	GeneratedAt      string              `json:"generated_at"`
	Tickers          []string            `json:"tickers"`
	Portfolio        PortfolioMetrics    `json:"portfolio"`
	PortfolioHistory []PortfolioSnapshot `json:"portfolio_history"`
}
