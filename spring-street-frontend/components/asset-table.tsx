"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";

import type { TickerMetrics } from "@/types/market";
import { currency, number, percent, signedPercent } from "@/components/format";

type AssetTableProps = {
  assets: TickerMetrics[];
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
};

export function AssetTable({ assets, selectedTicker, onSelectTicker }: AssetTableProps) {
  const [sortKey, setSortKey] = useState<keyof TickerMetrics>("ticker");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      const result = typeof left === "string" && typeof right === "string" ? left.localeCompare(right) : Number(left) - Number(right);
      return sortDirection === "asc" ? result : -result;
    });
  }, [assets, sortDirection, sortKey]);
  const maxAbsCagr = Math.max(...assets.map((asset) => Math.abs(asset.cagr)), 1);
  const maxAbsSharpe = Math.max(...assets.map((asset) => Math.abs(asset.sharpe)), 1);

  function handleSort(nextKey: keyof TickerMetrics) {
    if (nextKey === sortKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDirection("asc");
  }

  function header(label: string, key: keyof TickerMetrics) {
    const active = sortKey === key;
    return (
      <button className="sort-button" type="button" onClick={() => handleSort(key)}>
        {label}
        <ArrowUpDown className={active && sortDirection === "desc" ? "is-desc" : ""} size={13} aria-hidden="true" />
      </button>
    );
  }

  return (
    <section className="module module--wide">
      <div className="module__header">
        <div>
          <p className="eyebrow">Constituents</p>
          <h2>Asset Metrics</h2>
        </div>
        <span className="status-tag">Equal Weight</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>{header("Price", "current_price")}</th>
              <th>{header("CAGR", "cagr")}</th>
              <th>{header("Volatility", "volatility")}</th>
              <th>{header("Sharpe", "sharpe")}</th>
              <th>{header("Max DD", "max_drawdown")}</th>
              <th>{header("Weight", "weight_percent")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedAssets.map((asset) => (
              <tr
                key={asset.ticker}
                className={selectedTicker === asset.ticker ? "is-selected" : ""}
                onClick={() => onSelectTicker(asset.ticker)}
              >
                <td>
                  <button className="ticker-button" type="button">
                    {asset.ticker}
                  </button>
                </td>
                <td>{currency(asset.current_price)}</td>
                <td className={`progress-cell ${asset.cagr >= 0 ? "positive" : "negative"}`}>
                  <span style={{ width: `${Math.min(100, (Math.abs(asset.cagr) / maxAbsCagr) * 100)}%` }} />
                  <strong>{signedPercent(asset.cagr)}</strong>
                </td>
                <td>{percent(asset.volatility)}</td>
                <td className={`progress-cell ${asset.sharpe >= 0 ? "positive" : "negative"}`}>
                  <span style={{ width: `${Math.min(100, (Math.abs(asset.sharpe) / maxAbsSharpe) * 100)}%` }} />
                  <strong>{number(asset.sharpe, 2)}</strong>
                </td>
                <td className="negative">{percent(asset.max_drawdown)}</td>
                <td>{percent(asset.weight_percent, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
