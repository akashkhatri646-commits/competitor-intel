"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  PageShell,
  PageHeader,
  CategoryBadge,
  ImpactBadge,
  FreshnessIndicator,
  SourceTracePanel,
} from "@/components/ui";
import { insights, Insight, InsightCategory, competitors } from "@/lib/data";

type ReviewTab = "pending" | "verified" | "rejected";

interface ReviewAction {
  action: "verified" | "rejected";
  at: string;
  by: string;
  comment?: string;
  reason?: string;
}

type ReviewActions = Record<string, ReviewAction>;

// localStorage helpers
function getStoredReviewActions(): ReviewActions {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem("review-actions");
  return stored ? JSON.parse(stored) : {};
}

function saveReviewActions(actions: ReviewActions) {
  if (typeof window === "undefined") return;
  localStorage.setItem("review-actions", JSON.stringify(actions));
}

// Helper to check if insight is "new" (within 7 days AND status is "new")
function isNewInsight(insight: Insight): boolean {
  if (insight.status !== "new") return false;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(insight.generatedAt) >= sevenDaysAgo;
}

// Helper to format relative time
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const rejectionReasons = [
  { id: "inaccurate", label: "Inaccurate information" },
  { id: "duplicate", label: "Duplicate insight" },
  { id: "low-relevance", label: "Low relevance" },
  { id: "outdated", label: "Outdated" },
];

export default function ReviewQueuePage() {
  return (
    <Suspense fallback={null}>
      <ReviewQueueContent />
    </Suspense>
  );
}

function ReviewQueueContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as ReviewTab) || "pending";

  const [activeTab, setActiveTab] = useState<ReviewTab>(initialTab);
  const [categoryFilter, setCategoryFilter] = useState<InsightCategory | "all">("all");
  const [competitorFilter, setCompetitorFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"impact" | "recent">("impact");

  // Modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [verifyComment, setVerifyComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // Track verified/rejected actions - persisted to localStorage
  const [reviewActions, setReviewActions] = useState<ReviewActions>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Track which cards have sources expanded
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());

  // Load actions from localStorage on mount
  useEffect(() => {
    const stored = getStoredReviewActions();
    setReviewActions(stored);
    setIsLoaded(true);
  }, []);

  // Update tab from URL when searchParams change
  useEffect(() => {
    const tabParam = searchParams.get("tab") as ReviewTab;
    if (tabParam && ["pending", "verified", "rejected"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Save actions to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      saveReviewActions(reviewActions);
    }
  }, [reviewActions, isLoaded]);

  const toggleSources = (insightId: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(insightId)) {
        next.delete(insightId);
      } else {
        next.add(insightId);
      }
      return next;
    });
  };

  // Get insights for current tab
  const filteredInsights = useMemo(() => {
    let filtered = insights.filter((insight) => {
      // Check review actions first
      const action = reviewActions[insight.id];
      if (action) {
        if (activeTab === "verified" && action.action === "verified") return true;
        if (activeTab === "rejected" && action.action === "rejected") return true;
        if (activeTab === "pending" && (action.action === "verified" || action.action === "rejected")) return false;
      }

      // Then check original status
      if (activeTab === "pending") {
        return insight.verificationStatus === "pending" || insight.verificationStatus === "unverified";
      } else if (activeTab === "verified") {
        return insight.verificationStatus === "verified" && !reviewActions[insight.id];
      } else {
        return insight.verificationStatus === "rejected" && !reviewActions[insight.id];
      }
    });

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((i) => i.category === categoryFilter);
    }

    // Apply competitor filter
    if (competitorFilter !== "all") {
      filtered = filtered.filter((i) => i.competitorIds.includes(competitorFilter));
    }

    // Sort
    if (sortBy === "impact") {
      const impactOrder = { high: 0, medium: 1, low: 2 };
      filtered.sort((a, b) => {
        const impactDiff = impactOrder[a.impact] - impactOrder[b.impact];
        if (impactDiff !== 0) return impactDiff;
        // For same impact, sort by most recent first
        return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
      });
    } else {
      // "Most Recent" - sort by action date for verified/rejected, or generated date for pending
      if (activeTab === "pending") {
        filtered.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
      } else {
        filtered.sort((a, b) => {
          const actionA = reviewActions[a.id];
          const actionB = reviewActions[b.id];
          const dateA = actionA?.at ? new Date(actionA.at).getTime() : 0;
          const dateB = actionB?.at ? new Date(actionB.at).getTime() : 0;
          return dateB - dateA;
        });
      }
    }

    return filtered;
  }, [activeTab, categoryFilter, competitorFilter, sortBy, reviewActions]);

  // Get counts
  const counts = useMemo(() => {
    const pending = insights.filter((i) => {
      const action = reviewActions[i.id];
      if (action) return false;
      return i.verificationStatus === "pending" || i.verificationStatus === "unverified";
    }).length;

    const verified = insights.filter((i) => {
      const action = reviewActions[i.id];
      if (action?.action === "verified") return true;
      return i.verificationStatus === "verified" && !action;
    }).length;

    const rejected = insights.filter((i) => {
      const action = reviewActions[i.id];
      if (action?.action === "rejected") return true;
      return i.verificationStatus === "rejected" && !action;
    }).length;

    return { pending, verified, rejected };
  }, [reviewActions]);

  const handleVerify = (insight: Insight) => {
    setSelectedInsight(insight);
    setVerifyComment("");
    setShowVerifyModal(true);
  };

  const handleReject = (insight: Insight) => {
    setSelectedInsight(insight);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const confirmVerify = () => {
    if (selectedInsight) {
      setReviewActions((prev) => ({
        ...prev,
        [selectedInsight.id]: {
          action: "verified",
          at: new Date().toISOString(),
          by: "You",
          comment: verifyComment || undefined,
        },
      }));
    }
    setShowVerifyModal(false);
    setSelectedInsight(null);
  };

  const confirmReject = () => {
    if (selectedInsight && rejectReason) {
      setReviewActions((prev) => ({
        ...prev,
        [selectedInsight.id]: {
          action: "rejected",
          at: new Date().toISOString(),
          by: "You",
          reason: rejectReason,
        },
      }));
    }
    setShowRejectModal(false);
    setSelectedInsight(null);
  };

  const categories: InsightCategory[] = ["product", "pricing", "positioning", "hiring", "funding", "partnership", "technical"];

  // Build link with tab state for back navigation
  const getInsightLink = (insightId: string) => {
    return `/insights/${insightId}?from=review&tab=${activeTab}`;
  };

  return (
    <PageShell>
      <PageHeader
        title="Review Queue"
        subtitle="Validate AI-generated insights before publishing"
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "pending"
              ? "bg-amber-100 text-amber-700"
              : "bg-surface hover:bg-surface-hover text-muted"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pending Review
          <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${activeTab === "pending" ? "bg-amber-200 text-amber-800" : "bg-surface-hover text-subtle"}`}>
            {counts.pending}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("verified")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "verified"
              ? "bg-green-100 text-green-700"
              : "bg-surface hover:bg-surface-hover text-muted"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Verified
          <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${activeTab === "verified" ? "bg-green-200 text-green-800" : "bg-surface-hover text-subtle"}`}>
            {counts.verified}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "rejected"
              ? "bg-red-100 text-red-700"
              : "bg-surface hover:bg-surface-hover text-muted"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Rejected
          <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${activeTab === "rejected" ? "bg-red-200 text-red-800" : "bg-surface-hover text-subtle"}`}>
            {counts.rejected}
          </span>
        </button>
      </div>

      {/* Filters - available for all tabs */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-subtle">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "impact" | "recent")}
            className="px-3 py-1.5 rounded-lg bg-surface border border-[rgba(0,0,0,0.08)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="impact">Impact: High → Low</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as InsightCategory | "all")}
          className="px-3 py-1.5 rounded-lg bg-surface border border-[rgba(0,0,0,0.08)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={competitorFilter}
          onChange={(e) => setCompetitorFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-surface border border-[rgba(0,0,0,0.08)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <option value="all">All Competitors</option>
          {competitors.map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {!isLoaded ? (
        <div className="text-center py-12">
          <p className="text-muted">Loading...</p>
        </div>
      ) : filteredInsights.length > 0 ? (
        <div className="space-y-4">
          {filteredInsights.map((insight) => {
            const action = reviewActions[insight.id];
            const isSourcesExpanded = expandedSources.has(insight.id);
            const isNew = isNewInsight(insight);

            // Compute verifier/rejector info from either reviewActions or original data
            const verifierInfo = action?.action === "verified"
              ? { by: action.by, at: action.at }
              : insight.verification
                ? { by: insight.verification.verifiedBy, at: insight.verification.verifiedAt }
                : null;

            const rejectorInfo = action?.action === "rejected"
              ? { by: action.by, at: action.at }
              : insight.rejectedBy && insight.rejectedAt
                ? { by: insight.rejectedBy, at: insight.rejectedAt }
                : null;

            // Compute comment/reason from either reviewActions or original data
            const verifierComment = action?.action === "verified"
              ? action.comment
              : insight.verification?.verifierComment;

            const rejectionReason = action?.action === "rejected"
              ? action.reason
              : insight.rejectionReason;

            return (
              <div key={insight.id} className="card p-4">
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* New badge */}
                    {isNew && (
                      <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
                        New
                      </span>
                    )}
                    {/* Verified status with who and when */}
                    {activeTab === "verified" && verifierInfo && (
                      <span className="text-xs text-green-600">
                        <span className="font-medium">✓ Verified by {verifierInfo.by}</span>
                        <span className="text-green-500 ml-1">{getTimeAgo(verifierInfo.at)}</span>
                      </span>
                    )}
                    {/* Rejected status with who and when */}
                    {activeTab === "rejected" && rejectorInfo && (
                      <span className="text-xs text-red-600">
                        <span className="font-medium">✗ Rejected by {rejectorInfo.by}</span>
                        <span className="text-red-500 ml-1">{getTimeAgo(rejectorInfo.at)}</span>
                      </span>
                    )}
                  </div>
                  <CategoryBadge category={insight.category} />
                </div>

                {/* Clickable title */}
                <Link href={getInsightLink(insight.id)}>
                  <h3 className="text-sm font-semibold text-foreground mb-2 hover:text-accent transition-colors">
                    {insight.title}
                  </h3>
                </Link>

                {/* Synthesis */}
                <p className="text-xs text-muted leading-relaxed mb-3 line-clamp-3">{insight.synthesis}</p>

                {/* Bottom row: Impact + Confidence + View Sources | Timestamp */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-3">
                    <ImpactBadge impact={insight.impact} />
                    <span className="text-muted">
                      <span className="text-subtle">Confidence:</span> {insight.confidence}%
                    </span>
                    <button
                      onClick={() => toggleSources(insight.id)}
                      className="text-accent hover:text-accent/80 font-medium"
                    >
                      {isSourcesExpanded ? "Hide" : "View"} Sources ({insight.sourceIds.length})
                    </button>
                  </div>
                  <FreshnessIndicator dateString={insight.generatedAt} />
                </div>

                {/* Source Trace Panel */}
                {isSourcesExpanded && (
                  <SourceTracePanel sourceIds={insight.sourceIds} />
                )}

                {/* Actions - only for pending tab and no existing action */}
                {activeTab === "pending" && !action && (
                  <div className="flex items-center gap-3 pt-3 mt-3 border-t border-[rgba(0,0,0,0.06)]">
                    <button
                      onClick={() => handleVerify(insight)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Verify
                    </button>
                    <button
                      onClick={() => handleReject(insight)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </div>
                )}

                {/* Show rejection reason if in rejected tab */}
                {activeTab === "rejected" && rejectionReason && (
                  <div className="pt-3 mt-3 border-t border-[rgba(0,0,0,0.06)]">
                    <span className="text-xs text-red-600">
                      <span className="font-medium">Rejection Reason:</span> {rejectionReasons.find(r => r.id === rejectionReason)?.label || rejectionReason}
                    </span>
                  </div>
                )}

                {/* Show verification comment if in verified tab */}
                {activeTab === "verified" && verifierComment && (
                  <div className="pt-3 mt-3 border-t border-[rgba(0,0,0,0.06)]">
                    <span className="text-xs text-green-600">
                      <span className="font-medium">Verifier comments:</span> <span className="italic">"{verifierComment}"</span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          {activeTab === "pending" ? (
            <>
              <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-muted mb-2">All caught up!</p>
              <p className="text-xs text-subtle">No insights pending review.</p>
            </>
          ) : activeTab === "verified" ? (
            <>
              <svg className="w-12 h-12 text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-muted mb-2">No verified insights</p>
              <p className="text-xs text-subtle">Verified insights will appear here.</p>
            </>
          ) : (
            <>
              <svg className="w-12 h-12 text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-muted mb-2">No rejected insights</p>
              <p className="text-xs text-subtle">Rejected insights will appear here.</p>
            </>
          )}
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && selectedInsight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Verify Insight</h3>
            <p className="text-sm text-muted mb-4 line-clamp-2">{selectedInsight.title}</p>

            <label className="block text-sm font-medium text-foreground mb-2">
              Add comment (optional)
            </label>
            <textarea
              value={verifyComment}
              onChange={(e) => setVerifyComment(e.target.value)}
              placeholder="e.g., Confirmed via official press release..."
              className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.08)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
              rows={3}
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-hover text-muted text-sm font-medium hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmVerify}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Confirm Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedInsight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Reject Insight</h3>
            <p className="text-sm text-muted mb-4 line-clamp-2">{selectedInsight.title}</p>

            <label className="block text-sm font-medium text-foreground mb-2">
              Rejection reason
            </label>
            <div className="space-y-2">
              {rejectionReasons.map((reason) => (
                <label key={reason.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-hover cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason.id}
                    checked={rejectReason === reason.id}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-4 h-4 text-accent"
                  />
                  <span className="text-sm text-foreground">{reason.label}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-hover text-muted text-sm font-medium hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
