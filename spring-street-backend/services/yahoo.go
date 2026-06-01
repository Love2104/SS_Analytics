package services

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	finance "github.com/piquette/finance-go"
	"github.com/piquette/finance-go/chart"
	"github.com/piquette/finance-go/datetime"
	"github.com/yourusername/spring-street-backend/models"
)

const yahooFetchAttempts = 3

type yahooHeaderTransport struct {
	base http.RoundTripper
}

func init() {
	finance.SetHTTPClient(&http.Client{
		Timeout: 80 * time.Second,
		Transport: yahooHeaderTransport{
			base: http.DefaultTransport,
		},
	})
}

func (t yahooHeaderTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36")
	req.Header.Set("Accept", "application/json,text/plain,*/*")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Connection", "keep-alive")

	base := t.base
	if base == nil {
		base = http.DefaultTransport
	}
	return base.RoundTrip(req)
}

func FetchOHLC(ticker string, years int) ([]models.OHLCBar, error) {
	symbol := strings.ToUpper(strings.TrimSpace(ticker))
	if symbol == "" {
		return nil, fmt.Errorf("ticker is required")
	}
	if years <= 0 {
		return nil, fmt.Errorf("years must be positive")
	}

	var lastErr error
	for attempt := 1; attempt <= yahooFetchAttempts; attempt++ {
		bars, err := fetchOHLCOnce(symbol, years)
		if err == nil {
			return bars, nil
		}
		lastErr = err
		if attempt < yahooFetchAttempts {
			time.Sleep(time.Duration(attempt) * 750 * time.Millisecond)
		}
	}

	return nil, fmt.Errorf("fetch %s chart data after %d attempts: %w", symbol, yahooFetchAttempts, lastErr)
}

func fetchOHLCOnce(symbol string, years int) ([]models.OHLCBar, error) {
	end := time.Now()
	start := end.AddDate(-years, 0, 0)

	params := &chart.Params{
		Symbol:   symbol,
		Start:    datetime.New(&start),
		End:      datetime.New(&end),
		Interval: datetime.OneDay,
	}

	iter := chart.Get(params)
	var bars []models.OHLCBar

	for iter.Next() {
		b := iter.Bar()
		if b == nil {
			continue
		}

		open, _ := b.Open.Float64()
		high, _ := b.High.Float64()
		low, _ := b.Low.Float64()
		closePrice, _ := b.Close.Float64()

		bar := models.OHLCBar{
			Date:   time.Unix(int64(b.Timestamp), 0).UTC().Format("2006-01-02"),
			Open:   open,
			High:   high,
			Low:    low,
			Close:  closePrice,
			Volume: float64(b.Volume),
		}
		bars = append(bars, bar)
	}

	if err := iter.Err(); err != nil {
		return nil, err
	}
	if len(bars) == 0 {
		return nil, fmt.Errorf("no OHLC data returned for %s", symbol)
	}

	return bars, nil
}
