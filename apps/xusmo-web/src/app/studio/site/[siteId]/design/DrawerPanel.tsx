"use client";

import { X } from "lucide-react";
import { C } from "@/lib/studio/colors";

interface DrawerPanelProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export default function DrawerPanel({ title, onClose, children, width = 500 }: DrawerPanelProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 300,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
        }}
      />
      {/* Panel */}
      <div
        style={{
          position: "relative",
          width,
          maxWidth: "90%",
          background: C.bg,
          borderLeft: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div
          style={{
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            borderBottom: `1px solid ${C.border}`,
            background: C.surface,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "none",
              background: "transparent",
              color: C.muted,
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
