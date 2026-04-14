"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import type { BenchmarkResult } from "@/lib/trees/benchmark";
import { downloadCanvasAsPNG } from "./chartUtils";

interface SplayHeatmapProps {
  benchResult: BenchmarkResult;
}

const MAX_DISPLAY = 200;

export function SplayHeatmap({ benchResult }: SplayHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { splayAccessCounts } = benchResult;

    // If no splay data from benchmark, rebuild
    let accessMap = new Map<number, number>(splayAccessCounts);

    if (accessMap.size === 0) {
      // Run splay with lookups to populate access counts
      const { SplayTree } = await import("@/lib/trees/splay");
      const config = benchResult.config;
      const baseN = Math.min(config.n, 500);
      const keys = config.customData && config.customData.length > 0
        ? config.customData.slice(0, baseN)
        : Array.from({ length: baseN }, (_, i) => i + 1);

      const shuffled = [...keys];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const tree = new SplayTree();
      for (const k of shuffled) tree.insert(k);

      // Simulate lookup access pattern
      const n = Math.min(config.n, 3000);
      const hotKeys = shuffled.slice(0, Math.max(1, Math.floor(shuffled.length * 0.2)));
      for (let i = 0; i < n; i++) {
        const k = config.pattern === "skewed"
          ? hotKeys[Math.floor(Math.random() * hotKeys.length)]
          : shuffled[Math.floor(Math.random() * shuffled.length)];
        tree.search(k);
      }

      // Collect counts from all nodes
      const stack: (import("@/lib/trees/splay").SplayNode | null)[] = [tree.root];
      while (stack.length) {
        const node = stack.pop();
        if (!node) continue;
        if (node.accessCount > 0) accessMap.set(node.key, node.accessCount);
        stack.push(node.left, node.right);
      }
    }

    if (accessMap.size === 0) {
      setIsEmpty(true);
      return;
    }
    setIsEmpty(false);


    // Sort by key, take top MAX_DISPLAY by access count
    let entries = Array.from(accessMap.entries());
    if (entries.length > MAX_DISPLAY) {
      entries = entries.sort((a, b) => b[1] - a[1]).slice(0, MAX_DISPLAY);
    }
    entries.sort((a, b) => a[0] - b[0]);

    const cellSize = 24;
    const cols = Math.min(entries.length, 20);
    const rows = Math.ceil(entries.length / cols);
    const labelH = 30;
    const W = cols * cellSize;
    const H = rows * cellSize + labelH;

    canvas.width = W;
    canvas.height = H;
    canvas.style.width = "100%";
    canvas.style.height = "auto";

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, W, H);

    const maxCount = Math.max(...entries.map(e => e[1]));
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, maxCount]);

    entries.forEach(([key, count], idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = col * cellSize;
      const y = row * cellSize + labelH;

      ctx.fillStyle = colorScale(count);
      ctx.fillRect(x, y, cellSize - 1, cellSize - 1);

      // Key label for small sizes
      if (cellSize >= 22) {
        ctx.fillStyle = count > maxCount * 0.6 ? "#fff" : "#18181b";
        ctx.font = "7px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = String(key).length > 4 ? String(key).slice(0, 3) + "…" : String(key);
        ctx.fillText(label, x + cellSize / 2 - 0.5, y + cellSize / 2 - 0.5);
      }
    });

    // Header
    ctx.fillStyle = "#52525b";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`Splay Access Heatmap — top ${entries.length} keys`, 4, 14);

    // Color bar
    const barW = Math.min(W - 8, 160);
    const barH = 8;
    const barX = W - barW - 4;
    const barY = 4;
    for (let i = 0; i < barW; i++) {
      ctx.fillStyle = colorScale((i / barW) * maxCount);
      ctx.fillRect(barX + i, barY, 1, barH);
    }
    ctx.strokeStyle = "#d4d4d8";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.fillStyle = "#71717a";
    ctx.font = "8px monospace";
    ctx.textAlign = "left";
    ctx.fillText("0", barX, barY + barH + 8);
    ctx.textAlign = "right";
    ctx.fillText(String(maxCount), barX + barW, barY + barH + 8);
  }, [benchResult]);

  useEffect(() => {
    draw();
  }, [draw]);

  const hasSplay = benchResult.config.trees.includes("splay");

  if (!hasSplay) {
    return (
      <div className="flex h-64 items-center justify-center border border-dashed border-zinc-200">
        <p className="font-mono text-sm text-zinc-400">Enable Splay tree to see heatmap.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            Splay access frequency heatmap
          </p>
          <p className="mt-0.5 font-mono text-[9px] text-zinc-400">
            Color intensity = access count. Hot keys migrate toward root.
          </p>
        </div>
        <button
          onClick={() => {
            if (canvasRef.current) downloadCanvasAsPNG(canvasRef.current, "splay-heatmap.png");
          }}
          className="border border-zinc-300 bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600 hover:border-zinc-500 hover:text-zinc-900"
        >
          Export PNG
        </button>
      </div>

      {isEmpty && (
        <div className="flex h-48 items-center justify-center border border-dashed border-zinc-200">
          <p className="font-mono text-sm text-zinc-400">
            Run with lookup operation to populate heatmap.
          </p>
        </div>
      )}

      <canvas ref={canvasRef} className="w-full" />
    </div>
  );
}
