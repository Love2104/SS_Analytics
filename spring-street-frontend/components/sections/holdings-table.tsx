"use client";

import { Fragment, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Download, Filter, Search, SlidersHorizontal } from "lucide-react";
import type { TickerMetrics } from "@/types/market";
import { currency, percent, signedPercent, number } from "@/components/format";
import { getCompanyColor } from "@/lib/colors";

const TICKER_NAMES: Record<string, string> = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corp.",
  GOOGL: "Alphabet Inc.",
  NVDA: "NVIDIA Corp.",
  AMZN: "Amazon.com Inc.",
};

type SortKey = keyof TickerMetrics;

function SortIcon({ active, direction }: { active: boolean; direction: "asc" | "desc" }) {
  if (!active) return <span style={{ opacity: 0.3, fontSize: 10 }}>⇅</span>;
  return <span style={{ fontSize: 10 }}>{direction === "asc" ? "↑" : "↓"}</span>;
}

function SectionHeader({ eyebrow, title, onExport }: { eyebrow: string; title: string; onExport: () => void }) {
  return (
    <div className="section-header">
      <div className="section-label">
        <div className="section-accent-bar" />
        <div>
          <div className="section-eyebrow">{eyebrow}</div>
          <h2 className="section-title">{title}</h2>
        </div>
      </div>
      <button className="btn-ghost" onClick={onExport} aria-label="Export to CSV">
        <Download size={13} />
        Export CSV
      </button>
    </div>
  );
}

interface HoldingsTableProps {
  assets: TickerMetrics[];
}

export function HoldingsTable({ assets }: HoldingsTableProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("cagr");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return assets
      .filter((a) => {
        const name = TICKER_NAMES[a.ticker] ?? "";
        return a.ticker.toLowerCase().includes(query.toLowerCase()) || name.toLowerCase().includes(query.toLowerCase());
      })
      .sort((a, b) => {
        const left = a[sortKey];
        const right = b[sortKey];
        const cmp = typeof left === "string" ? left.localeCompare(String(right)) : Number(left) - Number(right);
        return direction === "asc" ? cmp : -cmp;
      });
  }, [assets, query, sortKey, direction]);

  function sortBy(key: SortKey) {
    if (key === sortKey) { setDirection((d) => (d === "asc" ? "desc" : "asc")); return; }
    setSortKey(key);
    setDirection("desc");
  }

  function exportCsv() {
    const rows = [["Ticker", "Company", "Price", "CAGR", "Volatility", "Sharpe", "Max DD", "Weight"]];
    filtered.forEach((a) => rows.push([
      a.ticker,
      TICKER_NAMES[a.ticker] ?? a.ticker,
      String(a.current_price),
      String(a.cagr),
      String(a.volatility),
      String(a.sharpe),
      String(a.max_drawdown),
      String(a.weight_percent),
    ]));
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spring-street-holdings.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const columns: { key: SortKey; label: string; align?: "left" | "right" }[] = [
    { key: "ticker", label: "Asset", align: "left" },
    { key: "current_price", label: "Price" },
    { key: "cagr", label: "CAGR" },
    { key: "volatility", label: "Volatility" },
    { key: "sharpe", label: "Sharpe" },
    { key: "max_drawdown", label: "Max DD" },
    { key: "weight_percent", label: "Weight" },
  ];

  return (
    <section className="section" aria-label="Portfolio holdings table">
      <SectionHeader eyebrow="06 · Holdings" title="Detailed position review" onExport={exportCsv} />

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="table-toolbar">
            <label className="search-field" htmlFor="holdings-search">
              <Search size={14} />
              <input
                id="holdings-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ticker or company…"
                autoComplete="off"
              />
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <div className="filter-chip" aria-label="Active filter: live holdings">
                <Filter size={13} />
                <span style={{ fontSize: 12.5 }}>Live holdings</span>
              </div>
              <div className="filter-chip" aria-label="Column settings">
                <SlidersHorizontal size={13} />
              </div>
            </div>
          </div>
        </div>

        <div className="data-table-wrap">
          <table className="data-table" aria-label="Holdings data table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => sortBy(col.key)}
                    className={sortKey === col.key ? "sorted" : ""}
                    style={{ textAlign: col.align ?? "right" }}
                    aria-sort={sortKey === col.key ? (direction === "asc" ? "ascending" : "descending") : "none"}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      {col.label}
                      <SortIcon active={sortKey === col.key} direction={direction} />
                    </span>
                  </th>
                ))}
                <th style={{ width: 32 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => {
                const isExp = expanded === asset.ticker;
                return (
                  <Fragment key={asset.ticker}>
                    <tr
                      onClick={() => setExpanded(isExp ? null : asset.ticker)}
                      style={{ cursor: "pointer" }}
                      aria-expanded={isExp}
                    >
                      <td>
                        <div className="asset-name-cell">
                          <strong>{asset.ticker}</strong>
                          <span>{TICKER_NAMES[asset.ticker]}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{currency(asset.current_price)}</td>
                      <td style={{ color: asset.cagr >= 0 ? "var(--accent-green)" : "var(--accent-red)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                        {signedPercent(asset.cagr)}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{percent(asset.volatility)}</td>
                      <td style={{ color: asset.sharpe >= 1 ? "var(--accent-green)" : "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                        {number(asset.sharpe, 2)}
                      </td>
                      <td style={{ color: "var(--accent-red)", fontFamily: "var(--font-mono)" }}>
                        -{percent(asset.max_drawdown)}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{percent(asset.weight_percent, 0)}</td>
                      <td>
                        <motion.div
                          animate={{ rotate: isExp ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <ChevronDown size={15} color="var(--text-tertiary)" />
                        </motion.div>
                      </td>
                    </tr>

                    <AnimatePresence>
                      {isExp && (
                        <tr>
                          <td colSpan={8} style={{ padding: 0 }}>
                            <motion.div
                              className="expanded-row-content"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeOut" }}
                              style={{ overflow: "hidden", borderTop: `2px solid ${getCompanyColor(asset.ticker)}`, backgroundColor: `${getCompanyColor(asset.ticker)}08` }}
                            >
                              <div style={{ padding: "14px 20px" }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
                                  {TICKER_NAMES[asset.ticker]} — Position Analysis
                                </div>
                                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 700 }}>
                                  {asset.ticker} carries a {percent(asset.weight_percent, 0)} target weight with a {signedPercent(asset.cagr)} CAGR and {percent(asset.volatility)} annualized volatility.
                                  {asset.sharpe >= 1
                                    ? ` A Sharpe of ${number(asset.sharpe, 2)} indicates this position is earning adequate returns relative to its risk.`
                                    : ` A Sharpe of ${number(asset.sharpe, 2)} suggests returns may not fully compensate for the risk taken.`}
                                  {" "}Maximum drawdown of {percent(asset.max_drawdown)} should be reviewed against the portfolio-level drawdown tolerance.
                                </p>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "48px 16px", color: "var(--text-tertiary)" }}>
                    No holdings match &ldquo;{query}&rdquo;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
            {filtered.length} of {assets.length} holdings
          </span>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
            Click row to expand · Click column header to sort
          </span>
        </div>
      </motion.div>
    </section>
  );
}
