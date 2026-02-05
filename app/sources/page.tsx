"use client";

import { useState, useMemo, useEffect } from "react";
import {
  PageShell,
  PageHeader,
  SourceTable,
  FilterBar,
  FilterDropdown,
} from "@/components/ui";
import { sources as staticSources, competitors as staticCompetitors, Source, SourceType, Competitor } from "@/lib/data";
import { getFreshness } from "@/lib/hooks";

// ===== localStorage helpers =====

interface UserSource extends Source {
  _userAdded?: boolean;
}

interface UserCompetitor {
  id: string;
  name: string;
}

function getUserSources(): UserSource[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("user-sources");
  return stored ? JSON.parse(stored) : [];
}

function saveUserSources(sources: UserSource[]) {
  localStorage.setItem("user-sources", JSON.stringify(sources));
}

function getSourceEdits(): Record<string, Partial<Source>> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem("source-edits");
  return stored ? JSON.parse(stored) : {};
}

function saveSourceEdits(edits: Record<string, Partial<Source>>) {
  localStorage.setItem("source-edits", JSON.stringify(edits));
}

function getDeletedSourceIds(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("deleted-sources");
  return stored ? JSON.parse(stored) : [];
}

function saveDeletedSourceIds(ids: string[]) {
  localStorage.setItem("deleted-sources", JSON.stringify(ids));
}

function getUserCompetitors(): UserCompetitor[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("user-competitors");
  return stored ? JSON.parse(stored) : [];
}

function saveUserCompetitors(comps: UserCompetitor[]) {
  localStorage.setItem("user-competitors", JSON.stringify(comps));
}

// ===== Source types config =====
const sourceTypeOptions: { value: SourceType; label: string }[] = [
  { value: "blog", label: "Blog" },
  { value: "press-release", label: "Press Release" },
  { value: "job-posting", label: "Job Posting" },
  { value: "github", label: "GitHub" },
  { value: "social-media", label: "Social Media" },
  { value: "news-article", label: "News Article" },
  { value: "documentation", label: "Documentation" },
  { value: "review-site", label: "Review Site" },
];

// ===== URL-to-SourceType detection =====
function detectSourceType(url: string): SourceType | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("github.com") || hostname.includes("gitlab.com") || hostname.includes("bitbucket.org")) return "github";
    if (hostname.includes("twitter.com") || hostname.includes("x.com") || hostname.includes("linkedin.com") || hostname.includes("facebook.com") || hostname.includes("instagram.com") || hostname.includes("mastodon") || hostname.includes("threads.net")) return "social-media";
    if (hostname.includes("g2.com") || hostname.includes("capterra.com") || hostname.includes("trustradius.com") || hostname.includes("gartner.com") || hostname.includes("trustpilot.com")) return "review-site";
    if (hostname.includes("docs.") || hostname.includes("documentation") || hostname.includes("developer.") || hostname.includes("devdocs") || hostname.endsWith(".readthedocs.io")) return "documentation";
    if (hostname.includes("medium.com") || hostname.includes("dev.to") || hostname.includes("hashnode") || hostname.includes("substack.com") || hostname.includes("blog.") || hostname.includes("wordpress.com")) return "blog";
    if (hostname.includes("prnewswire.com") || hostname.includes("businesswire.com") || hostname.includes("globenewswire.com") || hostname.includes("prweb.com")) return "press-release";
    if (hostname.includes("lever.co") || hostname.includes("greenhouse.io") || hostname.includes("jobs.") || hostname.includes("careers.") || hostname.includes("indeed.com") || hostname.includes("glassdoor.com") || hostname.includes("workday.com")) return "job-posting";
    if (hostname.includes("reuters.com") || hostname.includes("techcrunch.com") || hostname.includes("theverge.com") || hostname.includes("arstechnica.com") || hostname.includes("zdnet.com") || hostname.includes("wired.com") || hostname.includes("bloomberg.com")) return "news-article";
    // Path-based fallbacks
    const path = new URL(url).pathname.toLowerCase();
    if (path.includes("/blog")) return "blog";
    if (path.includes("/press") || path.includes("/newsroom")) return "press-release";
    if (path.includes("/jobs") || path.includes("/careers")) return "job-posting";
    if (path.includes("/docs") || path.includes("/documentation")) return "documentation";
  } catch {
    // Invalid URL, skip detection
  }
  return null;
}

