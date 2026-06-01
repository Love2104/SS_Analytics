"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, PieChart, FileText, Activity,
  Settings, User, ChevronLeft, ChevronRight, Search, X
} from "lucide-react";

const NAV_ITEMS = [
  { id: "search", label: "Search", icon: Search, section: null },
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
  onSearchOpen?: () => void;
  onCollapse?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ activeSection, onNavigate, onSearchOpen, onCollapse, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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

  const isVisuallyCollapsed = collapsed && !mobileOpen;

  // On mobile: slide sidebar completely off-screen when closed, slide in when open
  // On desktop: show at full or collapsed width, always at x=0
  const sidebarWidth = isMobile ? 280 : (isVisuallyCollapsed ? 64 : 240);
  const sidebarX = isMobile && !mobileOpen ? -300 : 0;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="backdrop-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onCloseMobile?.()}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`sidebar${isVisuallyCollapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}
        animate={{ width: sidebarWidth, x: sidebarX }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo + Close button */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-[rgba(127,86,217,0.08)] shrink-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#7F56D9]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L15.5 6V12L9 16L2.5 12V6L9 2Z" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M9 5L13 7.5V12.5L9 15L5 12.5V7.5L9 5Z" fill="white" fillOpacity="0.3" />
              <circle cx="9" cy="9" r="2" fill="white" />
            </svg>
          </div>
          <motion.span
            className="text-[15px] font-semibold text-[#101828] whitespace-nowrap tracking-tight"
            animate={{ opacity: isVisuallyCollapsed ? 0 : 1, width: isVisuallyCollapsed ? 0 : "auto" }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden', flex: 1 }}
          >
            Spring Street
          </motion.span>
          {/* Mobile close button */}
          {mobileOpen && (
            <button
              onClick={() => onCloseMobile?.()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(127,86,217,0.12)] text-[#667085] hover:bg-[rgba(127,86,217,0.06)] transition-colors"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Mobile Profile Header */}
        {mobileOpen && (
          <div style={{ padding: "12px 16px 16px", borderBottom: "1px solid var(--border-subtle)", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #7F56D9, #9E77ED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: 14 }}>
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
            animate={{ opacity: isVisuallyCollapsed ? 0 : 1 }}
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
                onClick={() => {
                  if (item.id === "search") {
                    onSearchOpen?.();
                    if (mobileOpen) onCloseMobile?.();
                  } else {
                    onNavigate(item.id);
                    if (mobileOpen) onCloseMobile?.();
                  }
                }}
                title={isVisuallyCollapsed ? item.label : undefined}
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
                  animate={{ opacity: isVisuallyCollapsed ? 0 : 1, width: isVisuallyCollapsed ? 0 : "auto" }}
                  transition={{ duration: 0.15 }}
                >
                  {item.label}
                </motion.span>
              </button>
            );
          })}

          <motion.div
            className="sidebar-section-title"
            animate={{ opacity: isVisuallyCollapsed ? 0 : 1 }}
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
                onClick={() => {
                  onNavigate(item.id);
                  if (mobileOpen) onCloseMobile?.();
                }}
                title={isVisuallyCollapsed ? item.label : undefined}
                aria-label={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  height: 36,
                  padding: "0 12px",
                  margin: "0 12px 4px 12px",
                  backgroundColor: isActive ? "rgba(127,86,217,0.08)" : "transparent",
                  color: isActive ? "#7F56D9" : "var(--text-secondary)",
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
                  animate={{ opacity: isVisuallyCollapsed ? 0 : 1, width: isVisuallyCollapsed ? 0 : "auto" }}
                  transition={{ duration: 0.15 }}
                >
                  {item.label}
                </motion.span>
              </button>
            );
          })}
        </nav>

        {/* Footer / Collapse button (desktop only) */}
        <div className="sidebar-footer hidden-on-mobile">
          <button
            className="sidebar-collapse-btn"
            onClick={toggle}
            aria-label={isVisuallyCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isVisuallyCollapsed ? "Expand" : "Collapse"}
          >
            {isVisuallyCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            <motion.span
              animate={{ opacity: isVisuallyCollapsed ? 0 : 1 }}
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
