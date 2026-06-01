package services

import (
	"math"
	"sort"

	"github.com/yourusername/spring-street-backend/models"
)

const (
	RiskFreeRate      = 0.05
	TradingDays       = 252.0
	WeightPercent     = 20.0
	defaultInvestment = 100000.0
)

var PortfolioTickers = []string{"AAPL", "MSFT", "GOOGL", "NVDA", "AMZN"}

func DailyReturns(closes []float64) []float64 {
	if len(closes) < 2 {
		return []float64{}
	}

	returns := make([]float64, 0, len(closes)-1)
	for i := 1; i < len(closes); i++ {
		if closes[i-1] == 0 {
			returns = append(returns, 0)
			continue
		}
		returns = append(returns, (closes[i]-closes[i-1])/closes[i-1])
	}

	return returns
}

func CAGR(startPrice, endPrice float64, years float64) float64 {
	if startPrice <= 0 || endPrice <= 0 || years <= 0 {
		return 0
	}

	return math.Pow(endPrice/startPrice, 1/years) - 1
}

func AnnualizedVolatility(dailyReturns []float64) float64 {
	if len(dailyReturns) == 0 {
		return 0
	}

	avg := mean(dailyReturns)
	var sumSquares float64
	for _, value := range dailyReturns {
		diff := value - avg
		sumSquares += diff * diff
	}

	return math.Sqrt(sumSquares/float64(len(dailyReturns))) * math.Sqrt(TradingDays)
}

func SharpeRatio(dailyReturns []float64, riskFreeRate float64) float64 {
	vol := AnnualizedVolatility(dailyReturns)
	if vol == 0 {
		return 0
	}

	annualizedReturn := mean(dailyReturns) * TradingDays
	return (annualizedReturn - riskFreeRate) / vol
}

func MaxDrawdown(closes []float64) float64 {
	if len(closes) == 0 {
		return 0
	}

	peak := closes[0]
	maxDrawdown := 0.0
	for _, closePrice := range closes {
		if closePrice > peak {
			peak = closePrice
		}
		if peak == 0 {
			continue
		}
		drawdown := (peak - closePrice) / peak
		if drawdown > maxDrawdown {
			maxDrawdown = drawdown
		}
	}

	return maxDrawdown
}

func BuildPortfolioHistory(allBars map[string][]models.OHLCBar, initialInvestment float64) []models.PortfolioSnapshot {
	if len(allBars) == 0 || initialInvestment <= 0 {
		return []models.PortfolioSnapshot{}
	}

	tickers := sortedTickers(allBars)
	if len(tickers) == 0 {
		return []models.PortfolioSnapshot{}
	}

	dateToClose := make(map[string]map[string]float64, len(tickers))
	firstCloses := make(map[string]float64, len(tickers))
	perAssetInvestment := initialInvestment / float64(len(tickers))

	for _, ticker := range tickers {
		bars := allBars[ticker]
		if len(bars) == 0 || bars[0].Close <= 0 {
			return []models.PortfolioSnapshot{}
		}

		firstCloses[ticker] = bars[0].Close
		dateToClose[ticker] = make(map[string]float64, len(bars))
		for _, bar := range bars {
			if bar.Close > 0 {
				dateToClose[ticker][bar.Date] = bar.Close
			}
		}
	}

	commonDates := datesPresentInAllTickers(tickers, dateToClose)
	history := make([]models.PortfolioSnapshot, 0, len(commonDates))

	for _, date := range commonDates {
		contributions := make(map[string]float64, len(tickers))
		totalValue := 0.0

		for _, ticker := range tickers {
			value := (dateToClose[ticker][date] / firstCloses[ticker]) * perAssetInvestment
			contributions[ticker] = round(value, 2)
			totalValue += value
		}

		history = append(history, models.PortfolioSnapshot{
			Date:          date,
			TotalValue:    round(totalValue, 2),
			Contributions: contributions,
		})
	}

	return history
}

