"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  ThreatLevel,
  InsightCategory,
  SourceType,
  TeamRelevance,
  InsightImpact,
  SignalStrength,
  VerificationStatus,
  Competitor,
  Insight,
  Signal,
  Source,
  DashboardKPI,
  Battlecard,
  threatColors,
  categoryColors,
  sourceTypeLabels,
  getSourceById,
  getSignalCount30d,
  competitors as allCompetitors,
  insights as allInsights,
  signals as allSignals,
} from "@/lib/data";
import { AIPhase, getTimeAgo, getFreshness, formatDateAbbrev } from "@/lib/hooks";

// ============================================================
// LAYOUT COMPONENTS
// ============================================================

const navItems = [
  { href: "/", label: "Dashboard", icon: "grid" },
  { href: "/competitors", label: "Competitors", icon: "users" },
  { href: "/insights", label: "Insights", icon: "lightbulb" },
  { href: "/battlecards", label: "Battlecards", icon: "swords" },
  { href: "/bookmarks", label: "My Preferences", icon: "activity" },
  { href: "/sources", label: "Manage Sources", icon: "link" },
  { href: "/review", label: "Review Queue", icon: "review" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface border-r border-[rgba(0,0,0,0.08)] flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-[rgba(0,0,0,0.08)]">
        <h1 className="text-lg font-bold text-foreground">AcmeCloud Intel</h1>
        <p className="text-xs text-subtle mt-1">Competitor Intelligence</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:text-foreground hover:bg-surface-hover"
                  }`}
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-[rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 text-xs text-subtle">
          <span className="w-2 h-2 rounded-full bg-low animate-pulse" />
          AI Active
        </div>
        <p className="text-xs text-subtle mt-2">Last synced: 2 min ago</p>
      </div>
    </aside>
  );
}

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    grid: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    users: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    lightbulb: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    swords: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l9-9m0 0l9-9m-9 9l-9-9m9 9l9 9" />
      </svg>
    ),
    link: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    bookmark: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    activity: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    review: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };
  return icons[name] || null;
}

// Search history helpers
interface SearchHistoryItem {
  query: string;
  type: string;
  title: string;
  href: string;
  timestamp: number;
}

function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("search-history");
  return stored ? JSON.parse(stored) : [];
}

function saveSearchHistory(items: SearchHistoryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("search-history", JSON.stringify(items.slice(0, 10))); // Keep last 10
}

function addToSearchHistory(item: Omit<SearchHistoryItem, "timestamp">) {
  const history = getSearchHistory();
  // Remove duplicate if exists
  const filtered = history.filter((h) => h.href !== item.href);
  // Add new item at the beginning
  const updated = [{ ...item, timestamp: Date.now() }, ...filtered];
  saveSearchHistory(updated);
}

function removeFromSearchHistory(href: string) {
  const history = getSearchHistory();
  const filtered = history.filter((h) => h.href !== href);
  saveSearchHistory(filtered);
}

function clearSearchHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("search-history");
}

// Trending/popular searches (simulated)
const trendingSearches = [
  { query: "NimbusScale", type: "Competitor", href: "/competitors/nimbusscale" },
  { query: "AI infrastructure", type: "Search", href: "/insights?q=ai" },
  { query: "GPU pricing", type: "Search", href: "/insights?q=gpu" },
  { query: "QuantumBase", type: "Competitor", href: "/competitors/quantumbase" },
];

// Quick actions
const quickActions = [
  { label: "View all competitors", icon: "users", href: "/competitors" },
  { label: "View all insights", icon: "lightbulb", href: "/insights" },
  { label: "View battlecards", icon: "swords", href: "/battlecards" },
];

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load search history on mount
  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selecting a search result
  const handleSelectResult = (result: { type: string; title: string; href: string; subtitle?: string }) => {
    addToSearchHistory({
      query: searchQuery || result.title,
      type: result.type,
      title: result.title,
      href: result.href,
    });
    setSearchHistory(getSearchHistory());
    setShowSearchResults(false);
    setSearchQuery("");
  };

  // Handle removing a history item
  const handleRemoveHistoryItem = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromSearchHistory(href);
    setSearchHistory(getSearchHistory());
  };

  // Handle clearing all history
  const handleClearHistory = () => {
    clearSearchHistory();
    setSearchHistory([]);
  };

  // Dynamically search through real data
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results: { type: string; title: string; subtitle?: string; href: string }[] = [];

    // Search competitors
    if (searchFilter === "all" || searchFilter === "competitors") {
      allCompetitors.forEach((c) => {
        if (
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.keyProducts.some((p) => p.toLowerCase().includes(q))
        ) {
          results.push({
            type: "Competitor",
            title: c.name,
            subtitle: c.type + " competitor",
            href: `/competitors/${c.slug}`,
          });
        }
      });
    }

    // Search insights
    if (searchFilter === "all" || searchFilter === "insights") {
      allInsights.forEach((i) => {
        if (
          i.title.toLowerCase().includes(q) ||
          i.synthesis.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
        ) {
          results.push({
            type: "Insight",
            title: i.title,
            subtitle: i.category,
            href: `/insights/${i.id}`,
          });
        }
      });
    }

    // Search signals
    if (searchFilter === "all" || searchFilter === "signals") {
      allSignals.forEach((s) => {
        if (
          s.title.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        ) {
          const competitor = allCompetitors.find((c) => c.id === s.competitorId);
          results.push({
            type: "Signal",
            title: s.title,
            subtitle: s.category,
            href: `/competitors/${competitor?.slug || s.competitorId}?tab=signals&signal=${s.id}`,
          });
        }
      });
    }

    return results.slice(0, 8);
  }, [searchQuery, searchFilter]);

  // Autocomplete suggestions based on partial query
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    const suggestions: string[] = [];

    // Suggest competitor names
    allCompetitors.forEach((c) => {
      if (c.name.toLowerCase().startsWith(q) && !suggestions.includes(c.name)) {
        suggestions.push(c.name);
      }
    });

    // Suggest common search terms
    const commonTerms = ["pricing", "funding", "partnership", "product", "hiring", "technical", "AI", "GPU", "cloud", "enterprise"];
    commonTerms.forEach((term) => {
      if (term.toLowerCase().startsWith(q) && !suggestions.includes(term)) {
        suggestions.push(term);
      }
    });

    return suggestions.slice(0, 4);
  }, [searchQuery]);

  const notifications = [
    { id: 1, title: "New critical signal detected", desc: "NimbusScale raised $400M Series E", time: "2h ago", unread: true },
    { id: 2, title: "AI synthesis complete", desc: "3 new insights generated from 12 signals", time: "5h ago", unread: true },
    { id: 3, title: "Source verification needed", desc: "QuantumBase Fortune 500 LOI requires review", time: "1d ago", unread: false },
    { id: 4, title: "Weekly digest ready", desc: "Your competitor intelligence summary is available", time: "2d ago", unread: false },
  ];

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-[rgba(0,0,0,0.08)] z-40 flex items-center justify-between px-6">
      {/* Global Search */}
      <div ref={searchContainerRef} className="flex items-center gap-3 flex-1 max-w-xl relative">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search competitors, insights, signals..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-[rgba(0,0,0,0.08)] rounded-lg text-foreground placeholder-subtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[rgba(0,0,0,0.08)] rounded-lg shadow-lg overflow-hidden z-50 max-h-[480px] overflow-y-auto">
              {/* When user is typing - show autocomplete and results */}
              {searchQuery.trim() ? (
                <>
                  {/* Autocomplete suggestions */}
                  {autocompleteSuggestions.length > 0 && (
                    <div className="border-b border-[rgba(0,0,0,0.06)]">
                      {autocompleteSuggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => setSearchQuery(suggestion)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover transition-colors text-left"
                        >
                          <svg className="w-4 h-4 text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="text-sm text-foreground">
                            <span className="font-medium">{searchQuery}</span>
                            <span className="text-muted">{suggestion.slice(searchQuery.length)}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Search results */}
                  {searchResults.length > 0 ? (
                    <div>
                      <div className="px-4 py-2 bg-surface-hover/50">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Results</span>
                      </div>
                      {searchResults.map((result, i) => (
                        <Link
                          key={i}
                          href={result.href}
                          onClick={() => handleSelectResult(result)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors border-b border-[rgba(0,0,0,0.04)] last:border-b-0"
                        >
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle bg-surface px-2 py-0.5 rounded flex-shrink-0">
                            {result.type}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{result.title}</p>
                            {result.subtitle && (
                              <p className="text-xs text-muted truncate">{result.subtitle}</p>
                            )}
                          </div>
                          <svg className="w-4 h-4 text-subtle flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <svg className="w-8 h-8 text-muted mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-sm text-muted">No results found for &quot;{searchQuery}&quot;</p>
                      <p className="text-xs text-subtle mt-1">Try different keywords or check spelling</p>
                    </div>
                  )}
                </>
              ) : (
                /* When search is focused but empty - show history, trending, quick actions */
                <>
                  {/* Recent searches */}
                  {searchHistory.length > 0 && (
                    <div className="border-b border-[rgba(0,0,0,0.06)]">
                      <div className="px-4 py-2 bg-surface-hover/50 flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Recent Searches</span>
                        <button
                          onClick={handleClearHistory}
                          className="text-[10px] text-accent hover:text-accent/80 font-medium"
                        >
                          Clear all
                        </button>
                      </div>
                      {searchHistory.slice(0, 5).map((item, i) => (
                        <Link
                          key={i}
                          href={item.href}
                          onClick={() => handleSelectResult({ type: item.type, title: item.title, href: item.href })}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover transition-colors group"
                        >
                          <svg className="w-4 h-4 text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{item.title}</p>
                          </div>
                          <span className="text-[10px] text-subtle bg-surface px-1.5 py-0.5 rounded">{item.type}</span>
                          <button
                            onClick={(e) => handleRemoveHistoryItem(e, item.href)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-surface rounded transition-all"
                            title="Remove from history"
                          >
                            <svg className="w-3 h-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Trending searches */}
                  <div className="border-b border-[rgba(0,0,0,0.06)]">
                    <div className="px-4 py-2 bg-surface-hover/50">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Trending
                      </span>
                    </div>
                    {trendingSearches.map((item, i) => (
                      <Link
                        key={i}
                        href={item.href}
                        onClick={() => handleSelectResult({ type: item.type, title: item.query, href: item.href })}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover transition-colors"
                      >
                        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                        <span className="text-sm text-foreground">{item.query}</span>
                        <span className="text-[10px] text-subtle bg-surface px-1.5 py-0.5 rounded">{item.type}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Quick actions */}
                  <div>
                    <div className="px-4 py-2 bg-surface-hover/50">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Quick Actions</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-3">
                      {quickActions.map((action, i) => (
                        <Link
                          key={i}
                          href={action.href}
                          onClick={() => setShowSearchResults(false)}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-surface-hover transition-colors text-center"
                        >
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                            {action.icon === "users" && (
                              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            )}
                            {action.icon === "lightbulb" && (
                              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            )}
                            {action.icon === "swords" && (
                              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l9-9m0 0l9-9m-9 9l-9-9m9 9l9 9" />
                              </svg>
                            )}
                          </div>
                          <span className="text-xs text-muted">{action.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                </>
              )}
            </div>
          )}
        </div>
        <select
          value={searchFilter}
          onChange={(e) => {
            setSearchFilter(e.target.value);
            if (searchQuery.trim()) {
              setShowSearchResults(true);
            }
          }}
          className="px-3 py-2 text-sm bg-surface border border-[rgba(0,0,0,0.08)] rounded-lg text-muted focus:outline-none focus:border-accent cursor-pointer"
        >
          <option value="all">All</option>
          <option value="competitors">Competitors</option>
          <option value="insights">Insights</option>
          <option value="signals">Signals</option>
        </select>
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-2">
        {/* Help */}
        <button
          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          title="Help"
          onClick={() => window.open("https://help.acmecloud.com", "_blank")}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className={`relative p-2 rounded-lg transition-colors ${showNotifications ? 'text-foreground bg-surface-hover' : 'text-muted hover:text-foreground hover:bg-surface-hover'}`}
            onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); setShowProfile(false); }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-critical rounded-full"></span>
          </button>
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-[rgba(0,0,0,0.08)] rounded-lg shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <button className="text-xs text-accent hover:text-accent/80">Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`px-4 py-3 hover:bg-surface-hover transition-colors cursor-pointer border-b border-[rgba(0,0,0,0.04)] ${n.unread ? 'bg-accent/5' : ''}`}>
                    <div className="flex items-start gap-2">
                      {n.unread && <span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0"></span>}
                      <div className={n.unread ? '' : 'ml-4'}>
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted mt-0.5">{n.desc}</p>
                        <p className="text-xs text-subtle mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-[rgba(0,0,0,0.08)]">
                <button className="w-full text-sm text-accent hover:text-accent/80 font-medium">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="relative">
          <button
            className={`p-2 rounded-lg transition-colors ${showSettings ? 'text-foreground bg-surface-hover' : 'text-muted hover:text-foreground hover:bg-surface-hover'}`}
            onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); setShowProfile(false); }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          {showSettings && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-[rgba(0,0,0,0.08)] rounded-lg shadow-lg overflow-hidden z-50">
              <div className="py-1">
                <button className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-surface-hover transition-colors flex items-center gap-3">
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notification Preferences
                </button>
                <button className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-surface-hover transition-colors flex items-center gap-3">
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Data Sources
                </button>
                <button className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-surface-hover transition-colors flex items-center gap-3">
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Team Management
                </button>
                <button className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-surface-hover transition-colors flex items-center gap-3">
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Security & Privacy
                </button>
                <div className="border-t border-[rgba(0,0,0,0.08)] my-1"></div>
                <button className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-surface-hover transition-colors flex items-center gap-3">
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Help & Support
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-[rgba(0,0,0,0.08)] mx-2"></div>

        {/* Profile */}
        <div className="relative">
          <button
            className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${showProfile ? 'bg-surface-hover' : 'hover:bg-surface-hover'}`}
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowSettings(false); }}
          >
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-semibold">
              JD
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-medium text-foreground">John Doe</p>
              <p className="text-xs text-subtle">Product Lead</p>
            </div>
            <svg className={`w-4 h-4 text-muted hidden lg:block transition-transform ${showProfile ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showProfile && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-[rgba(0,0,0,0.08)] rounded-lg shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.08)]">
                <p className="text-sm font-semibold text-foreground">John Doe</p>
                <p className="text-xs text-muted">john.doe@acmecloud.com</p>
              </div>
              <div className="py-1">
                <button className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-surface-hover transition-colors flex items-center gap-3">
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </button>
                <button className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-surface-hover transition-colors flex items-center gap-3">
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Account Settings
                </button>
                <button className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-surface-hover transition-colors flex items-center gap-3">
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Activity Log
                </button>
                <div className="border-t border-[rgba(0,0,0,0.08)] my-1"></div>
                <button className="w-full px-4 py-2.5 text-left text-sm text-critical hover:bg-critical-bg transition-colors flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="ml-64 pt-16 min-h-screen bg-background bg-radial-glow">
      <div className="max-w-7xl mx-auto p-8">{children}</div>
    </main>
  );
}

// ============================================================
// BADGE COMPONENTS
// ============================================================

export function ThreatBadge({ level }: { level: ThreatLevel }) {
  const styles: Record<ThreatLevel, string> = {
    critical: "bg-critical-bg text-critical border-critical/20",
    high: "bg-high-bg text-high border-high/20",
    medium: "bg-medium-bg text-medium border-medium/20",
    low: "bg-low-bg text-low border-low/20",
  };

  const labels: Record<ThreatLevel, string> = {
    critical: "Critical Threat",
    high: "High Threat",
    medium: "Medium Threat",
    low: "Low Threat",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${styles[level]}`}
    >
      {labels[level]}
    </span>
  );
}

