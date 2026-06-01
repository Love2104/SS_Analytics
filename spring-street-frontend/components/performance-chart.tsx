"use client";

import { useMemo, useState } from "react";
import type { PointerEvent } from "react";

import type { PortfolioSnapshot } from "@/types/market";
import { compactCurrency } from "@/components/format";

type PerformanceChartProps = {
  history: PortfolioSnapshot[];
};

const RANGES = [
  { label: "1Y", bars: 252 },
  { label: "3Y", bars: 756 },
  { label: "5Y", bars: Number.POSITIVE_INFINITY }
] as const;

function buildPath(values: number[], width: number, height: number, padding: number): string {
  if (values.length === 0) {
    return "";
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = padding + index * step;
      const y = padding + (1 - (value - min) / span) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

type ChartPoint = {
  x: number;
  y: number;
  value: number;
  date: string;
};

function buildPoints(history: PortfolioSnapshot[], width: number, height: number, padding: number): ChartPoint[] {
  const values = history.map((snapshot) => snapshot.total_value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const step = history.length > 1 ? (width - padding * 2) / (history.length - 1) : 0;

  return history.map((snapshot, index) => {
    const x = padding + index * step;
    const y = padding + (1 - (snapshot.total_value - min) / span) * (height - padding * 2);
    return { x, y, value: snapshot.total_value, date: snapshot.date };
  });
}

export function PerformanceChart({ history }: PerformanceChartProps) {
  const width = 920;
  const height = 480;
  const padding = 28;
  const [activeRange, setActiveRange] = useState<(typeof RANGES)[number]["label"]>("5Y");
  const [cursorIndex, setCursorIndex] = useState<number | null>(null);
  const visibleHistory = useMemo(() => {
    const selected = RANGES.find((range) => range.label === activeRange);
    const bars = selected?.bars === Number.POSITIVE_INFINITY ? history.length : selected?.bars ?? history.length;
    return history.slice(-bars);
  }, [activeRange, history]);

  if (visibleHistory.length === 0) {
    return null;
  }
  const values = visibleHistory.map((snapshot) => snapshot.total_value);
  const points = buildPoints(visibleHistory, width, height, padding);
  const path = buildPath(values, width, height, padding);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const startDate = visibleHistory[0].date;
  const endDate = visibleHistory[visibleHistory.length - 1].date;
  const cursor = cursorIndex === null ? null : points[cursorIndex];

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * width;
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    points.forEach((point, index) => {
      const nextDistance = Math.abs(point.x - x);
      if (nextDistance < distance) {
        distance = nextDistance;
        nearest = index;
      }
    });
    setCursorIndex(nearest);
  }

  return (
    <section className="module module--wide">
      <div className="module__header">
        <div>
          <p className="eyebrow">Portfolio Value</p>
          <h2>Portfolio Performance</h2>
        </div>
        <div className="chart-range">
          <span>{startDate}</span>
          <span>{endDate}</span>
        </div>
      </div>

      <div className="range-toggle" role="group" aria-label="Portfolio time range">
        {RANGES.map((range) => (
          <button
            className={activeRange === range.label ? "is-active" : ""}
            key={range.label}
            type="button"
            onClick={() => setActiveRange(range.label)}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="chart-shell" aria-label="Portfolio performance chart">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          onPointerLeave={() => setCursorIndex(null)}
          onPointerMove={handlePointerMove}
        >
          <defs>
            <linearGradient id="portfolio-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="chart-grid">
            {[0, 1, 2, 3].map((line) => {
              const y = padding + line * ((height - padding * 2) / 3);
              return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} />;
            })}
          </g>
          {path ? (
            <>
              <path d={`${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`} fill="url(#portfolio-fill)" />
              <path className="chart-line" d={path} />
            </>
          ) : null}
          {cursor ? (
            <g className="chart-cursor">
              <line x1={cursor.x} x2={cursor.x} y1={padding} y2={height - padding} />
              <circle cx={cursor.x} cy={cursor.y} r="5" />
            </g>
          ) : null}
        </svg>
        {cursor ? (
          <div className="chart-tooltip" style={{ left: `${(cursor.x / width) * 100}%`, top: `${cursor.y}px` }}>
            <span>{cursor.date}</span>
            <strong>{compactCurrency(cursor.value)}</strong>
          </div>
        ) : null}
        <div className="chart-axis chart-axis--top">{compactCurrency(max)}</div>
        <div className="chart-axis chart-axis--bottom">{compactCurrency(min)}</div>
      </div>
    </section>
  );
}
