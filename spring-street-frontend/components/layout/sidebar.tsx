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

  // On mobile when open, never show as collapsed
  const isVisuallyCollapsed = collapsed && !mobileOpen;

  const handleItemClick = (itemId: string) => {
    if (itemId === "search") {
      onSearchOpen?.();
    } else {
      onNavigate(itemId);
    }
    if (mobileOpen) onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile overlay — only renders on mobile when sidebar is open */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onCloseMobile?.()}
          />
        )}
      </AnimatePresence>

      {/* 
        DESKTOP: position: fixed, always visible, no x/transform animation.
                 Width animates between 240px and 64px (collapsed).
                 The .main-area uses margin-left to push content.
        MOBILE:  position: fixed, slides in/out via CSS transform.
                 Uses the .mobile-open class to translateX(0).
      */}
      <aside
        className={`sidebar ${isVisuallyCollapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
        style={{ width: isVisuallyCollapsed ? 64 : 240 }}
      >
        {/* Logo + Close button */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" aria-label="Spring Street logo">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L15.5 6V12L9 16L2.5 12V6L9 2Z" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M9 5L13 7.5V12.5L9 15L5 12.5V7.5L9 5Z" fill="white" fillOpacity="0.3" />
              <circle cx="9" cy="9" r="2" fill="white" />
            </svg>
          </div>
          {!isVisuallyCollapsed && (
            <span className="sidebar-logo-text">Spring Street</span>
          )}
          {/* Mobile close button */}
          {mobileOpen && (
            <button
              onClick={() => onCloseMobile?.()}
              className="sidebar-close-btn"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Mobile Profile Header */}
        {mobileOpen && (
          <div className="sidebar-profile">
            <div className="sidebar-profile-avatar">JD</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>John Doe</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Pro Member</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {!isVisuallyCollapsed && (
            <div className="sidebar-section-title">Workspace</div>
          )}

          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleItemClick(item.id)}
                title={isVisuallyCollapsed ? item.label : undefined}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                {!isVisuallyCollapsed && (
                  <span className="sidebar-nav-label">{item.label}</span>
                )}
              </button>
            );
          })}

          {!isVisuallyCollapsed && (
            <div className="sidebar-section-title" style={{ marginTop: 8 }}>Tools</div>
          )}

          {moreItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleItemClick(item.id)}
                title={isVisuallyCollapsed ? item.label : undefined}
                aria-label={item.label}
              >
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                {!isVisuallyCollapsed && (
                  <span className="sidebar-nav-label">{item.label}</span>
                )}
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
            {!isVisuallyCollapsed && <span style={{ fontSize: 12 }}>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
