# Spring Street Backend

Production-ready Go backend for a Market Insights & Portfolio Analytics tool.

## Run

```bash
go mod tidy
go run main.go
```

The API listens on `http://localhost:8080`.

Data is fetched live from Yahoo Finance on every request using `github.com/piquette/finance-go`. There is no database and no persistent cache.

## Endpoints

### Health

```bash
curl http://localhost:8080/health
```

### OHLC

Fetches 5 years of daily OHLCV bars for a single ticker.

```bash
curl "http://localhost:8080/api/ohlc?ticker=AAPL"
```

### Portfolio

Fetches all fixed portfolio tickers concurrently and returns equal-weighted portfolio history using a `$100,000` initial investment.

```bash
curl http://localhost:8080/api/portfolio
```

### Metrics

Fetches all fixed portfolio tickers concurrently and returns portfolio metrics, per-asset metrics, and portfolio history.

```bash
curl http://localhost:8080/api/metrics
```
