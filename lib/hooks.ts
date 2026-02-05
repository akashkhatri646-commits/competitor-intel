"use client";

import { useState, useCallback, useEffect } from "react";

// ============================================================
// useSimulatedAI - Multi-phase AI synthesis animation
// ============================================================

export type AIPhase = "idle" | "scanning" | "detecting" | "synthesizing" | "complete";

export function useSimulatedAI() {
  const [phase, setPhase] = useState<AIPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [detectedCount, setDetectedCount] = useState(0);

  const startSynthesis = useCallback(() => {
    setPhase("scanning");
    setProgress(0);
    setDetectedCount(0);

    // Phase 1: Scanning (1.5s)
    const scanInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 100));
    }, 150);

    setTimeout(() => {
      clearInterval(scanInterval);
      setPhase("detecting");
      setProgress(0);

      // Phase 2: Detecting (1.5s) - count up signals
      let count = 0;
      const detectInterval = setInterval(() => {
        count++;
        setDetectedCount(count);
        if (count >= 6) {
          clearInterval(detectInterval);
        }
      }, 250);

      setTimeout(() => {
        clearInterval(detectInterval);
        setPhase("synthesizing");
        setProgress(0);

        // Phase 3: Synthesizing (2s) - confidence builds
        const synthInterval = setInterval(() => {
          setProgress((p) => Math.min(p + 5, 100));
        }, 100);

        setTimeout(() => {
          clearInterval(synthInterval);
          setProgress(100);
          setPhase("complete");

          // Auto-reset after showing complete
          setTimeout(() => {
            setPhase("idle");
            setProgress(0);
            setDetectedCount(0);
          }, 3000);
        }, 2000);
      }, 1500);
    }, 1500);
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setProgress(0);
    setDetectedCount(0);
  }, []);

  return { phase, progress, detectedCount, startSynthesis, reset };
}

// ============================================================
// useTimeAgo - Relative time formatting
// ============================================================

// Format date as "23 Jan 2026"
export function formatDateAbbrev(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function useTimeAgo(dateString: string): string {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    function calculate() {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return formatDateAbbrev(date);
    }

    setTimeAgo(calculate());
    const interval = setInterval(() => setTimeAgo(calculate()), 60000);
    return () => clearInterval(interval);
  }, [dateString]);

  return timeAgo;
}

// Static version for SSR
export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateAbbrev(date);
}

// ============================================================
// useFreshness - Categorize how fresh a timestamp is
// ============================================================

export type Freshness = "fresh" | "recent" | "stale";

export function getFreshness(dateString: string): Freshness {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / 3600000;

  if (diffHours < 1) return "fresh";
  if (diffHours < 24) return "recent";
  return "stale";
}
