"use client";

import React, { useState, useCallback } from "react";
import type { BenchmarkResult, BenchmarkConfig, SweepPoint } from "@/lib/trees/benchmark";
import type { TreeType, AccessPattern, Operation } from "@/lib/trees/benchmark";
import { Controls } from "./Controls";
import { TreeDiagram } from "./TreeDiagram";
import { LineChart } from "./LineChart";
import { BarChart } from "./BarChart";
import { HeightChart } from "./HeightChart";
import { SplayHeatmap } from "./SplayHeatmap";

export const TREE_COLORS: Record<TreeType, string> = {
  avl: "#2563eb",
  redblack: "#dc2626",
  splay: "#16a34a",
  twofour: "#d97706",
};

export const TREE_LABELS: Record<TreeType, string> = {
  avl: "AVL",
  redblack: "Red-Black",
  splay: "Splay",
  twofour: "2-4 Tree",
};

export type ChartTab = "tree" | "line" | "bar" | "heatmap" | "heighttime";

export interface AppState {
  n: number;
  pattern: AccessPattern;
  operation: Operation;
  enabledTrees: Record<TreeType, boolean>;
  customDataRaw: string;
  isRunning: boolean;
  benchResult: BenchmarkResult | null;
  sweepPoints: SweepPoint[] | null;
  activeTab: ChartTab;
  selectedTreeForDiagram: TreeType;
  error: string | null;
}

const INITIAL_STATE: AppState = {
  n: 2000,
  pattern: "uniform",
  operation: "insert",
  enabledTrees: { avl: true, redblack: true, splay: true, twofour: true },
  customDataRaw: "",
  isRunning: false,
  benchResult: null,
  sweepPoints: null,
  activeTab: "bar",
  selectedTreeForDiagram: "avl",
  error: null,
};

const N_SWEEP_VALUES = [500, 1000, 2000, 5000, 10000, 20000, 50000];

export default function TreeBenchmarker() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const handleRun = useCallback(async () => {
    setState(s => ({ ...s, isRunning: true, error: null }));

    try {
      // Dynamic import to keep trees out of SSR bundle
      const { runBenchmark, runSweep } = await import("@/lib/trees/benchmark");

      const enabledList = (Object.keys(state.enabledTrees) as TreeType[]).filter(
        t => state.enabledTrees[t]
      );
      if (enabledList.length === 0) {
        setState(s => ({ ...s, isRunning: false, error: "Select at least one tree." }));
        return;
      }

      let customData: number[] | undefined;
      if (state.customDataRaw.trim()) {
        customData = state.customDataRaw
          .split(/[\s,;]+/)
          .map(s => parseFloat(s.trim()))
          .filter(n => !isNaN(n));
      }

      const config: BenchmarkConfig = {
        n: state.n,
        pattern: state.pattern,
        operation: state.operation,
        trees: enabledList,
        customData,
      };

      // Run in async chunks to avoid blocking UI
      await new Promise(r => setTimeout(r, 0));
      const benchResult = runBenchmark(config);

      await new Promise(r => setTimeout(r, 0));
      const sweepPoints = runSweep(
        N_SWEEP_VALUES.filter(v => v <= Math.max(state.n, 5000)),
        state.pattern,
        state.operation,
        enabledList
      );

      setState(s => ({
        ...s,
        isRunning: false,
        benchResult,
        sweepPoints,
        activeTab: s.activeTab,
      }));
    } catch (err) {
      setState(s => ({
        ...s,
        isRunning: false,
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, [state.n, state.pattern, state.operation, state.enabledTrees, state.customDataRaw]);

  const tabs: { id: ChartTab; label: string }[] = [
    { id: "bar", label: "Height Comparison" },
    { id: "heighttime", label: "Height / Time" },
    { id: "line", label: "Ops/ms vs N" },
    { id: "tree", label: "Tree Diagram" },
    { id: "heatmap", label: "Splay Heatmap" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline gap-3">
            <h1 className="font-mono text-lg font-semibold tracking-tight text-zinc-900">
              Tree Benchmarker
            </h1>
            <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
              AVL · Red-Black · Splay · 2-4
            </span>
          </div>
          <p className="mt-0.5 font-mono text-[11px] text-zinc-500">
            Interactive benchmarking & visualization — all client-side
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left: Controls */}
          <aside className="space-y-4">
            <Controls
              state={state}
              setState={setState}
              onRun={handleRun}
            />
          </aside>

          {/* Right: Charts */}
          <section className="min-w-0">
            {state.error && (
              <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 font-mono text-xs text-red-700">
                {state.error}
              </div>
            )}

            {!state.benchResult && !state.isRunning && (
              <div className="flex h-96 items-center justify-center border border-dashed border-zinc-300 bg-white">
                <p className="font-mono text-sm text-zinc-400">
                  Configure parameters and click Run Benchmark
                </p>
              </div>
            )}

            {state.isRunning && (
              <div className="flex h-96 items-center justify-center border border-zinc-200 bg-white">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin border-2 border-zinc-300 border-t-zinc-700 rounded-full" />
                  <p className="mt-3 font-mono text-sm text-zinc-500">Running benchmark…</p>
                </div>
              </div>
            )}

            {state.benchResult && !state.isRunning && (
              <>
                {/* Summary row */}
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {state.benchResult.results.map(r => (
                    <div key={r.tree} className="border border-zinc-200 bg-white p-3">
                      <div
                        className="mb-1 h-0.5 w-8"
                        style={{ background: TREE_COLORS[r.tree] }}
                      />
                      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                        {TREE_LABELS[r.tree]}
                      </p>
                      <p className="mt-1 font-mono text-base font-semibold tabular-nums text-zinc-900">
                        {r.opsPerMs.toFixed(0)}
                        <span className="ml-1 text-[10px] font-normal text-zinc-400">ops/ms</span>
                      </p>
                      <p className="font-mono text-[11px] text-zinc-500">
                        h={r.finalHeight} · {r.totalMs.toFixed(1)}ms
                      </p>
                    </div>
                  ))}
                </div>

                {/* Tab nav */}
                <div className="mb-0 flex border-b border-zinc-200">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setState(s => ({ ...s, activeTab: tab.id }))}
                      className={`border-b-2 px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                        state.activeTab === tab.id
                          ? "border-zinc-900 text-zinc-900"
                          : "border-transparent text-zinc-400 hover:text-zinc-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Chart panels */}
                <div className="border border-t-0 border-zinc-200 bg-white p-4">
                  {state.activeTab === "bar" && (
                    <BarChart results={state.benchResult.results} />
                  )}
                  {state.activeTab === "heighttime" && (
                    <HeightChart results={state.benchResult.results} />
                  )}
                  {state.activeTab === "line" && state.sweepPoints && (
                    <LineChart
                      points={state.sweepPoints}
                      enabledTrees={state.enabledTrees}
                    />
                  )}
                  {state.activeTab === "tree" && (
                    <TreeDiagram
                      benchResult={state.benchResult}
                      selectedTree={state.selectedTreeForDiagram}
                      onSelectTree={t => setState(s => ({ ...s, selectedTreeForDiagram: t }))}
                      enabledTrees={state.enabledTrees}
                    />
                  )}
                  {state.activeTab === "heatmap" && (
                    <SplayHeatmap
                      benchResult={state.benchResult}
                    />
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
