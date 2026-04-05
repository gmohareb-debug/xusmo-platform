"use client";

// =============================================================================
// SectionReorder — Drag-and-drop section ordering for page content
// Uses HTML5 Drag API (no external libraries)
// =============================================================================

import { useState, useRef, useCallback } from "react";
import {
  GripVertical,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Check,
  AlertTriangle,
  Layout,
  Image,
  FileText,
  MessageSquare,
  Star,
  Phone,
  Users,
  MapPin,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { C } from "@/lib/studio/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Section {
  id: string;
  type: string;
  title: string;
  visible: boolean;
}

interface SectionReorderProps {
  siteId: string;
  pageSlug: string;
  sections: Section[];
}

// ---------------------------------------------------------------------------
// Section type to icon mapping
// ---------------------------------------------------------------------------

const SECTION_ICONS: Record<string, LucideIcon> = {
  hero: Layout,
  gallery: Image,
  services: FileText,
  testimonials: MessageSquare,
  reviews: Star,
  contact: Phone,
  team: Users,
  map: MapPin,
  faq: HelpCircle,
  about: Users,
  cta: Layout,
  features: Star,
  portfolio: Image,
  pricing: FileText,
};

function getSectionIcon(type: string): LucideIcon {
  return SECTION_ICONS[type.toLowerCase()] || Layout;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SectionReorder({
  siteId,
  pageSlug,
  sections: initialSections,
}: SectionReorderProps) {
  const [sections, setSections] = useState<Section[]>(
    initialSections.map((s) => ({ ...s }))
  );
  const [originalSections] = useState<Section[]>(
    initialSections.map((s) => ({ ...s }))
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragRef = useRef<number | null>(null);

  const hasChanges =
    JSON.stringify(sections) !== JSON.stringify(originalSections);

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      dragRef.current = index;
      setDragIndex(index);
      e.dataTransfer.effectAllowed = "move";
      // Use a transparent drag image for cleaner look
      const el = e.currentTarget;
      e.dataTransfer.setDragImage(el, 0, 0);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setOverIndex(index);
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    if (
      dragRef.current !== null &&
      overIndex !== null &&
      dragRef.current !== overIndex
    ) {
      setSections((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(dragRef.current!, 1);
        updated.splice(overIndex, 0, moved);
        return updated;
      });
    }
    setDragIndex(null);
    setOverIndex(null);
    dragRef.current = null;
    setSaved(false);
    setError(null);
  }, [overIndex]);

  const handleDragLeave = useCallback(() => {
    setOverIndex(null);
  }, []);

  // Toggle visibility
  const toggleVisibility = useCallback((index: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, visible: !s.visible } : s
      )
    );
    setSaved(false);
    setError(null);
  }, []);

  // Save order
  const saveOrder = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const payload = sections.map((s, i) => ({
        id: s.id,
        sortOrder: i,
        visible: s.visible,
      }));

      const res = await fetch(
        `/api/studio/${siteId}/content/${pageSlug}/sections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sections: payload }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save section order.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      }
    } catch {
      setError("Failed to save section order.");
    }

    setSaving(false);
  };

  if (sections.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "24px 0",
          color: C.dim,
          fontSize: 13,
        }}
      >
        No sections found for this page.
      </div>
    );
  }

  return (
    <div>
      {/* Section list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {sections.map((section, index) => {
          const Icon = getSectionIcon(section.type);
          const isDragging = dragIndex === index;
          const isOver = overIndex === index;

          return (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDragLeave={handleDragLeave}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: isDragging
                  ? `${C.accent}08`
                  : C.surfaceAlt,
                border: `1px solid ${
                  isOver
                    ? C.accent
                    : isDragging
                      ? `${C.accent}50`
                      : C.border
                }`,
                borderRadius: 8,
                opacity: isDragging ? 0.5 : 1,
                cursor: "grab",
                transition: "border-color 0.15s, opacity 0.15s",
                userSelect: "none",
              }}
            >
              {/* Drag handle */}
              <GripVertical size={16} color={C.dim} style={{ flexShrink: 0 }} />

              {/* Section type icon */}
              <Icon
                size={16}
                color={section.visible ? C.accent : C.dim}
                style={{ flexShrink: 0 }}
              />

              {/* Section title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: section.visible ? C.text : C.dim,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {section.title}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: C.dim,
                    textTransform: "capitalize",
                  }}
                >
                  {section.type}
                </div>
              </div>

              {/* Visibility toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(index);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px",
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  cursor: "pointer",
                  color: section.visible ? C.green : C.dim,
                  fontSize: 10,
                  fontWeight: 500,
                  flexShrink: 0,
                }}
                title={section.visible ? "Hide section" : "Show section"}
              >
                {section.visible ? (
                  <>
                    <Eye size={12} /> Visible
                  </>
                ) : (
                  <>
                    <EyeOff size={12} /> Hidden
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Insertion indicator hint */}
      {overIndex !== null && dragIndex !== null && overIndex !== dragIndex && (
        <div
          style={{
            fontSize: 11,
            color: C.accent,
            textAlign: "center",
            padding: "4px 0",
          }}
        >
          Drop to reorder
        </div>
      )}

      {/* Action row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 14,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={saveOrder}
          disabled={saving || !hasChanges}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 16px",
            background: hasChanges ? C.accent : C.surfaceAlt,
            border: "none",
            borderRadius: 6,
            color: hasChanges ? "#fff" : C.dim,
            fontSize: 12,
            fontWeight: 600,
            cursor: hasChanges ? "pointer" : "default",
          }}
        >
          {saving ? (
            <>
              <Loader2
                size={13}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Saving...
            </>
          ) : (
            <>
              <Save size={13} /> Save Order
            </>
          )}
        </button>

        {saved && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: C.green,
            }}
          >
            <Check size={14} /> Section order saved.
          </span>
        )}

        {error && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: C.red,
            }}
          >
            <AlertTriangle size={14} /> {error}
          </span>
        )}

        {!hasChanges && !saved && (
          <span style={{ fontSize: 11, color: C.dim }}>
            Drag sections to reorder, then save.
          </span>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
