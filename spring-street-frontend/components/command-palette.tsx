"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutDashboard, TrendingUp, BarChart2, PieChart,
  Sun, Moon, Monitor, Star, FileText, Hash, ArrowRight
} from "lucide-react";

type CmdItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  group: string;
  action: () => void;
  shortcut?: string;
};

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
  onTheme: (theme: "dark" | "light" | "system") => void;
}

export function CommandPalette({ open, onClose, onNavigate, onTheme }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allItems: CmdItem[] = [
    { id: "stock-aapl", label: "Apple Inc. (AAPL)", description: "View AAPL analysis", icon: Hash, group: "Stocks", action: () => { onNavigate("company-AAPL"); onClose(); } },
    { id: "stock-msft", label: "Microsoft Corp. (MSFT)", description: "View MSFT analysis", icon: Hash, group: "Stocks", action: () => { onNavigate("company-MSFT"); onClose(); } },
    { id: "stock-nvda", label: "NVIDIA Corp. (NVDA)", description: "View NVDA analysis", icon: Hash, group: "Stocks", action: () => { onNavigate("company-NVDA"); onClose(); } },
    { id: "stock-googl", label: "Alphabet Inc. (GOOGL)", description: "View GOOGL analysis", icon: Hash, group: "Stocks", action: () => { onNavigate("company-GOOGL"); onClose(); } },
    { id: "stock-amzn", label: "Amazon.com Inc. (AMZN)", description: "View AMZN analysis", icon: Hash, group: "Stocks", action: () => { onNavigate("company-AMZN"); onClose(); } },
    { id: "nav-dashboard", label: "Go to Dashboard", icon: LayoutDashboard, group: "Navigate", action: () => { onNavigate("dashboard"); onClose(); } },
    { id: "nav-portfolio", label: "Go to Portfolio", icon: PieChart, group: "Navigate", action: () => { onNavigate("portfolio"); onClose(); } },
    { id: "nav-market", label: "Market Insights", icon: TrendingUp, group: "Navigate", action: () => { onNavigate("market"); onClose(); } },
    { id: "nav-analytics", label: "Analytics", icon: BarChart2, group: "Navigate", action: () => { onNavigate("analytics"); onClose(); } },
    { id: "nav-watchlist", label: "Watchlist", icon: Star, group: "Navigate", action: () => { onNavigate("watchlist"); onClose(); } },
    { id: "nav-reports", label: "Reports", icon: FileText, group: "Navigate", action: () => { onNavigate("reports"); onClose(); } },
    { id: "theme-dark", label: "Switch to Dark Mode", icon: Moon, group: "Theme", action: () => { onTheme("dark"); onClose(); } },
    { id: "theme-light", label: "Switch to Light Mode", icon: Sun, group: "Theme", action: () => { onTheme("light"); onClose(); } },
    { id: "theme-system", label: "Use System Theme", icon: Monitor, group: "Theme", action: () => { onTheme("system"); onClose(); } },
  ];

  const filtered = query
    ? allItems.filter((i) =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        (i.description ?? "").toLowerCase().includes(query.toLowerCase()) ||
        i.group.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  // Group filtered results
  const groups: Record<string, CmdItem[]> = {};
  filtered.forEach((item) => {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  });

  const flat = filtered;

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, flat.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); return; }
      if (e.key === "Enter" && flat[selected]) { flat[selected].action(); return; }
    },
    [open, flat, selected, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmd-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            className="cmd-panel"
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="cmd-input-wrap">
              <Search size={17} color="var(--text-tertiary)" />
              <input
                ref={inputRef}
                className="cmd-input"
                placeholder="Search commands, stocks, sections…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <kbd style={{ padding: "3px 7px", border: "1px solid var(--border-subtle)", borderRadius: 4, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", background: "var(--surface-3)" }}>
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="cmd-results" role="listbox">
              {flat.length === 0 ? (
                <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-tertiary)", fontSize: 14 }}>
                  No results for &ldquo;{query}&rdquo;
                </div>
              ) : (
                Object.entries(groups).map(([group, items]) => (
                  <div key={group}>
                    <div className="cmd-section-title">{group}</div>
                    {items.map((item) => {
                      const Icon = item.icon;
                      const idx = flat.indexOf(item);
                      return (
                        <motion.button
                          key={item.id}
                          className="cmd-item"
                          data-selected={idx === selected ? "true" : "false"}
                          onClick={item.action}
                          onMouseEnter={() => setSelected(idx)}
                          role="option"
                          aria-selected={idx === selected}
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.1 }}
                          style={{ width: "100%", textAlign: "left", border: "none" }}
                        >
                          <div className="cmd-item-icon">
                            <Icon size={14} />
                          </div>
                          <div className="cmd-item-label">
                            <div style={{ fontSize: 14, color: "var(--text-primary)" }}>{item.label}</div>
                            {item.description && (
                              <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 1 }}>{item.description}</div>
                            )}
                          </div>
                          {idx === selected && (
                            <ArrowRight size={13} color="var(--text-tertiary)" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 16, alignItems: "center" }}>
              {[
                { key: "↑↓", label: "navigate" },
                { key: "↵", label: "select" },
                { key: "esc", label: "close" },
              ].map((k) => (
                <div key={k.key} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <kbd style={{ padding: "2px 6px", border: "1px solid var(--border-subtle)", borderRadius: 4, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", background: "var(--surface-3)" }}>
                    {k.key}
                  </kbd>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{k.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
