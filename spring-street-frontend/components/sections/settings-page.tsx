"use client";

import { useState } from "react";
import { getCompanyColor } from "@/lib/colors";
import { Monitor, Moon, Sun } from "lucide-react";

export function SettingsPage() {
  const [theme, setTheme] = useState("dark");
  const [refresh, setRefresh] = useState("Off");

  const TICKERS = ["AAPL", "MSFT", "GOOGL", "NVDA", "AMZN"];

  return (
    <div className="section" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 100 }}>
      <div style={{ marginBottom: 40 }}>
        <h1 className="section-title">Settings</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>Manage your preferences and workspace configuration.</p>
      </div>

      <div style={{ display: "grid", gap: 32 }}>
        {/* Appearance */}
        <div className="card card-pad">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border-subtle)" }}>Appearance</h2>
          
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Theme</div>
            <div style={{ display: "flex", gap: 12 }}>
              {["dark", "light", "system"].map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    flex: 1, padding: "12px", border: `1px solid ${theme === t ? "var(--border-focus)" : "var(--border-subtle)"}`,
                    borderRadius: "var(--radius-md)", background: theme === t ? "rgba(255,255,255,0.05)" : "transparent",
                    color: theme === t ? "var(--text-primary)" : "var(--text-secondary)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    textTransform: "capitalize", fontSize: 13
                  }}
                >
                  {t === "dark" ? <Moon size={16} /> : t === "light" ? <Sun size={16} /> : <Monitor size={16} />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Accent Color</div>
            <div style={{ display: "flex", gap: 12 }}>
              {["#00d4ff", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6"].map(c => (
                <div key={c} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: "2px solid var(--surface-1)", outline: c === "#00d4ff" ? `2px solid ${c}` : "none", cursor: "pointer" }} />
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Chart Style</div>
            <div style={{ display: "flex", gap: 12 }}>
              {["Candles", "Line", "Area"].map((s, i) => (
                <button key={s} style={{ padding: "8px 16px", border: `1px solid ${i === 0 ? "var(--border-focus)" : "var(--border-subtle)"}`, borderRadius: "var(--radius-md)", background: i === 0 ? "rgba(255,255,255,0.05)" : "transparent", color: i === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontSize: 13 }}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Data & Refresh */}
        <div className="card card-pad">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border-subtle)" }}>Data & Refresh</h2>
          
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Base API URL</div>
            <input 
              type="text" 
              defaultValue="http://localhost:8080"
              style={{ width: "100%", padding: "10px 16px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-3)", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: 13 }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Auto-refresh Interval</div>
            <div style={{ display: "flex", gap: 12 }}>
              {["Off", "1min", "5min", "15min"].map(r => (
                <button
                  key={r}
                  onClick={() => setRefresh(r)}
                  style={{ padding: "8px 16px", border: `1px solid ${refresh === r ? "var(--border-focus)" : "var(--border-subtle)"}`, borderRadius: "var(--radius-md)", background: refresh === r ? "rgba(255,255,255,0.05)" : "transparent", color: refresh === r ? "var(--text-primary)" : "var(--text-secondary)", fontSize: 13 }}
                >{r}</button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Cache duration: <span style={{ fontFamily: "var(--font-mono)" }}>No cache (live fetches)</span></div>
          </div>
        </div>

        {/* Portfolio */}
        <div className="card card-pad">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border-subtle)" }}>Portfolio Configuration</h2>
          
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Initial Investment</div>
            <div style={{ fontSize: 24, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>$100,000</div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Holdings (Equal Weight)</div>
            <div style={{ display: "grid", gap: 12 }}>
              {TICKERS.map(ticker => {
                const color = getCompanyColor(ticker);
                return (
                  <div key={ticker} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 60, fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                      {ticker}
                    </div>
                    <div style={{ flex: 1, height: 6, background: "var(--surface-3)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                      <div style={{ width: "20%", height: "100%", background: color }} />
                    </div>
                    <div style={{ width: 40, textAlign: "right", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>20%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
