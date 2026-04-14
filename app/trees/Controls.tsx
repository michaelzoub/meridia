"use client";

import React from "react";
import type { AppState } from "./TreeBenchmarker";
import type { TreeType, AccessPattern, Operation } from "@/lib/trees/benchmark";
import { TREE_COLORS, TREE_LABELS } from "./TreeBenchmarker";

interface ControlsProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onRun: () => void;
}

const ALL_TREES: TreeType[] = ["avl", "redblack", "splay", "twofour"];

export function Controls({ state, setState, onRun }: ControlsProps) {
  function set<K extends keyof AppState>(key: K, val: AppState[K]) {
    setState(s => ({ ...s, [key]: val }));
  }

  function toggleTree(t: TreeType) {
    setState(s => ({
      ...s,
      enabledTrees: { ...s.enabledTrees, [t]: !s.enabledTrees[t] },
    }));
  }

  const nDisplay = state.n >= 1000 ? `${(state.n / 1000).toFixed(0)}k` : String(state.n);

  return (
    <div className="space-y-4">
      {/* N slider */}
      <div className="border border-zinc-200 bg-white p-4">
        <label className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          <span>Keys (N)</span>
          <span className="text-zinc-900 font-semibold">{nDisplay}</span>
        </label>
        <input
          type="range"
          min={100}
          max={100000}
          step={100}
          value={state.n}
          onChange={e => set("n", Number(e.target.value))}
          className="mt-2 w-full accent-zinc-900"
        />
        <div className="mt-1 flex justify-between font-mono text-[9px] text-zinc-400">
          <span>100</span>
          <span>100k</span>
        </div>
      </div>

      {/* Access pattern */}
      <div className="border border-zinc-200 bg-white p-4">
        <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Access Pattern
        </label>
        <div className="mt-2 space-y-1">
          {(["uniform", "sequential", "skewed"] as AccessPattern[]).map(p => (
            <label key={p} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="pattern"
                value={p}
                checked={state.pattern === p}
                onChange={() => set("pattern", p)}
                className="accent-zinc-900"
              />
              <span className="font-mono text-xs capitalize text-zinc-700">
                {p === "skewed" ? "Skewed / Zipf" : p}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Operation */}
      <div className="border border-zinc-200 bg-white p-4">
        <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Operation
        </label>
        <div className="mt-2 space-y-1">
          {(["insert", "lookup", "delete"] as Operation[]).map(op => (
            <label key={op} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="operation"
                value={op}
                checked={state.operation === op}
                onChange={() => set("operation", op)}
                className="accent-zinc-900"
              />
              <span className="font-mono text-xs capitalize text-zinc-700">{op}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Trees */}
      <div className="border border-zinc-200 bg-white p-4">
        <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Trees
        </label>
        <div className="mt-2 space-y-1.5">
          {ALL_TREES.map(t => (
            <label key={t} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={state.enabledTrees[t]}
                onChange={() => toggleTree(t)}
                className="accent-zinc-900"
              />
              <span className="flex items-center gap-1.5 font-mono text-xs text-zinc-700">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: TREE_COLORS[t] }}
                />
                {TREE_LABELS[t]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Custom data */}
      <div className="border border-zinc-200 bg-white p-4">
        <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Custom Data (optional)
        </label>
        <p className="mt-1 font-mono text-[9px] text-zinc-400">
          Space/comma-separated numbers. Overrides access pattern.
        </p>
        <textarea
          value={state.customDataRaw}
          onChange={e => set("customDataRaw", e.target.value)}
          placeholder="e.g. 5 3 8 1 9 2 7 4 6"
          rows={3}
          className="mt-2 w-full resize-none border border-zinc-200 bg-zinc-50 px-2 py-1.5 font-mono text-[11px] text-zinc-800 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none"
        />
        {state.customDataRaw.trim() && (
          <p className="mt-1 font-mono text-[9px] text-zinc-500">
            {state.customDataRaw.split(/[\s,;]+/).filter(s => s && !isNaN(Number(s))).length} numbers detected
          </p>
        )}
      </div>

      {/* Run button */}
      <button
        onClick={onRun}
        disabled={state.isRunning}
        className="w-full border border-zinc-900 bg-zinc-900 px-4 py-2.5 font-mono text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state.isRunning ? "Running…" : "Run Benchmark"}
      </button>
    </div>
  );
}
