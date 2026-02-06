"use client";

import { use, useState, useEffect, useMemo, Suspense } from "react";
import { notFound, useSearchParams, useRouter } from "next/navigation";
import {
  PageShell,
  ThreatBadge,
  TabGroup,
  DetailedSignalCard,
  InsightCard,
  FreshnessIndicator,
  SignalsTrendChart,
  FilterDropdown,
} from "@/components/ui";
import {
  getCompetitor,
  getCompetitorSignals,
  getCompetitorInsights,
  InsightCategory,
  SignalStrength,
  Insight,
} from "@/lib/data";

// Helper to check if insight is "new" (within 7 days AND status is "new")
// Must match the logic in ui.tsx InsightCard
function isNewInsight(insight: Insight): boolean {
  if (insight.status !== "new") return false;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(insight.generatedAt) >= sevenDaysAgo;
}

export default function CompetitorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <CompetitorDetailContent params={params} />
    </Suspense>
  );
}

function CompetitorDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get("tab");
  const signalFromUrl = searchParams.get("signal");
  const competitor = getCompetitor(slug);

  const [activeTab, setActiveTab] = useState(tabFromUrl || "overview");
  const [highlightedSignal, setHighlightedSignal] = useState<string | null>(signalFromUrl);

  // Signal filters and sort
  const [signalSortBy, setSignalSortBy] = useState<"relevant" | "recent">("relevant");
  const [signalDateFilter, setSignalDateFilter] = useState("");
  const [signalCategoryFilter, setSignalCategoryFilter] = useState("");
  const [signalStrengthFilter, setSignalStrengthFilter] = useState("");

  // Insight filters and sort
  const [insightSortBy, setInsightSortBy] = useState<"relevant" | "recent">("relevant");
  const [insightDateFilter, setInsightDateFilter] = useState("");
  const [insightCategoryFilter, setInsightCategoryFilter] = useState("");
  const [insightImpactFilter, setInsightImpactFilter] = useState("");
  const [insightStatusFilter, setInsightStatusFilter] = useState("");

  useEffect(() => {
    if (tabFromUrl && ["overview", "signals", "insights"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Scroll to and highlight specific signal when coming from search
  useEffect(() => {
    if (signalFromUrl && activeTab === "signals") {
      // Small delay to ensure the DOM is ready
      setTimeout(() => {
        const signalElement = document.getElementById(`signal-${signalFromUrl}`);
        if (signalElement) {
          signalElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      // Clear highlight after 3 seconds
      const timer = setTimeout(() => {
        setHighlightedSignal(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [signalFromUrl, activeTab]);

  if (!competitor) {
    notFound();
  }

  const signals = getCompetitorSignals(competitor.id);
  const insights = getCompetitorInsights(competitor.id);

  // Filter signals based on selected filters
  const filteredSignals = useMemo(() => {
    return signals.filter((signal) => {
      // Date range filter
      if (signalDateFilter) {
        const signalDate = new Date(signal.detectedAt);
        const now = new Date();
        const diffMs = now.getTime() - signalDate.getTime();
        const hoursAgo = Math.floor(diffMs / (1000 * 60 * 60));
        const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (signalDateFilter === "24h" && hoursAgo > 24) return false;
        if (signalDateFilter === "7d" && daysAgo > 7) return false;
        if (signalDateFilter === "14d" && daysAgo > 14) return false;
        if (signalDateFilter === "30d" && daysAgo > 30) return false;
        if (signalDateFilter === "60d" && daysAgo > 60) return false;
        if (signalDateFilter === "90d" && daysAgo > 90) return false;
      }
      // Category filter
      if (signalCategoryFilter && signal.category !== signalCategoryFilter) return false;
      // Strength filter
      if (signalStrengthFilter && signal.strength !== signalStrengthFilter) return false;
      return true;
    });
  }, [signals, signalDateFilter, signalCategoryFilter, signalStrengthFilter]);

  // Filter insights based on selected filters
  const filteredInsights = useMemo(() => {
    return insights.filter((insight) => {
      // Date range filter
      if (insightDateFilter) {
        const insightDate = new Date(insight.generatedAt);
        const now = new Date();
        const diffMs = now.getTime() - insightDate.getTime();
        const hoursAgo = Math.floor(diffMs / (1000 * 60 * 60));
        const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (insightDateFilter === "24h" && hoursAgo > 24) return false;
        if (insightDateFilter === "7d" && daysAgo > 7) return false;
        if (insightDateFilter === "14d" && daysAgo > 14) return false;
        if (insightDateFilter === "30d" && daysAgo > 30) return false;
        if (insightDateFilter === "60d" && daysAgo > 60) return false;
        if (insightDateFilter === "90d" && daysAgo > 90) return false;
      }
      // Category filter
      if (insightCategoryFilter && insight.category !== insightCategoryFilter) return false;
      // Impact filter
      if (insightImpactFilter && insight.impact !== insightImpactFilter) return false;
      // Status filter - use same logic as InsightCard display
      if (insightStatusFilter) {
        const insightIsNew = isNewInsight(insight);
        if (insightStatusFilter === "new" && !insightIsNew) return false;
        if (insightStatusFilter === "past" && insightIsNew) return false;
      }
      return true;
    });
  }, [insights, insightDateFilter, insightCategoryFilter, insightImpactFilter, insightStatusFilter]);

  // Generate 30-day signals trend data based on actual signal dates
  const signalsTrend = useMemo(() => {
    const now = new Date();
    const trend = Array.from({ length: 30 }, () => 0);

    signals.forEach((signal) => {
      const signalDate = new Date(signal.detectedAt);
      const daysAgo = Math.floor((now.getTime() - signalDate.getTime()) / (1000 * 60 * 60 * 24));
      // Index 0 = 30 days ago, Index 29 = today
      const index = 29 - daysAgo;
      if (index >= 0 && index < 30) {
        trend[index]++;
      }
    });

    return trend;
  }, [signals]);

  const trendTotal = signalsTrend.reduce((a, b) => a + b, 0);

  // Competitor-specific AI summaries
  const aiSummaries: Record<string, string> = {
    nimbusscale: `NimbusScale is executing an aggressive enterprise expansion strategy, evidenced by their $400M Series E, strategic CRO hire from AWS, and Gartner Leaders positioning. Their managed GPU cluster launch at $2.50/hr directly threatens AcmeCloud's AI workload share. With ${signals.length} signals detected, including ${signals.filter(s => s.strength === 'strong').length} strong signals, this competitor requires immediate strategic attention. Priority areas: enterprise sales defense, GPU pricing response, and ML platform acceleration.`,
    cloudforge: `CloudForge's developer-first strategy is paying dividends with industry-leading NPS of 72 and 40K+ GitHub stars on their open-source projects. Their recent enterprise SSO/RBAC launch and ForgeML preview signal an upmarket push. The ${signals.length} detected signals suggest sustained momentum. Key concern: their open-source flywheel is creating ecosystem lock-in that's difficult to counter. Watch for enterprise conversion metrics in upcoming earnings.`,
    skyvault: `SkyVault has carved out a defensible niche in regulated industries with their $85M DoD contract and FedRAMP High certification. European expansion with GDPR focus shows geographic ambition. ${signals.length} signals detected indicate steady but focused activity. Their compliance moat is real — AcmeCloud should consider partnership vs build for healthcare/government verticals rather than direct competition.`,
    infralayer: `InfraLayer continues aggressive price competition with $0.005/hr instances across 32 global regions. While lacking managed services sophistication, they're capturing cost-sensitive startups who may scale into larger accounts. ${signals.length} signals show measured activity. The managed Kubernetes launch indicates platform maturation. Monitor for signs of upmarket movement that could threaten mid-market deals.`,
    edgepulse: `EdgePulse is positioning edge computing as superior to centralized cloud, not complementary. Their edge-native database and 5.2x latency benchmarks are gaining developer attention. With ${signals.length} signals and a Cloudflare partnership, they're building credibility. Current threat level is limited, but the edge narrative could erode centralized cloud demand for latency-sensitive workloads within 18 months.`,
    devstreamio: `DevStreamIO's rapid growth to 50K developers and AI-powered function builder show strong product-market fit in the serverless space. The Vercel VP hire signals enterprise ambitions. ${signals.length} signals detected indicate growing momentum. While not an immediate competitive threat, their generous free tier creates switching costs as projects scale. Watch for enterprise feature launches post-VP hire.`,
    quantumbase: `QuantumBase represents a paradigm threat to traditional cloud AI infrastructure. Their $120M raise, 3.2x training efficiency claims, and Fortune 500 LOIs suggest real traction. ${signals.length} signals detected with multiple strong indicators. If their custom silicon approach validates at scale, it could fundamentally reshape AI workload economics. Recommend initiating silicon partnership discussions and benchmarking their efficiency claims.`,
  };

  const aiSummary = aiSummaries[competitor.id] || `${competitor.name} has shown ${signals.length > 5 ? 'elevated' : 'moderate'} activity with ${signals.length} signals detected. Key focus areas include ${competitor.keyProducts.slice(0, 2).join(' and ')}. ${competitor.recentMoves[0] || 'Continue monitoring for strategic shifts.'}`;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "signals", label: `${signals.length === 1 ? 'Signal' : 'Signals'} (${signals.length})` },
    { id: "insights", label: `${insights.length === 1 ? 'Insight' : 'Insights'} (${insights.length})` },
  ];

  return (
    <PageShell>
      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {competitor.name}
            </h1>
            <ThreatBadge level={competitor.threatLevel} />
          </div>
          <p className="text-sm text-muted max-w-2xl">{competitor.description}</p>
          <p className="text-xs text-subtle mt-2 flex items-center gap-1">
            <span>Last Activity:</span>
            <FreshnessIndicator dateString={competitor.lastActivityDate} />
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-subtle">Threat Score</p>
          <p className="text-3xl font-bold text-foreground">{competitor.threatScore}</p>
        </div>
      </div>

      {/* 30-Day Signals Trend & AI Summary */}
      <div className="card p-5 mb-6">
        <div className="grid md:grid-cols-[200px_1fr] gap-6">
          <div>
            <p className="text-xs font-medium text-foreground mb-3">30-Day Signals Trend</p>
            <div className="bg-surface-hover rounded-lg p-3">
              <SignalsTrendChart data={signalsTrend} total={trendTotal} />
              <div className="flex justify-between text-[10px] text-subtle mt-2">
                <span>30d ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              30-Day Brief (AI-Generated)
            </p>
            <p className="text-sm text-muted leading-relaxed">{aiSummary}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-subtle mb-1">Founded</p>
          <p className="text-sm font-medium text-foreground">{competitor.founded}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-subtle mb-1">Funding</p>
          <p className="text-sm font-medium text-foreground">{competitor.funding}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-subtle mb-1">Employees</p>
          <p className="text-sm font-medium text-foreground">{competitor.employees}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-subtle mb-1">Signals (30d)</p>
          <p className="text-sm font-medium text-foreground">{trendTotal}</p>
        </div>
      </div>

      {/* Tabs */}
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* SWOT-style grid */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-low" />
              Strengths
            </h3>
            <ul className="space-y-2">
              {competitor.strengths.map((s, i) => (
                <li key={i} className="text-sm text-muted flex gap-2">
                  <span className="text-low">+</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-critical" />
              Weaknesses
            </h3>
            <ul className="space-y-2">
              {competitor.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-muted flex gap-2">
                  <span className="text-critical">−</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Key Products</h3>
            <div className="flex flex-wrap gap-2">
              {competitor.keyProducts.map((p, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-xs bg-surface-hover text-muted"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Recent Moves</h3>
            <ul className="space-y-2">
              {competitor.recentMoves.map((m, i) => (
                <li key={i} className="text-sm text-muted flex gap-2">
                  <span className="text-accent">→</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "signals" && (
        <div className="space-y-4">
          {/* Signal Filters */}
          <div className="flex flex-wrap gap-3 pb-3 border-b border-[rgba(0,0,0,0.06)]">
            <FilterDropdown
              label="Sort by"
              value={signalSortBy}
              onChange={(v) => setSignalSortBy(v as "relevant" | "recent")}
              options={[
                { value: "relevant", label: "Relevant" },
                { value: "recent", label: "Recent" },
              ]}
            />
            <FilterDropdown
              label="All Dates"
              value={signalDateFilter}
              onChange={setSignalDateFilter}
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
              label="All Categories"
              value={signalCategoryFilter}
              onChange={setSignalCategoryFilter}
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
              label="All Signal Strengths"
              value={signalStrengthFilter}
              onChange={setSignalStrengthFilter}
              options={[
                { value: "strong", label: "Strong" },
                { value: "moderate", label: "Moderate" },
                { value: "weak", label: "Weak" },
              ]}
            />
            {(signalDateFilter || signalCategoryFilter || signalStrengthFilter) && (
              <button
                onClick={() => {
                  setSignalDateFilter("");
                  setSignalCategoryFilter("");
                  setSignalStrengthFilter("");
                }}
                className="text-xs text-accent hover:text-accent/80 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Filtered signals count */}
          {signals.length > 0 && (
            <p className="text-xs text-subtle">
              Showing {filteredSignals.length} of {signals.length} signal{signals.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Signal cards */}
          <div className="space-y-3">
            {filteredSignals.length > 0 ? (
              [...filteredSignals]
                .sort((a, b) => {
                  if (signalSortBy === "recent") {
                    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
                  }
                  // "relevant" - sort by strength then by date
                  const strengthOrder = { strong: 3, moderate: 2, weak: 1 };
                  const strengthDiff = strengthOrder[b.strength] - strengthOrder[a.strength];
                  if (strengthDiff !== 0) return strengthDiff;
                  return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
                })
                .map((signal) => (
                  <div
                    key={signal.id}
                    id={`signal-${signal.id}`}
                    className={`transition-all duration-500 rounded-lg ${highlightedSignal === signal.id ? "ring-2 ring-accent ring-offset-2" : ""}`}
                  >
                    <DetailedSignalCard signal={signal} />
                  </div>
                ))
            ) : signals.length > 0 ? (
              <div className="text-center py-12">
                <p className="text-muted">No signals match your filters</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted">No signals detected for this competitor</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "insights" && (
        <div className="space-y-4">
          {/* Insight Filters */}
          <div className="flex flex-wrap gap-3 pb-3 border-b border-[rgba(0,0,0,0.06)]">
            <FilterDropdown
              label="Sort by"
              value={insightSortBy}
              onChange={(v) => setInsightSortBy(v as "relevant" | "recent")}
              options={[
                { value: "relevant", label: "Relevant" },
                { value: "recent", label: "Recent" },
              ]}
            />
            <FilterDropdown
              label="All Dates"
              value={insightDateFilter}
              onChange={setInsightDateFilter}
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
              label="All Categories"
              value={insightCategoryFilter}
              onChange={setInsightCategoryFilter}
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
              value={insightImpactFilter}
              onChange={setInsightImpactFilter}
              options={[
                { value: "high", label: "High Impact" },
                { value: "medium", label: "Medium Impact" },
                { value: "low", label: "Low Impact" },
              ]}
            />
            <FilterDropdown
              label="All Statuses"
              value={insightStatusFilter}
              onChange={setInsightStatusFilter}
              options={[
                { value: "new", label: "New" },
                { value: "past", label: "Past" },
              ]}
            />
            {(insightDateFilter || insightCategoryFilter || insightImpactFilter || insightStatusFilter) && (
              <button
                onClick={() => {
                  setInsightDateFilter("");
                  setInsightCategoryFilter("");
                  setInsightImpactFilter("");
                  setInsightStatusFilter("");
                }}
                className="text-xs text-accent hover:text-accent/80 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Filtered insights count */}
          {insights.length > 0 && (
            <p className="text-xs text-subtle">
              Showing {filteredInsights.length} of {insights.length} insight{insights.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Insight cards */}
          <div className="space-y-3">
            {filteredInsights.length > 0 ? (
              [...filteredInsights]
                .sort((a, b) => {
                  if (insightSortBy === "recent") {
                    return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
                  }
                  // "relevant" - sort by impact then by date
                  const impactOrder = { high: 3, medium: 2, low: 1 };
                  const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
                  if (impactDiff !== 0) return impactDiff;
                  return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
                })
                .map((insight) => <InsightCard key={insight.id} insight={insight} />)
            ) : insights.length > 0 ? (
              <div className="text-center py-12">
                <p className="text-muted">No insights match your filters</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted">No insights available for this competitor</p>
              </div>
            )}
          </div>
        </div>
      )}

    </PageShell>
  );
}
