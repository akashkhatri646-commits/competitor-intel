"use client";

import { useState, useMemo, useEffect } from "react";
import {
  PageShell,
  PageHeader,
  InsightCard,
  FilterBar,
  FilterDropdown,
  AISynthesisLoader,
} from "@/components/ui";
import { insights, competitors, InsightCategory, InsightImpact, TeamRelevance, Insight, VerificationStatus } from "@/lib/data";
import { useSimulatedAI } from "@/lib/hooks";

// Helper to get review actions from localStorage
function getStoredReviewActions(): Record<string, { action: "verified" | "rejected"; at: string; by: string; comment?: string; reason?: string }> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem("review-actions");
  return stored ? JSON.parse(stored) : {};
}

// Helper to check if insight is "new" (within 7 days AND status is "new")
// Must match the logic in ui.tsx InsightCard
function isNewInsight(insight: Insight): boolean {
  if (insight.status !== "new") return false;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(insight.generatedAt) >= sevenDaysAgo;
}

export default function InsightsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"relevant" | "recent">("relevant");
  const [dateFilter, setDateFilter] = useState("");
  const [competitorFilter, setCompetitorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [impactFilter, setImpactFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");

  // Load review actions from localStorage
  const [reviewActions, setReviewActions] = useState<Record<string, { action: "verified" | "rejected" }>>({});
  useEffect(() => {
    setReviewActions(getStoredReviewActions());
  }, []);

  const { phase, progress, detectedCount, startSynthesis } = useSimulatedAI();

  // Compute effective verification status per insight (review action overrides original data)
  const getEffectiveStatus = (insight: Insight): VerificationStatus => {
    const action = reviewActions[insight.id];
    if (action) return action.action as VerificationStatus;
    return insight.verificationStatus;
  };

  const filteredInsights = useMemo(() => {
    return insights
      .filter((i) => {
        if (search && !i.title.toLowerCase().includes(search.toLowerCase()) &&
            !i.synthesis.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
        // Date filter
        if (dateFilter) {
          const insightDate = new Date(i.generatedAt);
          const now = new Date();
          const diffMs = now.getTime() - insightDate.getTime();
          const hoursAgo = Math.floor(diffMs / (1000 * 60 * 60));
          const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          if (dateFilter === "24h" && hoursAgo > 24) return false;
          if (dateFilter === "7d" && daysAgo > 7) return false;
          if (dateFilter === "14d" && daysAgo > 14) return false;
          if (dateFilter === "30d" && daysAgo > 30) return false;
          if (dateFilter === "60d" && daysAgo > 60) return false;
          if (dateFilter === "90d" && daysAgo > 90) return false;
        }
        // Competitor filter
        if (competitorFilter && !i.competitorIds.includes(competitorFilter)) {
          return false;
        }
        if (categoryFilter && i.category !== categoryFilter) {
          return false;
        }
        if (impactFilter && i.impact !== impactFilter) {
          return false;
        }
        // Status filter - use same logic as InsightCard display
        if (statusFilter) {
          const insightIsNew = isNewInsight(i);
          if (statusFilter === "new" && !insightIsNew) return false;
          if (statusFilter === "past" && insightIsNew) return false;
        }
        // Verification status filter - use effective status (review actions override original)
        if (verificationFilter) {
          const effectiveStatus = getEffectiveStatus(i);
          if (effectiveStatus !== verificationFilter) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "recent") {
          return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
        }
        // "relevant" - sort by impact then by date
        const impactOrder = { high: 3, medium: 2, low: 1 };
        const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
        if (impactDiff !== 0) return impactDiff;
        return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
      });
  }, [search, sortBy, dateFilter, competitorFilter, categoryFilter, impactFilter, statusFilter, verificationFilter, reviewActions]);

  const hasActiveFilters = search || dateFilter || competitorFilter || categoryFilter || impactFilter || statusFilter || verificationFilter;

  const clearAllFilters = () => {
    setSearch("");
    setDateFilter("");
    setCompetitorFilter("");
    setCategoryFilter("");
    setImpactFilter("");
    setStatusFilter("");
    setVerificationFilter("");
  };

  const stats = useMemo(() => {
    const newCount = insights.filter((i) => i.status === "new").length;
    return { newCount, total: insights.length };
  }, []);

  return (
    <PageShell>
      <PageHeader
        title={
          <>
            Insights
            <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
              </svg>
              AI-generated
            </span>
          </>
        }
        subtitle={`${stats.total} ${stats.total === 1 ? 'insight' : 'insights'} • ${stats.newCount} new`}
        action={
          <button
            onClick={startSynthesis}
            disabled={phase !== "idle"}
            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {phase === "idle" ? "Generate New Synthesis" : "Synthesizing..."}
          </button>
        }
      />

      <AISynthesisLoader
        phase={phase}
        progress={progress}
        detectedCount={detectedCount}
      />

      <FilterBar onSearch={setSearch} searchValue={search}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-subtle">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "relevant" | "recent")}
            className="px-3 py-1.5 rounded-lg bg-surface border border-[rgba(0,0,0,0.08)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="relevant">Most Relevant</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>
        <FilterDropdown
          label="All Dates"
          value={dateFilter}
          onChange={setDateFilter}
          options={[
            { value: "24h", label: "Last 24 hours" },
            { value: "7d", label: "Last 7 days" },
            { value: "14d", label: "Last 14 days" },
            { value: "30d", label: "Last 30 days" },
            { value: "60d", label: "Last 60 days" },
            { value: "90d", label: "Last 90 days" },
          ]}
        />
        <FilterDropdown
          label="All Competitors"
          value={competitorFilter}
          onChange={setCompetitorFilter}
          options={competitors.map((c) => ({ value: c.id, label: c.name }))}
        />
        <FilterDropdown
          label="All Categories"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { value: "product", label: "Product" },
            { value: "pricing", label: "Pricing" },
            { value: "positioning", label: "Positioning" },
            { value: "hiring", label: "Hiring" },
            { value: "funding", label: "Funding" },
            { value: "partnership", label: "Partnership" },
            { value: "technical", label: "Technical" },
          ]}
        />
        <FilterDropdown
          label="All Impact Levels"
          value={impactFilter}
          onChange={setImpactFilter}
          options={[
            { value: "high", label: "High Impact" },
            { value: "medium", label: "Medium Impact" },
            { value: "low", label: "Low Impact" },
          ]}
        />
        <FilterDropdown
          label="All Statuses"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "new", label: "New" },
            { value: "past", label: "Past" },
          ]}
        />
        <FilterDropdown
          label="All Verification"
          value={verificationFilter}
          onChange={setVerificationFilter}
          options={[
            { value: "verified", label: "Verified" },
            { value: "pending", label: "Pending Review" },
            { value: "unverified", label: "Unverified" },
            { value: "rejected", label: "Rejected" },
          ]}
        />
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-accent hover:text-accent/80 font-medium"
          >
            Clear filters
          </button>
        )}
      </FilterBar>

      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            effectiveVerificationStatus={getEffectiveStatus(insight)}
          />
        ))}
      </div>

      {filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted">No insights match your filters</p>
        </div>
      )}
    </PageShell>
  );
}
