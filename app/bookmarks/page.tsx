"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PageShell,
  PageHeader,
  InsightCard,
} from "@/components/ui";
import { insights } from "@/lib/data";
import {
  getAllInteractions,
  InsightInteractions,
} from "@/app/insights/[id]/page";

type ActivityTab = "bookmarked" | "liked" | "disliked" | "flagged";

const tabs: { id: ActivityTab; label: string; icon: JSX.Element }[] = [
  {
    id: "bookmarked",
    label: "Bookmarked",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  {
    id: "liked",
    label: "Liked",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
      </svg>
    ),
  },
  {
    id: "disliked",
    label: "Disliked",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
      </svg>
    ),
  },
  {
    id: "flagged",
    label: "Flagged",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
    ),
  },
];

export default function MyActivityPage() {
  const [activeTab, setActiveTab] = useState<ActivityTab>("bookmarked");
  const [interactions, setInteractions] = useState<InsightInteractions>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load interactions from localStorage
  useEffect(() => {
    const stored = getAllInteractions();
    setInteractions(stored);
    setIsLoaded(true);
  }, []);

  // Get insights for current tab
  const filteredInsights = useMemo(() => {
    return insights.filter((insight) => {
      const interaction = interactions[insight.id];
      if (!interaction) return false;

      switch (activeTab) {
        case "bookmarked":
          return interaction.bookmarked;
        case "liked":
          return interaction.feedback === "up";
        case "disliked":
          return interaction.feedback === "down";
        case "flagged":
          return interaction.flagged;
        default:
          return false;
      }
    });
  }, [interactions, activeTab]);

  // Get counts for each tab
  const counts = useMemo(() => {
    const result = { bookmarked: 0, liked: 0, disliked: 0, flagged: 0 };
    Object.values(interactions).forEach((interaction) => {
      if (interaction.bookmarked) result.bookmarked++;
      if (interaction.feedback === "up") result.liked++;
      if (interaction.feedback === "down") result.disliked++;
      if (interaction.flagged) result.flagged++;
    });
    return result;
  }, [interactions]);

  const getEmptyState = () => {
    switch (activeTab) {
      case "bookmarked":
        return {
          icon: (
            <svg className="w-12 h-12 text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          ),
          title: "No bookmarked insights",
          subtitle: "Click the bookmark icon on any insight to save it for later.",
        };
      case "liked":
        return {
          icon: (
            <svg className="w-12 h-12 text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          ),
          title: "No liked insights",
          subtitle: "Give a thumbs up to insights you find helpful.",
        };
      case "disliked":
        return {
          icon: (
            <svg className="w-12 h-12 text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
          ),
          title: "No disliked insights",
          subtitle: "Give a thumbs down to insights that weren't helpful.",
        };
      case "flagged":
        return {
          icon: (
            <svg className="w-12 h-12 text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          ),
          title: "No flagged insights",
          subtitle: "Flag insights that need review or attention.",
        };
    }
  };

  const totalActivity = counts.bookmarked + counts.liked + counts.disliked + counts.flagged;

  return (
    <PageShell>
      <PageHeader
        title="My Preferences"
        subtitle={`${totalActivity} total ${totalActivity === 1 ? 'interaction' : 'interactions'}`}
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-accent text-white"
                : "bg-surface hover:bg-surface-hover text-muted"
            }`}
          >
            {tab.icon}
            {tab.label}
            <span
              className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                activeTab === tab.id
                  ? "bg-white/20 text-white"
                  : "bg-surface-hover text-subtle"
              }`}
            >
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {!isLoaded ? (
        <div className="text-center py-12">
          <p className="text-muted">Loading...</p>
        </div>
      ) : filteredInsights.length > 0 ? (
        <div className="space-y-4">
          {filteredInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {getEmptyState().icon}
          <p className="text-muted mb-2">{getEmptyState().title}</p>
          <p className="text-xs text-subtle">{getEmptyState().subtitle}</p>
        </div>
      )}
    </PageShell>
  );
}
