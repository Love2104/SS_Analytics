import { AlertTriangle, RefreshCw } from "lucide-react";

type ErrorCardProps = {
  message: string;
  onRetry: () => void;
  title?: string;
};

export function ErrorCard({ message, onRetry, title = "Data request failed" }: ErrorCardProps) {
  return (
    <section className="error-card">
      <AlertTriangle size={18} aria-hidden="true" />
      <div>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
      <button className="retry-button" type="button" onClick={onRetry}>
        <RefreshCw size={15} aria-hidden="true" />
        Retry
      </button>
    </section>
  );
}
