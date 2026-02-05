"use client";

import { useState, useMemo } from "react";
import {
  PageShell,
  PageHeader,
  CompetitorCard,
  FilterBar,
  FilterDropdown,
  ThreatBadge,
} from "@/components/ui";
import { competitors, ThreatLevel, CompetitorType } from "@/lib/data";

export default function CompetitorsPage() {
  const [search, setSearch] = useState("");
  const [threatFilter, setThreatFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filteredCompetitors = useMemo(() => {
    return competitors.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (threatFilter && c.threatLevel !== threatFilter) {
        return false;
      }
      if (typeFilter && c.type !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [search, threatFilter, typeFilter]);

  const stats = useMemo(() => {
    const critical = competitors.filter((c) => c.threatLevel === "critical").length;
    const totalSignals = competitors.reduce((sum, c) => sum + c.signalCount30d, 0);
    return { critical, totalSignals };
  }, []);

  return (
    <PageShell>
      <PageHeader
        title="Competitors"
        subtitle={`Tracking ${competitors.length} ${competitors.length === 1 ? 'competitor' : 'competitors'} • ${stats.critical} critical ${stats.critical === 1 ? 'threat' : 'threats'} • ${stats.totalSignals} ${stats.totalSignals === 1 ? 'signal' : 'signals'} this month`}
      />

      <FilterBar onSearch={setSearch}>
        <FilterDropdown
          label="All Threat Levels"
          value={threatFilter}
          onChange={setThreatFilter}
          options={[
            { value: "critical", label: "Critical" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ]}
        />
        <FilterDropdown
          label="All Types"
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "direct", label: "Direct" },
            { value: "indirect", label: "Indirect" },
            { value: "emerging", label: "Emerging" },
          ]}
        />
      </FilterBar>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompetitors.map((competitor) => (
          <CompetitorCard key={competitor.id} competitor={competitor} />
        ))}
      </div>

      {filteredCompetitors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted">No competitors match your filters</p>
        </div>
      )}
    </PageShell>
  );
}
