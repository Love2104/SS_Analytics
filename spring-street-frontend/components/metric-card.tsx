import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "positive" | "negative" | "neutral" | "warning";
  icon: LucideIcon;
  trend?: "up" | "down";
};

export function MetricCard({ label, value, detail, tone = "neutral", icon: Icon, trend }: MetricCardProps) {
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <section className="metric-card">
      <span className="metric-card__scanline" aria-hidden="true" />
      <span className="metric-card__top-border" aria-hidden="true" />
      <svg className="metric-card__trace" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect x="1" y="1" width="98" height="98" rx="2" />
      </svg>
      <div className="metric-card__topline">
        <span>{label}</span>
        <Icon aria-hidden="true" size={16} />
      </div>
      <strong className={`metric-card__value metric-card__value--${tone}`}>
        {value}
        {trend ? <TrendIcon className={`trend-icon trend-icon--${trend}`} size={18} aria-hidden="true" /> : null}
      </strong>
      <p>{detail}</p>
    </section>
  );
}