func ComputePortfolioMetrics(allBars map[string][]models.OHLCBar) models.PortfolioMetrics {
	tickers := sortedTickers(allBars)
	assets := make([]models.TickerMetrics, 0, len(tickers))

	for _, ticker := range tickers {
		bars := allBars[ticker]
		closes := closePrices(bars)
		returns := DailyReturns(closes)
		years := yearsFromBars(bars, returns)

		asset := models.TickerMetrics{
			Ticker:        ticker,
			CAGR:          percent(CAGR(first(closes), last(closes), years)),
			Volatility:    percent(AnnualizedVolatility(returns)),
			Sharpe:        round(SharpeRatio(returns, RiskFreeRate), 4),
			MaxDrawdown:   percent(MaxDrawdown(closes)),
			CurrentPrice:  round(last(closes), 2),
			WeightPercent: WeightPercent,
		}
		assets = append(assets, asset)
	}

	portfolioReturns := equalWeightedPortfolioReturns(tickers, allBars)
	portfolioCloses := compoundedPortfolioValues(portfolioReturns, defaultInvestment)
	years := float64(len(portfolioReturns)) / TradingDays

	totalReturn := 0.0
	if len(portfolioCloses) > 1 && portfolioCloses[0] > 0 {
		totalReturn = (last(portfolioCloses) / portfolioCloses[0]) - 1
	}

	return models.PortfolioMetrics{
		TotalReturn: percent(totalReturn),
		CAGR:        percent(CAGR(first(portfolioCloses), last(portfolioCloses), years)),
		Volatility:  percent(AnnualizedVolatility(portfolioReturns)),
		Sharpe:      round(SharpeRatio(portfolioReturns, RiskFreeRate), 4),
		MaxDrawdown: percent(MaxDrawdown(portfolioCloses)),
		Assets:      assets,
	}
}

func equalWeightedPortfolioReturns(tickers []string, allBars map[string][]models.OHLCBar) []float64 {
	if len(tickers) == 0 {
		return []float64{}
	}

	dateToClose := make(map[string]map[string]float64, len(tickers))
	for _, ticker := range tickers {
		dateToClose[ticker] = make(map[string]float64, len(allBars[ticker]))
		for _, bar := range allBars[ticker] {
			if bar.Close > 0 {
				dateToClose[ticker][bar.Date] = bar.Close
			}
		}
	}

	commonDates := datesPresentInAllTickers(tickers, dateToClose)
	if len(commonDates) < 2 {
		return []float64{}
	}

	returns := make([]float64, 0, len(commonDates)-1)
	for i := 1; i < len(commonDates); i++ {
		previousDate := commonDates[i-1]
		currentDate := commonDates[i]
		sum := 0.0
		valid := 0

		for _, ticker := range tickers {
			previousClose := dateToClose[ticker][previousDate]
			currentClose := dateToClose[ticker][currentDate]
			if previousClose <= 0 || currentClose <= 0 {
				continue
			}

			sum += (currentClose - previousClose) / previousClose
			valid++
		}

		if valid == len(tickers) {
			returns = append(returns, sum/float64(len(tickers)))
		}
	}

	return returns
}

func compoundedPortfolioValues(dailyReturns []float64, initialInvestment float64) []float64 {
	if initialInvestment <= 0 {
		return []float64{}
	}

	values := make([]float64, 0, len(dailyReturns)+1)
	currentValue := initialInvestment
	values = append(values, currentValue)

	for _, dailyReturn := range dailyReturns {
		currentValue *= 1 + dailyReturn
		values = append(values, currentValue)
	}

	return values
}

func closePrices(bars []models.OHLCBar) []float64 {
	closes := make([]float64, 0, len(bars))
	for _, bar := range bars {
		if bar.Close > 0 {
			closes = append(closes, bar.Close)
		}
	}
	return closes
}

func datesPresentInAllTickers(tickers []string, dateToClose map[string]map[string]float64) []string {
	counts := make(map[string]int)
	for _, ticker := range tickers {
		for date := range dateToClose[ticker] {
			counts[date]++
		}
	}

	dates := make([]string, 0, len(counts))
	for date, count := range counts {
		if count == len(tickers) {
			dates = append(dates, date)
		}
	}
	sort.Strings(dates)

	return dates
}

func sortedTickers(allBars map[string][]models.OHLCBar) []string {
	tickers := make([]string, 0, len(allBars))
	for ticker := range allBars {
		tickers = append(tickers, ticker)
	}
	sort.Strings(tickers)
	return tickers
}

func yearsFromBars(bars []models.OHLCBar, returns []float64) float64 {
	years := float64(len(returns)) / TradingDays
	if years > 0 {
		return years
	}
	if len(bars) > 1 {
		return float64(len(bars)-1) / TradingDays
	}
	return 0
}

func mean(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}

	sum := 0.0
	for _, value := range values {
		sum += value
	}
	return sum / float64(len(values))
}

func first(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}
	return values[0]
}

func last(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}
	return values[len(values)-1]
}

func percent(value float64) float64 {
	return round(value*100, 2)
}

func round(value float64, places int) float64 {
	factor := math.Pow(10, float64(places))
	return math.Round(value*factor) / factor
}
