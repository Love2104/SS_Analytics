import type { InsightsResponse, PortfolioResponse, TickerOHLC } from "@/types/market";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function fetchInsights(): Promise<InsightsResponse> {
  return requestJson<InsightsResponse>("/api/metrics");
}

export function fetchPortfolio(): Promise<PortfolioResponse> {
  return requestJson<PortfolioResponse>("/api/portfolio");
}

export function fetchOHLC(ticker: string): Promise<TickerOHLC> {
  return requestJson<TickerOHLC>(`/api/ohlc?ticker=${encodeURIComponent(ticker)}`);
}
