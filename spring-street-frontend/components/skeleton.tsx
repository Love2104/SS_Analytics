"use client";

import { motion } from "framer-motion";

export function SkeletonDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Hero skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 24, minHeight: 480, paddingTop: 32 }}>
        <div>
          <div className="skeleton" style={{ width: 180, height: 28, borderRadius: 999, marginBottom: 24 }} />
          <div className="skeleton" style={{ width: "90%", height: 56, borderRadius: 12, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: "70%", height: 56, borderRadius: 12, marginBottom: 24 }} />
          <div className="skeleton" style={{ width: "80%", height: 20, borderRadius: 8, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: "60%", height: 20, borderRadius: 8 }} />
        </div>
        <div className="card" style={{ minHeight: 380 }}>
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="skeleton" style={{ width: "100%", height: 52, borderRadius: 10 }} />
            <div className="skeleton" style={{ width: "100%", height: 1 }} />
            <div className="skeleton" style={{ width: "100%", height: 40, borderRadius: 10 }} />
            <div className="skeleton" style={{ width: "100%", height: 1 }} />
            <div style={{ display: "flex", gap: 16 }}>
              <div className="skeleton" style={{ flex: 1, height: 80, borderRadius: 10 }} />
              <div className="skeleton" style={{ flex: 1, height: 80, borderRadius: 10 }} />
            </div>
          </div>
        </div>
      </div>

      {/* KPI skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card" style={{ minHeight: 190, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <div className="skeleton" style={{ width: 80, height: 12 }} />
              <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 999 }} />
            </div>
            <div className="skeleton" style={{ width: "70%", height: 32, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: "90%", height: 12 }} />
            <div style={{ marginTop: "auto", paddingTop: 16 }}>
              <div className="skeleton" style={{ width: "100%", height: 36, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1.85fr 0.65fr", gap: 16 }}>
        <div className="card" style={{ minHeight: 480, padding: 20 }}>
          <div className="skeleton" style={{ width: 220, height: 18, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 160, height: 14, marginBottom: 24 }} />
          <div className="skeleton" style={{ width: "100%", height: 380, borderRadius: 12 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ padding: 16, flex: 1 }}>
              <div className="skeleton" style={{ width: 80, height: 12, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: "90%", height: 14 }} />
              <div className="skeleton" style={{ width: "70%", height: 14, marginTop: 6 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard({ height = 200 }: { height?: number }) {
  return (
    <div className="card" style={{ padding: 20, minHeight: height }}>
      <div className="skeleton" style={{ width: "60%", height: 18, marginBottom: 12 }} />
      <div className="skeleton" style={{ width: "100%", height: height - 60, borderRadius: 8 }} />
    </div>
  );
}
