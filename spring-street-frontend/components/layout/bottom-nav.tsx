"use client";

import { LayoutDashboard, PieChart, FileText, Search } from "lucide-react";

interface BottomNavProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onSearch: () => void;
}

export function BottomNav({ activeSection, onNavigate, onSearch }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Mobile bottom navigation">
      <div className="bottom-nav-inner">
        <button
          className={`bottom-nav-item${activeSection === "dashboard" ? " active" : ""}`}
          onClick={() => onNavigate("dashboard")}
          aria-label="Dashboard"
        >
          <LayoutDashboard size={20} strokeWidth={activeSection === "dashboard" ? 2.5 : 1.8} />
          <span>Overview</span>
        </button>

        <button
          className={`bottom-nav-item${activeSection === "portfolio" ? " active" : ""}`}
          onClick={() => onNavigate("portfolio")}
          aria-label="Portfolio"
        >
          <PieChart size={20} strokeWidth={activeSection === "portfolio" ? 2.5 : 1.8} />
          <span>Portfolio</span>
        </button>

        <button
          className="bottom-nav-item"
          onClick={onSearch}
          aria-label="Search"
        >
          <Search size={20} strokeWidth={1.8} />
          <span>Search</span>
        </button>

        <button
          className={`bottom-nav-item${activeSection === "reports" ? " active" : ""}`}
          onClick={() => onNavigate("reports")}
          aria-label="Reports"
        >
          <FileText size={20} strokeWidth={activeSection === "reports" ? 2.5 : 1.8} />
          <span>Reports</span>
        </button>
      </div>
    </nav>
  );
}
