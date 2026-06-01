"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Sun, Moon, Monitor, RefreshCw, ChevronDown } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

function isMarketOpen(): boolean {
  const now = new Date();
  const ny = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = ny.getDay();
  const h = ny.getHours();
  const m = ny.getMinutes();
  const minutes = h * 60 + m;
  return day >= 1 && day <= 5 && minutes >= 570 && minutes < 960; // 9:30–16:00
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const options = [
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "system" as const, label: "System", icon: Monitor },
  ];

  const current = options.find((o) => o.value === theme) ?? options[0];
  const Icon = current.icon;

  return (
    <div style={{ position: "relative" }}>
      <button
        className="navbar-icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle theme"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -30, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <Icon size={16} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            aria-label="Theme options"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              minWidth: 140,
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              background: "var(--bg-elevated)",
              boxShadow: "var(--shadow-lg)",
              padding: "6px",
              zIndex: 1000,
            }}
          >
            {options.map((opt) => {
              const OIcon = opt.icon;
              return (
                <button
                  key={opt.value}
                  role="option"
                  aria-selected={theme === opt.value}
                  onClick={() => { setTheme(opt.value); setOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    background: theme === opt.value ? "var(--surface-hover)" : "transparent",
                    color: theme === opt.value ? "var(--text-primary)" : "var(--text-secondary)",
                    fontSize: 13,
                    fontWeight: theme === opt.value ? 600 : 400,
                    cursor: "pointer",
                    transition: "background 120ms ease",
                  }}
                >
                  <OIcon size={14} />
                  {opt.label}
                  {theme === opt.value && (
                    <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "var(--accent-cyan)" }} />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close on outside click */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 999 }}
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}

interface NavbarProps {
  sidebarCollapsed: boolean;
  onSearchOpen: () => void;
  lastUpdated: string | null;
  onNavigate: (section: string) => void;
}

export function Navbar({ sidebarCollapsed, onSearchOpen, lastUpdated, onNavigate }: NavbarProps) {
  const open = isMarketOpen();
  const [now, setNow] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "America/New_York" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className={`navbar${sidebarCollapsed ? " sidebar-collapsed" : ""}`} role="banner">
      {/* Market Status */}
      <div className="market-status" aria-label={open ? "Market open" : "Market closed"}>
        <div className={`market-status-dot${open ? "" : " closed"}`} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: open ? "var(--accent-green)" : "var(--text-tertiary)" }}>
          {open ? "LIVE" : "CLOSED"}
        </span>
        <span style={{ color: "var(--text-tertiary)" }}>NYSE · {now} ET</span>
      </div>

      {/* Search */}
      <button
        className="navbar-search"
        onClick={onSearchOpen}
        aria-label="Open search (Ctrl+K)"
      >
        <Search size={14} />
        <span>Search stocks, sections…</span>
        <kbd>⌘K</kbd>
      </button>

      {/* Right actions */}
      <div className="navbar-right">
        {lastUpdated && (
          <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 5 }}>
            <RefreshCw size={11} />
            {new Date(lastUpdated).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            className="navbar-icon-btn"
            aria-label="Notifications"
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Bell size={16} />
            <div className="navbar-badge" aria-label="3 notifications" />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 300,
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-xl)",
                  background: "var(--bg-elevated)",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 1000,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                  <span style={{ fontSize: 11, color: "var(--accent-cyan)", cursor: "pointer" }}>Mark all read</span>
                </div>
                {[
                  { title: "NVDA up +4.2% today", time: "2 min ago", dot: "var(--accent-green)" },
                  { title: "Portfolio hit new all-time high", time: "1 hr ago", dot: "var(--accent-cyan)" },
                  { title: "Sharpe ratio improved to 1.24", time: "Yesterday", dot: "var(--accent-purple)" },
                ].map((n) => (
                  <div key={n.title} style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", transition: "background 120ms ease" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.dot, marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {notifOpen && <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={() => setNotifOpen(false)} />}
        </div>

        <ThemeToggle />

        {/* Profile */}
        <button
          className="profile-avatar"
          aria-label="User profile menu"
          aria-haspopup="true"
          onClick={() => onNavigate("profile")}
        >
          SS
        </button>
      </div>
    </header>
  );
}
