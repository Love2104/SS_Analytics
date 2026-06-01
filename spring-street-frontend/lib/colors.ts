export const COMPANY_COLORS: Record<string, string> = {
  AAPL: "#E8E8ED",
  MSFT: "#00A4EF",
  GOOGL: "#EA4335",
  NVDA: "#76B900",
  AMZN: "#FF9900",
};

export const DEFAULT_ACCENT = "#00d4ff";

export function getCompanyColor(ticker: string): string {
  return COMPANY_COLORS[ticker] || DEFAULT_ACCENT;
}

/**
 * Creates a slightly desaturated, darker version of a hex color for bearish candles.
 */
export function getBearishColor(hex: string): string {
  // Simple fallback mapping since we have fixed colors
  const mapped: Record<string, string> = {
    "#E8E8ED": "#8E8E93", // AAPL
    "#00A4EF": "#005A85", // MSFT
    "#EA4335": "#8C281F", // GOOGL
    "#76B900": "#466E00", // NVDA
    "#FF9900": "#995C00", // AMZN
  };
  return mapped[hex] || "#475569";
}

/**
 * Creates an RGBA string with a specific opacity from a hex color.
 */
export function hexToRgba(hex: string, opacity: number): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
