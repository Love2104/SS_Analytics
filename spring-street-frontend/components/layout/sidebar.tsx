"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, PieChart, FileText, Activity,
  Settings, User, ChevronLeft, ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: null },
  { id: "portfolio", label: "Portfolio", icon: PieChart, section: null },
  { id: "reports", label: "Reports", icon: FileText, section: null },
  { id: "activity", label: "Activity", icon: Activity, section: null },
  { id: "settings", label: "Settings", icon: Settings, section: "more" },
  { id: "profile", label: "Profile", icon: User, section: "more" },
];

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onCollapse?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ activeSection, onNavigate, onCollapse, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
    onCollapse?.(next);
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const mainItems = NAV_ITEMS.filter((i) => !i.section);
  const moreItems = NAV_ITEMS.filter((i) => i.section === "more");

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="backdrop-overlay md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onCloseMobile?.()}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}
        style={{ width: mobileOpen ? "280px" : (collapsed ? "var(--sidebar-collapsed-w)" : "var(--sidebar-w)") }}
        animate={{ width: mobileOpen ? 280 : (collapsed ? 64 : 240) }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" aria-label="Spring Street logo">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L15.5 6V12L9 16L2.5 12V6L9 2Z" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M9 5L13 7.5V12.5L9 15L5 12.5V7.5L9 5Z" fill="white" fillOpacity="0.3" />
              <circle cx="9" cy="9" r="2" fill="white" />
            </svg>
          </div>
          <motion.span
            className="sidebar-logo-text"
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.15 }}
          >
            Spring Street
          </motion.span>
        </div>

        {/* Mobile Profile Header */}
        {mobileOpen && (
          <div style={{ padding: "0 16px 16px", borderBottom: "1px solid var(--border-subtle)", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--accent-cyan)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: "bold" }}>
                JD
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>John Doe</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Pro Member</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          <motion.div
            className="sidebar-section-title"
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.15 }}
          >
            Workspace
          </motion.div>

          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  height: 36,
                  padding: "0 12px",
                  margin: "0 12px 4px 12px",
                  backgroundColor: isActive ? "rgba(127,86,217,0.08)" : "transparent",
                  color: isActive ? "#7F56D9" : "var(--text-secondary)",
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: isActive ? 500 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  transition: "background 150ms ease, color 150ms ease",
                  cursor: "pointer",
                  width: "calc(100% - 24px)",
                  textAlign: "left",
                  border: "none"
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "rgba(127,86,217,0.04)";
                    e.currentTarget.style.color = "#101828";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                <motion.span
                  className="sidebar-nav-label"
                  animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                  transition={{ duration: 0.15 }}
                >
                  {item.label}
                </motion.span>
              </button>
            );
          })}

          <motion.div
            className="sidebar-section-title"
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.15 }}
            style={{ marginTop: 8 }}
          >
            Tools
          </motion.div>

          {moreItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  height: 36,
                  padding: "0 12px",
                  margin: "0 12px 4px 12px",
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                  color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                  borderRadius: 6,
                  fontSize: 13.5,
                  fontWeight: isActive ? 500 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  transition: "background 150ms ease, color 150ms ease",
                  cursor: "pointer",
                  width: "calc(100% - 24px)",
                  textAlign: "left",
                  border: "none"
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "rgba(127,86,217,0.04)";
                    e.currentTarget.style.color = "#101828";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                <motion.span
                  className="sidebar-nav-label"
                  animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                  transition={{ duration: 0.15 }}
                >
                  {item.label}
                </motion.span>
              </button>
            );
          })}
        </nav>

        {/* Footer / Collapse button */}
        <div className="sidebar-footer hidden-on-mobile">
          <button
            className="sidebar-collapse-btn"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            <motion.span
              animate={{ opacity: collapsed ? 0 : 1 }}
              transition={{ duration: 0.15 }}
              style={{ fontSize: 12 }}
            >
              Collapse
            </motion.span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
