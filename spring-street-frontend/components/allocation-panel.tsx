import type { PortfolioSnapshot } from "@/types/market";
import { currency, percent } from "@/components/format";

type AllocationPanelProps = {
  tickers: string[];
  latest?: PortfolioSnapshot;
};

export function AllocationPanel({ tickers, latest }: AllocationPanelProps) {
  if (!latest || latest.total_value <= 0) {
    return null;
  }

  const total = latest.total_value;

  return (
    <section className="module">
      <div className="module__header">
        <div>
          <p className="eyebrow">Exposure</p>
          <h2>Allocation</h2>
        </div>
      </div>

      <div className="allocation-list contribution-chart">
        {tickers.map((ticker) => {
          const value = latest.contributions[ticker];
          if (typeof value !== "number") {
            return null;
          }
          const share = (value / total) * 100;
          return (
            <div className="allocation-row" key={ticker}>
              <div className="allocation-row__meta">
                <span>{ticker}</span>
                <span>{currency(value)}</span>
              </div>
              <div className="allocation-track">
                <div style={{ width: `${Math.max(0, Math.min(share, 100))}%` }} />
              </div>
              <span className="allocation-row__share">{percent(share)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
