"use client";

import Link from "next/link";
import {
  PageShell,
  PageHeader,
  KPICard,
  ThreatMatrix,
  SignalCard,
  DashboardInsightCard,
  AISynthesisLoader,
} from "@/components/ui";
import {
  dashboardKPIs,
  competitors,
  signals,
  insights,
} from "@/lib/data";
import { useSimulatedAI } from "@/lib/hooks";

const MAX_CARDS = 5;

export default function DashboardPage() {
  const { phase, progress, detectedCount, startSynthesis } = useSimulatedAI();

  // Recent Signals: signals from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentSignals = [...signals]
    .filter((s) => new Date(s.detectedAt) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
    .slice(0, MAX_CARDS);

  const latestInsights = [...insights]
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
    .slice(0, MAX_CARDS);

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        subtitle="Real-time competitive intelligence overview"
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

      {/* AI Synthesis Loader */}
      <AISynthesisLoader
        phase={phase}
        progress={progress}
        detectedCount={detectedCount}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {dashboardKPIs.map((kpi) => (
          <KPICard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Threat Matrix */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            Threat Matrix
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
              </svg>
              AI-generated
            </span>
          </h3>
          <ThreatMatrix competitors={competitors} />
        </div>

        {/* Middle Column - Recent Signals */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            Recent Signals
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
              </svg>
              AI-generated
            </span>
          </h3>
          <div className="card p-4">
            <div className="space-y-3">
              {recentSignals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            To view more signals, use global search or navigate to{" "}
            <Link href="/competitors" className="text-accent hover:text-accent/80 font-medium">
              Competitors
            </Link>
          </p>
        </div>

        {/* Right Column - Latest Insights */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            Latest Insights
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
              </svg>
              AI-generated
            </span>
          </h3>
          <div className="space-y-4">
            {latestInsights.map((insight) => (
              <DashboardInsightCard key={insight.id} insight={insight} />
            ))}
            <p className="pt-3 text-xs text-muted text-center">
              View all{" "}
              <Link href="/insights" className="text-accent hover:text-accent/80 font-medium">
                Insights
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
