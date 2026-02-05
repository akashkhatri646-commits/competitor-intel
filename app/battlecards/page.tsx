"use client";

import { useState } from "react";
import {
  PageShell,
  PageHeader,
  BattlecardPanel,
  FilterDropdown,
} from "@/components/ui";
import {
  competitors,
  battlecards,
  getCompetitor,
  getCompetitorBattlecard,
} from "@/lib/data";

export default function BattlecardsPage() {
  const [selectedCompetitorId, setSelectedCompetitorId] = useState(competitors[0]?.id || "");

  const competitor = getCompetitor(selectedCompetitorId);
  const battlecard = getCompetitorBattlecard(selectedCompetitorId);

  return (
    <PageShell>
      <PageHeader
        title={
          <>
            Battlecards
            <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
              </svg>
              AI-generated
            </span>
          </>
        }
        subtitle="Side-by-side competitive positioning for sales and GTM"
      />

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">AcmeCloud</span>
          <span className="text-sm text-muted">vs</span>
          <select
            value={selectedCompetitorId}
            onChange={(e) => setSelectedCompetitorId(e.target.value)}
            className="px-4 py-2 text-sm bg-surface border border-[rgba(255,255,255,0.08)] rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer"
          >
            {competitors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {competitor && battlecard ? (
        <div className="card p-6">
          <BattlecardPanel battlecard={battlecard} competitor={competitor} />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted">Select a competitor to view battlecard</p>
        </div>
      )}
    </PageShell>
  );
}
