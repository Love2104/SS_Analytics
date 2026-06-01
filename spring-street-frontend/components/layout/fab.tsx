"use client";

import { Plus } from "lucide-react";

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  return (
    <button className="fab" onClick={onClick} aria-label="Quick Action">
      <Plus size={24} strokeWidth={2.5} />
    </button>
  );
}
