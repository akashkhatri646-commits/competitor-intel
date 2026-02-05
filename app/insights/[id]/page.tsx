"use client";

import { use, useState, useEffect, Suspense } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  PageShell,
  CategoryBadge,
  ImpactBadge,
  TeamTag,
  FreshnessIndicator,
  SourceTracePanel,
  DashboardInsightCard,
  VerificationStatusBadge,
} from "@/components/ui";
import { insights, getCompetitor, getRelatedInsights, InsightComment, VerificationStatus } from "@/lib/data";

// ===== Interaction Types =====
export interface InsightInteraction {
  feedback: "up" | "down" | null;
  bookmarked: boolean;
  flagged: boolean;
  updatedAt: string;
}

export type InsightInteractions = Record<string, InsightInteraction>;

// ===== Interaction localStorage Helpers (exported for reuse) =====
export function getAllInteractions(): InsightInteractions {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem("insight-interactions");
  return stored ? JSON.parse(stored) : {};
}

export function getInteraction(insightId: string): InsightInteraction | null {
  const all = getAllInteractions();
  return all[insightId] || null;
}

export function saveInteraction(insightId: string, interaction: Partial<InsightInteraction>) {
  if (typeof window === "undefined") return;
  const all = getAllInteractions();
  const existing = all[insightId] || { feedback: null, bookmarked: false, flagged: false, updatedAt: "" };
  all[insightId] = {
    ...existing,
    ...interaction,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem("insight-interactions", JSON.stringify(all));
}

// Helper to get comments from localStorage
function getStoredComments(insightId: string): InsightComment[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`insight-comments-${insightId}`);
  return stored ? JSON.parse(stored) : [];
}

// Helper to save comments to localStorage
function saveComments(insightId: string, comments: InsightComment[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`insight-comments-${insightId}`, JSON.stringify(comments));
}

// Rejection reasons lookup (same as review page)
const rejectionReasons = [
  { id: "inaccurate", label: "Inaccurate information" },
  { id: "duplicate", label: "Duplicate insight" },
  { id: "low-relevance", label: "Low relevance" },
  { id: "outdated", label: "Outdated" },
];

// Helper to get review actions from localStorage
function getStoredReviewActions(): Record<string, { action: "verified" | "rejected"; at: string; by: string; comment?: string; reason?: string }> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem("review-actions");
  return stored ? JSON.parse(stored) : {};
}

export default function InsightDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <InsightDetailContent params={params} />
    </Suspense>
  );
}

function InsightDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const insight = insights.find((i) => i.id === id);

  // Read navigation context from query params
  const fromPage = searchParams.get("from");
  const fromTab = searchParams.get("tab");

  // Local state for interactive features
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<InsightComment[]>([]);
  const [interactionsLoaded, setInteractionsLoaded] = useState(false);

  // Review action state (from localStorage)
  const [reviewAction, setReviewAction] = useState<{ action: "verified" | "rejected"; at: string; by: string; comment?: string; reason?: string } | null>(null);

  // Load interactions and comments from localStorage on mount
  useEffect(() => {
    if (insight) {
      // Load interactions (feedback, bookmark, flag)
      const storedInteraction = getInteraction(insight.id);
      if (storedInteraction) {
        setFeedback(storedInteraction.feedback);
        setIsBookmarked(storedInteraction.bookmarked);
        setIsFlagged(storedInteraction.flagged);
      }
      setInteractionsLoaded(true);

      // Load review action
      const allReviewActions = getStoredReviewActions();
      const action = allReviewActions[insight.id];
      if (action) {
        setReviewAction(action);
      }

      // Load comments
      const storedComments = getStoredComments(insight.id);
      // Merge stored comments with default comments, avoiding duplicates
      const defaultComments = insight.comments || [];
      const allComments = [...defaultComments];
      storedComments.forEach((sc) => {
        if (!allComments.some((c) => c.id === sc.id)) {
          allComments.push(sc);
        }
      });
      setComments(allComments);
    }
  }, [insight]);

  // Save interactions to localStorage when they change
  useEffect(() => {
    if (insight && interactionsLoaded) {
      saveInteraction(insight.id, {
        feedback,
        bookmarked: isBookmarked,
        flagged: isFlagged,
      });
    }
  }, [feedback, isBookmarked, isFlagged, insight, interactionsLoaded]);

  if (!insight) {
    notFound();
  }

  // Get related competitors
  const relatedCompetitors = insight.competitorIds
    .map((cId) => getCompetitor(cId))
    .filter(Boolean);

  // Get related insights (max 3)
  const relatedInsights = getRelatedInsights(insight.id);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: InsightComment = {
      id: `cmt-new-${Date.now()}`,
      author: "You",
      authorRole: "Team Member",
      authorAvatar: "YO",
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    // Save new comments to localStorage (only user-added ones)
    const userComments = updatedComments.filter((c) => c.id.startsWith("cmt-new-"));
    saveComments(insight.id, userComments);
    setNewComment("");
  };

  const handleShare = (method: string) => {
    const url = window.location.href;
    const title = insight.title;
    const body = `Check out this insight: ${url}`;

    switch (method) {
      case "outlook":
        // Open Outlook web compose
        window.open(`https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`);
        break;
      case "slack":
        // Open Slack deep link with message
        window.open(`slack://channel?team=&id=&message=${encodeURIComponent(`${title}\n${url}`)}`);
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <PageShell>
      {/* Back link */}
      <button
        onClick={() => {
          if (fromPage === "review" && fromTab) {
            router.push(`/review?tab=${fromTab}`);
          } else if (fromPage === "bookmarks") {
            router.push("/bookmarks");
          } else {
            router.back();
          }
        }}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {fromPage === "review" ? "Back to Review Queue" : "Back"}
      </button>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {insight.status === "new" && (
                <span className="text-[10px] font-semibold text-accent uppercase tracking-wider px-2 py-0.5 bg-accent/10 rounded">
                  New
                </span>
              )}
              <VerificationStatusBadge status={reviewAction ? reviewAction.action as VerificationStatus : insight.verificationStatus} size="md" />
              <ImpactBadge impact={insight.impact} />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              {insight.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span>
                <span className="text-subtle">Confidence:</span> {insight.confidence}%
              </span>
              <span>
                <span className="text-subtle">Generated:</span>{" "}
                <FreshnessIndicator dateString={insight.generatedAt} />
              </span>
            </div>
          </div>
          <CategoryBadge category={insight.category} />
        </div>

        {/* Verification Status Section — review action overrides original status */}
        {reviewAction?.action === "verified" ? (
          <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs text-green-800">
                <span className="font-medium">Verified by {reviewAction.by}</span>
                <span className="text-green-600"> <FreshnessIndicator dateString={reviewAction.at} /></span>
              </span>
            </div>
            {reviewAction.comment && (
              <p className="text-xs text-green-700 mt-2 ml-6">
                <span className="font-medium">Verifier comments:</span> <span className="italic">"{reviewAction.comment}"</span>
              </p>
            )}
          </div>
        ) : reviewAction?.action === "rejected" ? (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-xs text-red-800">
                <span className="font-medium">Rejected by {reviewAction.by}</span>
                <span className="text-red-600"> <FreshnessIndicator dateString={reviewAction.at} /></span>
              </span>
            </div>
            {reviewAction.reason && (
              <p className="text-xs text-red-700 mt-2 ml-6">
                <span className="font-medium">Rejection Reason:</span> {rejectionReasons.find(r => r.id === reviewAction.reason)?.label || reviewAction.reason}
              </p>
            )}
          </div>
        ) : insight.verificationStatus === "verified" && insight.verification ? (
          <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs text-green-800">
                <span className="font-medium">Verified by {insight.verification.verifiedBy}</span>
                <span className="text-green-600"> ({insight.verification.verifierRole})</span>
                <span className="text-green-600"> <FreshnessIndicator dateString={insight.verification.verifiedAt} /></span>
              </span>
            </div>
            {insight.verification.verifierComment && (
              <p className="text-xs text-green-700 mt-2 ml-6">
                <span className="font-medium">Verifier comments:</span> <span className="italic">"{insight.verification.verifierComment}"</span>
              </p>
            )}
          </div>
        ) : insight.verificationStatus === "pending" ? (
          <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-amber-800">
                <span className="font-medium">Awaiting review</span>
                <span className="text-amber-600"> — This insight is pending validation by a market researcher</span>
              </span>
            </div>
          </div>
        ) : insight.verificationStatus === "unverified" ? (
          <div className="mb-4 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="9" />
              </svg>
              <span className="text-xs text-gray-700">
                <span className="font-medium">Unverified</span>
                <span className="text-gray-500"> — This insight has not been reviewed by a market researcher</span>
              </span>
            </div>
          </div>
        ) : null}

        {/* Team Relevance */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-subtle">Relevant for:</span>
          {insight.teamRelevance.map((team) => (
            <TeamTag key={team} team={team} />
          ))}
        </div>

        {/* Related Competitors */}
        {relatedCompetitors.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-subtle">Related competitors:</span>
            {relatedCompetitors.map((comp) => (
              <Link
                key={comp!.id}
                href={`/competitors/${comp!.slug}`}
                className="text-xs text-accent hover:text-accent/80 font-medium"
              >
                {comp!.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Synthesis */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          Analysis
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
            </svg>
            AI-generated
          </span>
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          {insight.synthesis}
        </p>
      </div>

      {/* Recommendations */}
      {insight.recommendations.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            Recommendations
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
              </svg>
              AI-generated
            </span>
          </h2>
          <ul className="space-y-2">
            {insight.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-muted flex gap-3">
                <span className="text-accent font-bold">{i + 1}.</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Sources ({insight.sourceIds.length})
        </h2>
        <SourceTracePanel sourceIds={insight.sourceIds} />
      </div>

      {/* Action Bar: Feedback, Bookmark, Share, Flag */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Feedback */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-subtle mr-1">Was this helpful?</span>
              <button
                onClick={() => setFeedback(feedback === "up" ? null : "up")}
                className={`p-2 rounded-lg transition-colors ${
                  feedback === "up"
                    ? "bg-green-100 text-green-600"
                    : "hover:bg-surface-hover text-muted hover:text-foreground"
                }`}
                title="Helpful"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>
              <button
                onClick={() => setFeedback(feedback === "down" ? null : "down")}
                className={`p-2 rounded-lg transition-colors ${
                  feedback === "down"
                    ? "bg-red-100 text-red-600"
                    : "hover:bg-surface-hover text-muted hover:text-foreground"
                }`}
                title="Not helpful"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-border" />

            {/* Bookmark */}
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isBookmarked
                  ? "bg-amber-100 text-amber-600"
                  : "hover:bg-surface-hover text-muted hover:text-foreground"
              }`}
              title={isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <svg className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-xs font-medium">{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
            </button>

            {/* Share */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors flex items-center gap-1.5"
                title="Share"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="text-xs font-medium">Share</span>
              </button>
              {showShareMenu && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-border rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleShare("outlook")}
                    className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-surface-hover flex items-center gap-2 rounded-t-lg"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.154-.352.23-.58.23h-8.547v-6.959l1.6 1.229c.101.063.222.094.363.094.142 0 .262-.031.363-.094l6.8-5.195c.056-.032.12-.063.187-.094a.511.511 0 01.052.235zm-.238-1.36c.119.112.193.24.222.384l-7.166 5.478-1.6-1.23V4.618h8.067c.218 0 .406.07.563.212.156.14.234.318.234.53v.167l-.32.5zM14.618 4.618v14.764H1.035c-.287 0-.534-.1-.74-.298a1 1 0 01-.295-.73V4.618c0-.287.098-.534.294-.74.196-.208.45-.312.76-.312h12.53c.287 0 .532.104.737.312.205.206.308.453.297.74zm-3.826 5.47c0-.65-.173-1.197-.52-1.64a3.014 3.014 0 00-1.326-.998 4.47 4.47 0 00-1.743-.345c-.648 0-1.253.115-1.813.345a3.173 3.173 0 00-1.358.998c-.36.443-.54.99-.54 1.64 0 .67.18 1.223.54 1.66.36.436.813.77 1.358 1.003.545.233 1.148.35 1.81.35.663 0 1.268-.117 1.816-.35.548-.233.999-.567 1.353-1.003.355-.437.532-.99.532-1.66zm-1.74 0c0 .432-.138.798-.415 1.098-.276.3-.663.45-1.16.45-.498 0-.888-.15-1.17-.45a1.509 1.509 0 01-.423-1.098c0-.443.14-.81.423-1.102.282-.293.672-.44 1.17-.44.497 0 .884.147 1.16.44.277.291.415.659.415 1.102z"/>
                    </svg>
                    Outlook
                  </button>
                  <button
                    onClick={() => handleShare("slack")}
                    className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-surface-hover flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                    </svg>
                    Slack
                  </button>
                  <button
                    onClick={() => handleShare("copy")}
                    className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-surface-hover flex items-center gap-2 rounded-b-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy link
                  </button>
                </div>
              )}
            </div>

            {/* Flag for Review */}
            <button
              onClick={() => setIsFlagged(!isFlagged)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isFlagged
                  ? "bg-orange-100 text-orange-600"
                  : "hover:bg-surface-hover text-muted hover:text-foreground"
              }`}
              title={isFlagged ? "Remove flag" : "Flag for review"}
            >
              <svg className="w-5 h-5" fill={isFlagged ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              <span className="text-xs font-medium">{isFlagged ? "Flagged" : "Flag"}</span>
            </button>
          </div>

          {/* Feedback acknowledgment */}
          {feedback && (
            <span className="text-xs text-green-600 font-medium">
              Thanks for your feedback!
            </span>
          )}
        </div>
      </div>

      {/* Related Insights */}
      {relatedInsights.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Related Insights</h2>
          <div className="grid md:grid-cols-3 gap-4 items-stretch">
            {relatedInsights.map((relatedInsight) => (
              <DashboardInsightCard key={relatedInsight.id} insight={relatedInsight} />
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          Comments
          {comments.length > 0 && (
            <span className="text-xs font-normal text-muted">({comments.length})</span>
          )}
        </h2>

        {/* Comment List */}
        {comments.length > 0 && (
          <div className="space-y-4 mb-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {comment.authorAvatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{comment.author}</span>
                    <span className="text-xs text-subtle">{comment.authorRole}</span>
                    <span className="text-xs text-muted">
                      <FreshnessIndicator dateString={comment.createdAt} />
                    </span>
                  </div>
                  <p className="text-sm text-muted">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">
            YO
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
              rows={2}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-1.5 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