export function CategoryBadge({ category }: { category: InsightCategory }) {
  const color = categoryColors[category];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {category}
    </span>
  );
}

export function TeamTag({ team }: { team: TeamRelevance }) {
  const labels: Record<TeamRelevance, string> = {
    product: "Product",
    engineering: "Engineering",
    gtm: "GTM",
    leadership: "Leadership",
  };

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-hover text-muted">
      {labels[team]}
    </span>
  );
}

export function ImpactBadge({ impact }: { impact: InsightImpact }) {
  const styles: Record<InsightImpact, string> = {
    high: "text-critical",
    medium: "text-medium",
    low: "text-muted",
  };

  return (
    <span className={`text-xs font-medium ${styles[impact]}`}>
      {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
    </span>
  );
}

export function SourceTypeBadge({ type }: { type: SourceType }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-surface-hover text-subtle">
      {sourceTypeLabels[type]}
    </span>
  );
}

export function VerificationStatusBadge({ status, size = "sm" }: { status: VerificationStatus; size?: "sm" | "md" }) {
  const config: Record<VerificationStatus, { icon: React.ReactNode; label: string; className: string }> = {
    verified: {
      icon: (
        <svg className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      label: "Verified",
      className: "bg-green-100 text-green-700",
    },
    pending: {
      icon: (
        <svg className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "Pending Review",
      className: "bg-amber-100 text-amber-700",
    },
    unverified: {
      icon: (
        <svg className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
      label: "Unverified",
      className: "bg-gray-100 text-gray-600",
    },
    rejected: {
      icon: (
        <svg className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      label: "Rejected",
      className: "bg-red-100 text-red-700",
    },
  };

  const { icon, label, className } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${size === "sm" ? "text-[10px]" : "text-xs"} font-medium ${className}`}>
      {icon}
      {label}
    </span>
  );
}

export function FreshnessIndicator({ dateString }: { dateString: string }) {
  const freshness = getFreshness(dateString);
  const timeAgo = getTimeAgo(dateString);

  const colors: Record<typeof freshness, string> = {
    fresh: "text-fresh",
    recent: "text-recent",
    stale: "text-stale",
  };

  return (
    <span className={`text-xs font-medium ${colors[freshness]}`}>
      {timeAgo}
    </span>
  );
}

export function ConfidenceMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-surface-hover overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted">{value}%</span>
    </div>
  );
}

// ============================================================
// CARD COMPONENTS
// ============================================================

export function KPICard({ kpi }: { kpi: DashboardKPI }) {
  const changeColor =
    kpi.changeDirection === "up"
      ? "text-low"
      : kpi.changeDirection === "down"
      ? "text-critical"
      : "text-muted";

  return (
    <div className="card-elevated p-5 h-full flex flex-col">
      <p className="text-xs text-subtle font-medium uppercase tracking-wider mb-2 min-h-[32px]">
        {kpi.label}
      </p>
      <p className="text-3xl font-bold tracking-tight text-foreground">
        {kpi.value}
      </p>
      <p className={`text-xs mt-auto pt-2 ${changeColor}`}>
        {kpi.changeDirection === "up" && "+"}
        {kpi.changeDirection === "down" && "-"}
        {kpi.change}% {kpi.period}
      </p>
    </div>
  );
}

export function CompetitorCard({ competitor }: { competitor: Competitor }) {
  const count30d = getSignalCount30d(competitor.id);
  return (
    <Link href={`/competitors/${competitor.slug}`}>
      <div className="card-interactive p-5 h-full">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">{competitor.name}</h3>
            <p className="text-xs text-subtle capitalize">{competitor.type}</p>
          </div>
          <ThreatBadge level={competitor.threatLevel} />
        </div>
        <p className="text-sm text-muted line-clamp-2 mb-4">
          {competitor.description}
        </p>
        <div className="flex items-center justify-between text-xs text-subtle">
          <span>{count30d} {count30d === 1 ? 'signal' : 'signals'} (30d)</span>
          <span className="flex items-center gap-1">
            <span>Last Activity:</span>
            <FreshnessIndicator dateString={competitor.lastActivityDate} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function InsightCard({
  insight,
  effectiveVerificationStatus,
}: {
  insight: Insight;
  effectiveVerificationStatus?: VerificationStatus;
}) {
  const [showSources, setShowSources] = useState(false);
  const isNew = isNewInsight(insight);
  const displayStatus = effectiveVerificationStatus ?? insight.verificationStatus;

  return (
    <div className={`card p-4 transition-all duration-150 hover:border-[rgba(0,0,0,0.15)] hover:shadow-md ${isNew ? "border-accent/30" : ""}`}>
      {/* Header row - badges */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {isNew && (
            <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
              New
            </span>
          )}
          <VerificationStatusBadge status={displayStatus} />
        </div>
        <CategoryBadge category={insight.category} />
      </div>

      {/* Clickable area for drill-down */}
      <Link href={`/insights/${insight.id}`}>
        {/* Title row */}
        <h4 className="text-sm font-semibold text-foreground leading-snug hover:text-accent transition-colors mb-2">
          {insight.title}
        </h4>

        {/* Synthesis preview */}
        <p className="text-xs text-muted leading-relaxed mb-3 line-clamp-2">
          {insight.synthesis}
        </p>
      </Link>

      {/* Bottom row: Impact + Confidence + View Sources + Timestamp */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-[rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <ImpactBadge impact={insight.impact} />
          <span className="text-muted">
            <span className="text-subtle">Confidence:</span> {insight.confidence}%
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSources(!showSources);
            }}
            className="text-accent hover:text-accent/80 font-medium"
          >
            {showSources ? "Hide" : "View"} {insight.sourceIds.length === 1 ? 'Source' : 'Sources'} ({insight.sourceIds.length})
          </button>
        </div>
        <FreshnessIndicator dateString={insight.generatedAt} />
      </div>

      {showSources && (
        <SourceTracePanel sourceIds={insight.sourceIds} />
      )}
    </div>
  );
}

// Helper to check if insight is "new" (within 7 days AND not seen)
function isNewInsight(insight: Insight): boolean {
  if (insight.status !== "new") return false;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(insight.generatedAt) >= sevenDaysAgo;
}

// Dashboard-specific insight card with simplified layout
export function DashboardInsightCard({ insight }: { insight: Insight }) {
  const isNew = isNewInsight(insight);

  return (
    <Link href={`/insights/${insight.id}`} className="block h-full">
      <div className={`card-interactive p-4 h-full flex flex-col ${isNew ? "border-accent/30" : ""}`}>
        {/* Header row - always reserve space for consistent alignment */}
        <div className="flex items-center justify-between gap-3 mb-2 min-h-[20px]">
          {isNew ? (
            <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
              New
            </span>
          ) : (
            <span></span>
          )}
          <CategoryBadge category={insight.category} />
        </div>

        {/* Title row - fixed height with line clamp for consistency */}
        <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 min-h-[40px] mb-2">
          {insight.title}
        </h4>

        {/* Synthesis preview - flex-grow to fill available space */}
        <p className="text-xs text-muted line-clamp-2 mb-3 flex-grow">
          {insight.synthesis}
        </p>

        {/* Bottom row: Impact + Confidence + Timestamp - pinned to bottom */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-[rgba(0,0,0,0.06)] mt-auto">
          <div className="flex items-center gap-3">
            <ImpactBadge impact={insight.impact} />
            <span className="text-muted">
              <span className="text-subtle">Confidence:</span> {insight.confidence}%
            </span>
          </div>
          <FreshnessIndicator dateString={insight.generatedAt} />
        </div>
      </div>
    </Link>
  );
}

export function SignalStrengthBadge({ strength }: { strength: SignalStrength }) {
  const config: Record<SignalStrength, { color: string; bg: string; icon: string; label: string }> = {
    strong: { color: "text-critical", bg: "bg-critical-bg", icon: "▲▲▲", label: "Strong Signal" },
    moderate: { color: "text-medium", bg: "bg-medium-bg", icon: "▲▲", label: "Moderate Signal" },
    weak: { color: "text-muted", bg: "bg-surface-hover", icon: "▲", label: "Weak Signal" },
  };
  const { color, bg, icon, label } = config[strength];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium ${bg} ${color}`}>
      <span className="tracking-tighter">{icon}</span>
      {label}
    </span>
  );
}

export function SignalCard({ signal }: { signal: Signal }) {
  return (
    <Link href={`/competitors/${signal.competitorId}?tab=signals&signal=${signal.id}`}>
      <div className="card-interactive p-4 animate-fadeInUp">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="text-sm font-medium text-foreground">{signal.title}</h4>
          <CategoryBadge category={signal.category} />
        </div>
        <p className="text-xs text-muted line-clamp-2 mb-2">{signal.summary}</p>
        <div className="flex items-center justify-between text-xs">
          <SignalStrengthBadge strength={signal.strength} />
          <FreshnessIndicator dateString={signal.detectedAt} />
        </div>
      </div>
    </Link>
  );
}

// Detailed signal card with View Sources feature (for competitor detail page)
export function DetailedSignalCard({ signal }: { signal: Signal }) {
  const [showSource, setShowSource] = useState(false);
  const source = getSourceById(signal.sourceId);

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-sm font-medium text-foreground">{signal.title}</h4>
        <CategoryBadge category={signal.category} />
      </div>
      <p className="text-sm text-muted mb-3">{signal.summary}</p>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <SignalStrengthBadge strength={signal.strength} />
          <button
            onClick={() => setShowSource(!showSource)}
            className="text-accent hover:text-accent/80 font-medium"
          >
            {showSource ? "Hide" : "View"} Source
          </button>
        </div>
        <FreshnessIndicator dateString={signal.detectedAt} />
      </div>
      {showSource && source && (
        <div className="mt-3 pt-3 border-t border-[rgba(0,0,0,0.08)]">
          <div className="glass-card p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-accent hover:text-accent/80 underline underline-offset-2 line-clamp-1"
                >
                  {source.title}
                </a>
                <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  Public
                </span>
              </div>
              <SourceTypeBadge type={source.type} />
            </div>
            <p className="text-xs text-muted line-clamp-2 mb-2">{source.snippet}</p>
            <div className="flex items-center gap-3 text-xs text-subtle">
              <span>Published: {formatDateAbbrev(new Date(source.publishedAt))}</span>
              <span>•</span>
              <span className={source.reliability === "verified" ? "text-low" : "text-medium"}>
                {source.reliability}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SourceTracePanel({ sourceIds }: { sourceIds: string[] }) {
  return (
    <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.08)] space-y-3">
      <p className="text-xs font-semibold text-foreground">Source Chain</p>
      {sourceIds.map((id) => {
        const source = getSourceById(id);
        if (!source) return null;
        return (
          <div key={id} className="glass-card p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-accent hover:text-accent/80 underline underline-offset-2 line-clamp-1"
                >
                  {source.title}
                </a>
                <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  Public
                </span>
              </div>
              <SourceTypeBadge type={source.type} />
            </div>
            <p className="text-xs text-muted line-clamp-2 mb-2">{source.snippet}</p>
            <div className="flex items-center gap-3 text-xs text-subtle">
              <span>Published: {formatDateAbbrev(new Date(source.publishedAt))}</span>
              <span>•</span>
              <span className={source.reliability === "verified" ? "text-low" : "text-medium"}>
                {source.reliability}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BattlecardPanel({
  battlecard,
  competitor,
}: {
  battlecard: Battlecard;
  competitor: Competitor;
}) {
  const [expandedObjection, setExpandedObjection] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Advantages Comparison */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
        {/* AcmeCloud Column */}
        <div className="flex flex-col items-center text-center">
          <h3 className="font-semibold text-foreground mb-1">AcmeCloud</h3>
          <p className="text-xs text-subtle mb-4">Your advantages</p>
          <div className="space-y-2 w-full">
            {battlecard.ourAdvantages.map((adv, i) => (
              <div key={i} className="text-sm text-center">
                <span className="text-low">+ </span>
                <span className="text-muted">{adv}</span>
              </div>
            ))}
          </div>
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center px-4 pt-6">
          <span className="text-xs font-medium text-muted">vs</span>
        </div>

        {/* Competitor Column */}
        <div className="flex flex-col items-center text-center">
          <h3 className="font-semibold text-foreground mb-1">{competitor.name}</h3>
          <p className="text-xs text-subtle mb-4">Their advantages</p>
          <div className="space-y-2 w-full">
            {battlecard.theirAdvantages.map((adv, i) => (
              <div key={i} className="text-sm text-center">
                <span className="text-critical">+ </span>
                <span className="text-muted">{adv}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Positioning */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-foreground mb-2">Their Positioning</p>
        <p className="text-sm text-muted">{battlecard.positioning}</p>
      </div>

      {/* Objection Handling */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-3">Objection Handling</p>
        <div className="space-y-2">
          {battlecard.objectionHandling.map((item, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setExpandedObjection(expandedObjection === i ? null : i)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-surface-hover transition-colors"
              >
                <span className="text-sm font-medium text-foreground">
                  &quot;{item.objection}&quot;
                </span>
                <span className="text-muted text-lg">
                  {expandedObjection === i ? "−" : "+"}
                </span>
              </button>
              {expandedObjection === i && (
                <div className="px-3 pb-3">
                  <p className="text-sm text-muted bg-surface-hover rounded p-3">
                    {item.response}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-[auto_1fr] gap-4">
        <div className="card p-4 min-w-[120px]">
          <p className="text-xs text-subtle mb-1">Win Rate vs {competitor.name}</p>
          <p className="text-2xl font-bold text-foreground">{battlecard.winRate}%</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-subtle mb-1">Rationale</p>
          <p className="text-sm text-muted">{battlecard.winRateRationale}</p>
        </div>
      </div>

      {/* Competing Deal Scenarios */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-2">Competing Deal Scenarios</p>
        <div className="flex flex-wrap gap-2">
          {battlecard.commonScenarios.map((scenario, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-full text-xs bg-surface-hover text-muted"
            >
              {scenario}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// AI SYNTHESIS COMPONENTS
// ============================================================

export function AISynthesisLoader({
  phase,
  progress,
  detectedCount,
}: {
  phase: AIPhase;
  progress: number;
  detectedCount: number;
}) {
  if (phase === "idle") return null;

  const phaseText = {
    scanning: `Scanning 247 sources across 7 competitors...`,
    detecting: `Detected ${detectedCount} new signals...`,
    synthesizing: `Synthesizing insights...`,
    complete: `Analysis complete`,
  };

  return (
    <div className="card-elevated p-6 mb-6 animate-fadeInUp">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
        <p className="text-sm font-medium text-foreground">{phaseText[phase]}</p>
      </div>

      {phase !== "complete" && (
        <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {phase === "complete" && (
        <p className="text-sm text-low">Updates successful</p>
      )}
    </div>
  );
}

// ============================================================
// VISUALIZATION COMPONENTS
// ============================================================

export function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  const padding = 2;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((v - min) / range) * (height - padding * 2) - padding;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SignalsTrendChart({ data, total }: { data: number[]; total: number }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 80;
  const width = 160;
  const padding = 8;

  // Generate line points and coordinates for hover detection
  // day: 0 = Today, 1 = 1d ago, etc. Last point (i=29) should be Today
  const pointCoords = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((v - min) / range) * (height - padding * 2) - padding;
    return { x, y, value: v, day: data.length - 1 - i };
  });

  const points = pointCoords.map(p => `${p.x},${p.y}`).join(" ");

  // Generate area fill path
  const areaPath = `M ${padding},${height - padding} L ${pointCoords.map(p => `${p.x},${p.y}`).join(" L ")} L ${width - padding},${height - padding} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const chartWidth = width - padding * 2;
    const relativeX = x - padding;
    const index = Math.round((relativeX / chartWidth) * (data.length - 1));
    if (index >= 0 && index < data.length) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <svg
          width={width}
          height={height}
          className="overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="signalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + (i * (height - padding * 2)) / 3}
              x2={width - padding}
              y2={padding + (i * (height - padding * 2)) / 3}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity="0.5"
            />
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#signalGradient)" />

          {/* Main line */}
          <polyline
            points={points}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover vertical line */}
          {hoverIndex !== null && pointCoords[hoverIndex] && (
            <>
              <line
                x1={pointCoords[hoverIndex].x}
                y1={padding}
                x2={pointCoords[hoverIndex].x}
                y2={height - padding}
                stroke="var(--accent)"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.6"
              />
              <circle
                cx={pointCoords[hoverIndex].x}
                cy={pointCoords[hoverIndex].y}
                r="4"
                fill="var(--accent)"
                stroke="var(--surface)"
                strokeWidth="2"
              />
            </>
          )}

          {/* End point dot (when not hovering) */}
          {hoverIndex === null && data.length > 0 && (
            <circle
              cx={width - padding}
              cy={height - ((data[data.length - 1] - min) / range) * (height - padding * 2) - padding}
              r="3"
              fill="var(--accent)"
            />
          )}
        </svg>

        {/* Hover tooltip */}
        {hoverIndex !== null && pointCoords[hoverIndex] && (
          <div
            className="absolute -top-6 transform -translate-x-1/2 bg-foreground text-surface px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
            style={{ left: pointCoords[hoverIndex].x }}
          >
            {pointCoords[hoverIndex].value} signal{pointCoords[hoverIndex].value !== 1 ? 's' : ''} • {pointCoords[hoverIndex].day === 0 ? 'Today' : `${pointCoords[hoverIndex].day}d ago`}
          </div>
        )}
      </div>

      {/* Stats row - total centered */}
      <div className="flex justify-center text-[10px]">
        <span className="text-subtle">Total: {total}</span>
      </div>
    </div>
  );
}

export function ThreatMatrix({ competitors }: { competitors: Competitor[] }) {
  return (
    <div className="card p-5">
      <div className="relative aspect-square max-w-[300px] mx-auto">
        {/* Grid lines */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <div className="border-r border-b border-[rgba(0,0,0,0.08)]" />
          <div className="border-b border-[rgba(0,0,0,0.08)]" />
          <div className="border-r border-[rgba(0,0,0,0.08)]" />
          <div />
        </div>

        {/* Axis labels */}
        <span className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-subtle">
          Impact
        </span>
        <span className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 text-[10px] text-subtle">
          Activity
        </span>

        {/* Quadrant labels */}
        <span className="absolute top-2 left-2 text-[10px] text-subtle">Monitor</span>
        <span className="absolute top-2 right-2 text-[10px] text-critical">Critical</span>
        <span className="absolute bottom-2 left-2 text-[10px] text-subtle">Low</span>
        <span className="absolute bottom-2 right-2 text-[10px] text-medium">Watch</span>

        {/* Competitor dots */}
        {competitors.map((c) => {
          // X: Activity (signals in last 30d) - scale 0-20 signals to 5-95%
          const activityCount = getSignalCount30d(c.id);
          const x = Math.min(95, Math.max(5, (activityCount / 20) * 90 + 5));
          // Y: Impact (threatScore) - inverted, scale 0-100 to position
          const y = 100 - c.threatScore;
          return (
            <Link
              key={c.id}
              href={`/competitors/${c.slug}`}
              className="absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group hover:scale-150 transition-transform"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                backgroundColor: threatColors[c.threatLevel],
              }}
              title={c.name}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <span className="text-[10px] text-foreground whitespace-nowrap bg-white px-1.5 py-0.5 rounded shadow-sm border border-[rgba(0,0,0,0.1)]">
                  {c.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// FILTER COMPONENTS
// ============================================================

export function FilterBar({
  children,
  onSearch,
  searchValue,
}: {
  children?: React.ReactNode;
  onSearch?: (query: string) => void;
  searchValue?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {onSearch && (
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchValue ?? ""}
            onChange={(e) => onSearch(e.target.value)}
            className="w-48 px-3 py-2 pl-8 text-sm bg-surface border border-[rgba(0,0,0,0.08)] rounded-lg text-foreground placeholder-subtle focus:outline-none focus:border-accent"
          />
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}
      {children}
    </div>
  );
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 text-sm bg-surface border border-[rgba(0,0,0,0.08)] rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer"
    >
      <option value="">{label}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ============================================================
// TAB COMPONENTS
// ============================================================

export function TabGroup({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 p-1 bg-surface rounded-lg mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === tab.id
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// TABLE COMPONENTS
// ============================================================

export function SourceTable({
  sources,
  onEdit,
  onDelete,
}: {
  sources: Source[];
  onEdit?: (source: Source) => void;
  onDelete?: (source: Source) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[rgba(0,0,0,0.08)]">
            <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">
              Title
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">
              Type
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">
              Published
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">
              Freshness
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">
              Status
            </th>
            {(onEdit || onDelete) && (
              <th className="text-right px-4 py-3 text-xs font-semibold text-subtle uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr
              key={source.id}
              className="border-b border-[rgba(0,0,0,0.04)] hover:bg-surface-hover transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-foreground hover:text-accent line-clamp-1"
                  >
                    {source.title}
                  </a>
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    Public
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <SourceTypeBadge type={source.type} />
              </td>
              <td className="px-4 py-3 text-sm text-muted">
                {new Date(source.publishedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <FreshnessIndicator dateString={source.scrapedAt} />
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs font-medium ${
                    source.reliability === "verified" ? "text-low" : "text-medium"
                  }`}
                >
                  {source.reliability}
                </span>
              </td>
              {(onEdit || onDelete) && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(source)}
                        className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                        title="Edit source"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(source)}
                        className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete source"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