export default function SourcesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [competitorFilter, setCompetitorFilter] = useState("");

  // localStorage-backed state
  const [userSources, setUserSources] = useState<UserSource[]>([]);
  const [sourceEdits, setSourceEdits] = useState<Record<string, Partial<Source>>>({});
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [userCompetitors, setUserCompetitors] = useState<UserCompetitor[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [deletingSource, setDeletingSource] = useState<Source | null>(null);

  // Form fields
  const [formCompetitor, setFormCompetitor] = useState("");
  const [formNewCompetitorName, setFormNewCompetitorName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formType, setFormType] = useState<SourceType>("blog");
  const [formGuidance, setFormGuidance] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    setUserSources(getUserSources());
    setSourceEdits(getSourceEdits());
    setDeletedIds(getDeletedSourceIds());
    setUserCompetitors(getUserCompetitors());
    setIsLoaded(true);
  }, []);

  // Save helpers
  const persistUserSources = (next: UserSource[]) => {
    setUserSources(next);
    saveUserSources(next);
  };

  const persistSourceEdits = (next: Record<string, Partial<Source>>) => {
    setSourceEdits(next);
    saveSourceEdits(next);
  };

  const persistDeletedIds = (next: string[]) => {
    setDeletedIds(next);
    saveDeletedSourceIds(next);
  };

  const persistUserCompetitors = (next: UserCompetitor[]) => {
    setUserCompetitors(next);
    saveUserCompetitors(next);
  };

  // Merge all competitors
  const allCompetitors = useMemo(() => {
    const base = staticCompetitors.map((c) => ({ id: c.id, name: c.name }));
    return [...base, ...userCompetitors];
  }, [userCompetitors]);

  // Merge all sources: static (with edits applied, minus deleted) + user-added
  const allSources = useMemo(() => {
    const merged: Source[] = [];

    // Static sources (apply edits, skip deleted)
    for (const s of staticSources) {
      if (deletedIds.includes(s.id)) continue;
      const edits = sourceEdits[s.id];
      if (edits) {
        merged.push({ ...s, ...edits } as Source);
      } else {
        merged.push(s);
      }
    }

    // User-added sources (skip deleted)
    for (const s of userSources) {
      if (deletedIds.includes(s.id)) continue;
      const edits = sourceEdits[s.id];
      if (edits) {
        merged.push({ ...s, ...edits } as Source);
      } else {
        merged.push(s);
      }
    }

    return merged;
  }, [userSources, sourceEdits, deletedIds]);

  // Filtered and sorted
  const filteredSources = useMemo(() => {
    return allSources
      .filter((s) => {
        if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (typeFilter && s.type !== typeFilter) return false;
        if (competitorFilter && s.competitorId !== competitorFilter) return false;
        return true;
      })
      .sort((a, b) => new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime());
  }, [search, typeFilter, competitorFilter, allSources]);

  // Stats
  const stats = useMemo(() => {
    const verified = allSources.filter((s) => s.reliability === "verified").length;
    return { total: allSources.length, verified };
  }, [allSources]);

  // ===== Modal actions =====

  const resetForm = () => {
    setFormCompetitor("");
    setFormNewCompetitorName("");
    setFormTitle("");
    setFormUrl("");
    setFormType("blog");
    setFormGuidance("");
    setEditingSource(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (source: Source) => {
    setEditingSource(source);
    setFormCompetitor(source.competitorId);
    setFormNewCompetitorName("");
    setFormTitle(source.title);
    setFormUrl(source.url);
    setFormType(source.type);
    setFormGuidance((source as any).guidance ?? "");
    setShowAddModal(true);
  };

  const openDeleteModal = (source: Source) => {
    setDeletingSource(source);
    setShowDeleteModal(true);
  };

  const handleSave = () => {
    // Resolve competitor
    let competitorId = formCompetitor;
    if (formCompetitor === "__new__" && formNewCompetitorName.trim()) {
      const newId = formNewCompetitorName.trim().toLowerCase().replace(/\s+/g, "-");
      // Check if already exists
      if (!allCompetitors.some((c) => c.id === newId)) {
        persistUserCompetitors([...userCompetitors, { id: newId, name: formNewCompetitorName.trim() }]);
      }
      competitorId = newId;
    }

    if (!formUrl.trim() || !competitorId) return;

    const resolvedTitle = formTitle.trim() || formUrl.trim();
    const guidanceValue = formGuidance.trim() || undefined;

    if (editingSource) {
      // Edit existing source
      const isUserSource = userSources.some((s) => s.id === editingSource.id);
      if (isUserSource) {
        // Update user source directly
        const updated = userSources.map((s) =>
          s.id === editingSource.id
            ? { ...s, title: resolvedTitle, url: formUrl.trim(), type: formType, competitorId, guidance: guidanceValue }
            : s
        );
        persistUserSources(updated);
      } else {
        // Edit static source via edits overlay
        persistSourceEdits({
          ...sourceEdits,
          [editingSource.id]: { title: resolvedTitle, url: formUrl.trim(), type: formType, competitorId, guidance: guidanceValue } as Partial<Source>,
        });
      }
    } else {
      // Add new source
      const newSource: UserSource = {
        id: `user-src-${Date.now()}`,
        title: resolvedTitle,
        url: formUrl.trim(),
        type: formType,
        competitorId,
        publishedAt: new Date().toISOString(),
        scrapedAt: new Date().toISOString(),
        snippet: "",
        reliability: "unverified",
        guidance: guidanceValue,
        _userAdded: true,
      } as UserSource;
      persistUserSources([...userSources, newSource]);
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!deletingSource) return;
    // If user-added, remove from array; if static, add to deleted list
    const isUserSource = userSources.some((s) => s.id === deletingSource.id);
    if (isUserSource) {
      persistUserSources(userSources.filter((s) => s.id !== deletingSource.id));
    } else {
      persistDeletedIds([...deletedIds, deletingSource.id]);
    }
    setShowDeleteModal(false);
    setDeletingSource(null);
  };

  const isFormValid = formUrl.trim() && (formCompetitor && formCompetitor !== "__new__" || (formCompetitor === "__new__" && formNewCompetitorName.trim()));

  return (
    <PageShell>
      <PageHeader
        title="Manage Sources"
        subtitle={`${stats.total} sources tracked • ${stats.verified} verified`}
        action={
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Source
          </button>
        }
      />

      <FilterBar onSearch={setSearch} searchValue={search}>
        <FilterDropdown
          label="All Types"
          value={typeFilter}
          onChange={setTypeFilter}
          options={sourceTypeOptions}
        />
        <FilterDropdown
          label="All Competitors"
          value={competitorFilter}
          onChange={setCompetitorFilter}
          options={allCompetitors.map((c) => ({ value: c.id, label: c.name }))}
        />
      </FilterBar>

      {isLoaded && (
        <SourceTable
          sources={filteredSources}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      )}

      {isLoaded && filteredSources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted">No sources match your filters</p>
        </div>
      )}

      {/* Add / Edit Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {editingSource ? "Edit Source" : "Add Source"}
            </h3>

            {/* Competitor (mandatory) */}
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Competitor <span className="text-red-500">*</span>
            </label>
            <select
              value={formCompetitor}
              onChange={(e) => setFormCompetitor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.08)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 mb-3"
            >
              <option value="">Select competitor...</option>
              {allCompetitors.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="__new__">+ Add New Competitor...</option>
            </select>

            {/* New competitor name (conditional) */}
            {formCompetitor === "__new__" && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  New Competitor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formNewCompetitorName}
                  onChange={(e) => setFormNewCompetitorName(e.target.value)}
                  placeholder="e.g., Acme Rival Inc."
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.08)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            )}

            {/* Source URL (mandatory) */}
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Source URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formUrl}
              onChange={(e) => {
                const newUrl = e.target.value;
                setFormUrl(newUrl);
                const detected = detectSourceType(newUrl);
                if (detected) setFormType(detected);
              }}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.08)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 mb-3"
            />

            {/* Source Type (mandatory, auto-detected from URL) */}
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Source Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as SourceType)}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.08)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 mb-3"
            >
              {sourceTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Source Title (optional) */}
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Source Title <span className="text-muted font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g., CloudForge Launches AI Module"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.08)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 mb-3"
            />

            {/* Guidance (optional) */}
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Guidance <span className="text-muted font-normal">(Optional)</span>
            </label>
            <textarea
              value={formGuidance}
              onChange={(e) => setFormGuidance(e.target.value)}
              placeholder="e.g., Focus on pricing changes, new enterprise features, or partnership announcements"
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-[rgba(0,0,0,0.08)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 mb-4 resize-none"
            />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="px-4 py-2 rounded-lg bg-surface-hover text-muted text-sm font-medium hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isFormValid}
                className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingSource ? "Save Changes" : "Add Source"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingSource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Source</h3>
            <p className="text-sm text-muted mb-1">Are you sure you want to delete this source?</p>
            <p className="text-sm text-foreground font-medium mb-4 line-clamp-2">{deletingSource.title}</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletingSource(null); }}
                className="px-4 py-2 rounded-lg bg-surface-hover text-muted text-sm font-medium hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
