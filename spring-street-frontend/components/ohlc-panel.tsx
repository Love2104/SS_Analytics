"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Activity, RefreshCw } from "lucide-react";

import { ErrorCard } from "@/components/error-card";
import { compactNumber, currency, number, signedPercent } from "@/components/format";
import { fetchOHLC } from "@/lib/api";
import { SkeletonCard } from "@/components/skeleton";
import type { OHLCBar } from "@/types/market";

type OhlcPanelProps = {
  ticker: string;
  tickers: string[];
  onSelectTicker: (ticker: string) => void;
};

function miniPath(values: number[], width: number, height: number): string {
  if (values.length === 0) {
    return "";
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const step = values.length > 1 ? width / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = index * step;
      const y = (1 - (value - min) / span) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

type Candle = {
  x: number;
  wickTop: number;
  wickBottom: number;
  bodyTop: number;
  bodyHeight: number;
  bullish: boolean;
};

function buildCandles(bars: OHLCBar[], width: number, height: number): Candle[] {
  if (bars.length === 0) {
    return [];
  }

  const lows = bars.map((bar) => bar.low);
  const highs = bars.map((bar) => bar.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const span = Math.max(max - min, 1);
  const step = bars.length > 1 ? width / (bars.length - 1) : width;

  function y(value: number) {
    return (1 - (value - min) / span) * height;
  }

  return bars.map((bar, index) => {
    const openY = y(bar.open);
    const closeY = y(bar.close);
    const bodyTop = Math.min(openY, closeY);
    return {
      x: index * step,
      wickTop: y(bar.high),
      wickBottom: y(bar.low),
      bodyTop,
      bodyHeight: Math.max(2, Math.abs(closeY - openY)),
      bullish: bar.close >= bar.open
    };
  });
}

export function OhlcPanel({ ticker, tickers, onSelectTicker }: OhlcPanelProps) {
  const [bars, setBars] = useState<OHLCBar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadBars(activeRef?: { active: boolean }) {
    let active = true;
    const guard = activeRef ?? { active };
    setIsLoading(true);
    setError(null);

    fetchOHLC(ticker)
      .then((data) => {
        if (guard.active) {
          setBars(data.bars);
        }
      })
      .catch((err: Error) => {
        if (guard.active) {
          setError(err.message);
          setBars([]);
        }
      })
      .finally(() => {
        if (guard.active) {
          setIsLoading(false);
        }
      });
  }

  useEffect(() => {
    const activeRef = { active: true };
    loadBars(activeRef);

    return () => {
      activeRef.active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  const latest = bars[bars.length - 1];
  const first = bars[0];
  const closes = useMemo(() => bars.map((bar) => bar.close), [bars]);
  const recentBars = useMemo(() => bars.slice(-80), [bars]);
  const path = miniPath(closes.slice(-260), 380, 80);
  const candles = useMemo(() => buildCandles(recentBars, 380, 130), [recentBars]);
  const change = first && latest ? ((latest.close - first.close) / first.close) * 100 : null;
  const selectedIndex = Math.max(0, tickers.indexOf(ticker));

  if (isLoading) {
    return <SkeletonCard height={300} />;
  }

  if (error) {
    return <ErrorCard title={`${ticker} OHLC unavailable`} message={error} onRetry={() => loadBars()} />;
  }

  if (!first || !latest || change === null) {
    return <ErrorCard title={`${ticker} OHLC unavailable`} message="The OHLC endpoint returned no bars." onRetry={() => loadBars()} />;
  }

  return (
    <section className="module">
      <div className="module__header">
        <div>
          <p className="eyebrow">OHLC Inspector</p>
          <h2>{ticker}</h2>
        </div>
        {isLoading ? <RefreshCw className="spin" size={16} aria-hidden="true" /> : <Activity size={16} aria-hidden="true" />}
      </div>

      <div className="ticker-tabs" style={{ "--tab-count": tickers.length, "--tab-index": selectedIndex } as CSSProperties}>
        {tickers.map((symbol) => (
          <button className={symbol === ticker ? "is-active" : ""} key={symbol} type="button" onClick={() => onSelectTicker(symbol)}>
            {symbol}
          </button>
        ))}
        <span className="ticker-tabs__indicator" aria-hidden="true" />
      </div>

      <div className="price-stat-row">
        <div>
          <span>Current</span>
          <strong>{currency(latest.close)}</strong>
        </div>
        <div>
          <span>Day High</span>
          <strong className="positive">{currency(latest.high)}</strong>
        </div>
        <div>
          <span>Day Low</span>
          <strong className="negative">{currency(latest.low)}</strong>
        </div>
        <div>
          <span>Volume</span>
          <strong>{compactNumber(latest.volume)}</strong>
        </div>
      </div>

      <div className="mini-chart">
        <svg viewBox="0 0 380 150" role="img" aria-label={`${ticker} candlestick chart`}>
          {candles.map((candle, index) => (
            <g className={candle.bullish ? "candle candle--bullish" : "candle candle--bearish"} key={`${recentBars[index]?.date}-${index}`}>
              <line x1={candle.x} x2={candle.x} y1={candle.wickTop} y2={candle.wickBottom} />
              <rect x={candle.x - 1} y={candle.bodyTop} width="2" height={candle.bodyHeight} />
            </g>
          ))}
          {path ? <path className="close-overlay" d={path} transform="translate(0 42)" /> : null}
        </svg>
      </div>

      <div className="ohlc-grid">
        <span>Open</span>
        <strong>{currency(latest.open)}</strong>
        <span>Close</span>
        <strong>{currency(latest.close)}</strong>
        <span>Return</span>
        <strong className={change >= 0 ? "positive" : "negative"}>{signedPercent(change)}</strong>
        <span>Bars</span>
        <strong>{number(bars.length, 0)}</strong>
      </div>
    </section>
  );
}
