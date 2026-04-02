"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronDown, Star, Users, Eye } from "lucide-react";
import Badge from "@/components/ui/Badge";
import AnimatedSection from "@/components/ui/AnimatedSection";
import ThemePreviewModal, {
  type ThemePreviewData,
} from "@/components/marketplace/ThemePreviewModal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ThemeEntry {
  id: string;
  name: string;
  slug: string;
  archetype: string;
  industryTags: string[] | null;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  usageCount: number;
  rating: number;
  createdAt: string;
}

type ArchetypeFilter = "ALL" | "SERVICE" | "VENUE" | "PORTFOLIO" | "COMMERCE";
type SortOption = "popular" | "newest" | "rating";

interface MarketplaceClientProps {
  initialThemes: ThemeEntry[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ARCHETYPE_TABS: { label: string; value: ArchetypeFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Service", value: "SERVICE" },
  { label: "Venue", value: "VENUE" },
  { label: "Portfolio", value: "PORTFOLIO" },
  { label: "Commerce", value: "COMMERCE" },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Most Popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Highest Rated", value: "rating" },
];

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderStars(rating: number) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      );
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <Star key={i} className="w-3.5 h-3.5 fill-amber-200 text-amber-400" />
      );
    } else {
      stars.push(
        <Star key={i} className="w-3.5 h-3.5 text-neutral-300" />
      );
    }
  }
  return stars;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MarketplaceClient({
  initialThemes,
}: MarketplaceClientProps) {
  const [search, setSearch] = useState("");
  const [archetype, setArchetype] = useState<ArchetypeFilter>("ALL");
  const [sort, setSort] = useState<SortOption>("popular");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [previewTheme, setPreviewTheme] = useState<ThemePreviewData | null>(
    null
  );

  // Filter & sort
  const filteredThemes = useMemo(() => {
    let themes = [...initialThemes];

    // Search filter
    if (search.trim()) {
      const s = search.toLowerCase();
      themes = themes.filter(
        (t) =>
          t.name.toLowerCase().includes(s) ||
          (t.industryTags ?? []).some((tag) => tag.toLowerCase().includes(s))
      );
    }

    // Archetype filter
    if (archetype !== "ALL") {
      themes = themes.filter((t) => t.archetype === archetype);
    }

    // Sort
    switch (sort) {
      case "popular":
        themes.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case "newest":
        themes.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "rating":
        themes.sort((a, b) => b.rating - a.rating);
        break;
    }

    return themes;
  }, [initialThemes, search, archetype, sort]);

  const visibleThemes = filteredThemes.slice(0, visibleCount);
  const hasMore = visibleCount < filteredThemes.length;

  const handlePreview = useCallback((theme: ThemeEntry) => {
    setPreviewTheme({
      id: theme.id,
      name: theme.name,
      slug: theme.slug,
      archetype: theme.archetype,
      industryTags: theme.industryTags ?? [],
      colors: theme.colors,
      fonts: theme.fonts,
      usageCount: theme.usageCount,
      rating: theme.rating,
    });
  }, []);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <>
      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        {/* Search bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search themes by name or industry..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-surface-border bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow shadow-sm"
          />
        </div>

        {/* Filter tabs + sort */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Archetype tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-100">
            {ARCHETYPE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setArchetype(tab.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  archetype === tab.value
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 bg-white border border-surface-border hover:border-primary-300 transition-colors"
            >
              {currentSortLabel}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white border border-surface-border shadow-lg z-10 py-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSort(opt.value);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      sort === opt.value
                        ? "bg-primary-50 text-primary-700 font-medium"
                        : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-neutral-500 mb-6">
        {filteredThemes.length} theme{filteredThemes.length !== 1 ? "s" : ""}{" "}
        found
      </p>

      {/* Theme grid */}
      {filteredThemes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-400 text-lg">
            No themes match your search.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setArchetype("ALL");
            }}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleThemes.map((theme, i) => (
            <AnimatedSection key={theme.id} delay={i * 50} direction="scale">
              <ThemeCard
                theme={theme}
                onPreview={() => handlePreview(theme)}
              />
            </AnimatedSection>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="mt-10 text-center">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-8 py-3 rounded-xl border-2 border-primary-300 text-primary-700 font-semibold text-sm hover:bg-primary-50 hover:border-primary-400 transition-all"
          >
            Load More Themes
          </button>
        </div>
      )}

      {/* Preview modal */}
      {previewTheme && (
        <ThemePreviewModal
          theme={previewTheme}
          onClose={() => setPreviewTheme(null)}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Theme Card sub-component
// ---------------------------------------------------------------------------

function ThemeCard({
  theme,
  onPreview,
}: {
  theme: ThemeEntry;
  onPreview: () => void;
}) {
  const c = theme.colors;
  const f = theme.fonts;

  // Extract 5 main colors for the swatch strip
  const swatchColors = [
    c.primary,
    c.secondary,
    c.accent,
    c.bg,
    c.text,
  ].filter(Boolean) as string[];

  const headingFont = f.heading ?? "Inter";
  const bodyFont = f.body ?? "Inter";
  const primaryColor = c.primary ?? "#6366f1";
  const bgColor = c.bg ?? "#ffffff";
  const textColor = c.text ?? "#111827";
  const mutedColor = c.textMuted ?? "#6b7280";

  return (
    <div className="group rounded-2xl bg-white border border-surface-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Mini site preview */}
      <div
        className="relative h-44 overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        {/* Mini nav */}
        <div
          className="flex items-center justify-between px-3 py-1.5 border-b text-[8px]"
          style={{ borderColor: c.border ?? "#e5e7eb" }}
        >
          <span
            className="font-bold"
            style={{ fontFamily: headingFont, color: primaryColor, fontSize: "9px" }}
          >
            Business Name
          </span>
          <div className="flex gap-2" style={{ color: mutedColor }}>
            <span>Home</span>
            <span>Services</span>
            <span>Contact</span>
          </div>
        </div>

        {/* Mini hero */}
        <div className="px-3 py-4 text-center">
          <p
            className="font-bold text-xs mb-1"
            style={{ fontFamily: headingFont, color: textColor }}
          >
            Professional Services
          </p>
          <p
            className="text-[7px] mb-2"
            style={{ color: mutedColor }}
          >
            Trusted by hundreds of customers
          </p>
          <span
            className="inline-block px-2 py-0.5 rounded text-[7px] text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Get Started
          </span>
        </div>

        {/* Mini cards row */}
        <div className="flex gap-1 px-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex-1 rounded p-1.5"
              style={{
                backgroundColor: c.surface ?? "#f9fafb",
                border: `1px solid ${c.border ?? "#e5e7eb"}`,
              }}
            >
              <div
                className="w-3 h-3 rounded mx-auto mb-1"
                style={{ backgroundColor: `${primaryColor}20` }}
              />
              <div
                className="w-full h-1 rounded-full mx-auto"
                style={{ backgroundColor: `${textColor}15` }}
              />
            </div>
          ))}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={onPreview}
            className="px-4 py-2 rounded-lg bg-white text-neutral-900 text-xs font-semibold shadow-lg hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        {/* Color swatch strip */}
        <div className="flex items-center gap-1">
          {swatchColors.map((color, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border border-neutral-200"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Font pair */}
        <p className="text-xs text-neutral-400">
          {headingFont} + {bodyFont}
        </p>

        {/* Theme name + badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-neutral-900 leading-tight">
            {theme.name}
          </h3>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {theme.archetype}
          </Badge>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-neutral-500">
            <Users className="w-3.5 h-3.5" />
            Used by {theme.usageCount} site{theme.usageCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-0.5">
            {renderStars(theme.rating)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onPreview}
            className="flex-1 px-3 py-2 rounded-lg border border-surface-border text-xs font-semibold text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
          >
            Preview
          </button>
          <Link
            href={`/interview?theme=${theme.id}`}
            className="flex-1 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs font-semibold text-center hover:bg-primary-500 transition-colors"
          >
            Use This Theme
          </Link>
        </div>
      </div>
    </div>
  );
}
