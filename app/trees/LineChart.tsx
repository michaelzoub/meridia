"use client";

import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import type { SweepPoint, TreeType } from "@/lib/trees/benchmark";
import { TREE_COLORS, TREE_LABELS } from "./TreeBenchmarker";
import { downloadSVGAsPNG } from "./chartUtils";

interface LineChartProps {
  points: SweepPoint[];
  enabledTrees: Record<TreeType, boolean>;
}

export function LineChart({ points, enabledTrees }: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    if (!svg || points.length === 0) return;

    const margin = { top: 20, right: 110, bottom: 50, left: 60 };
    const W = svg.clientWidth || 600;
    const H = 360;
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    d3.select(svg).selectAll("*").remove();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("height", String(H));

    const g = d3.select(svg)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const trees = (Object.keys(enabledTrees) as TreeType[]).filter(t => enabledTrees[t]);

    const byTree: Map<TreeType, SweepPoint[]> = new Map();
    for (const t of trees) byTree.set(t, points.filter(p => p.tree === t));

    const allN = Array.from(new Set(points.map(p => p.n))).sort((a, b) => a - b);
    const allOps = points.map(p => p.opsPerMs).filter(v => isFinite(v) && v > 0);

    const x = d3.scaleLog()
      .domain([d3.min(allN) ?? 100, d3.max(allN) ?? 100000])
      .range([0, w]);

    const y = d3.scaleLinear()
      .domain([0, (d3.max(allOps) ?? 1) * 1.1])
      .range([h, 0]);

    // Gridlines
    g.append("g")
      .call(
        d3.axisLeft(y)
          .tickSize(-w)
          .ticks(5)
          .tickFormat(() => "")
      )
      .call(gg => {
        gg.select(".domain").remove();
        gg.selectAll("line").attr("stroke", "#e4e4e7").attr("stroke-dasharray", "3,3");
      });

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(
        d3.axisBottom(x)
          .ticks(5, (v: d3.NumberValue) => {
            const n = Number(v);
            return n >= 1000 ? `${n / 1000}k` : String(n);
          })
      )
      .call(gg => {
        gg.select(".domain").attr("stroke", "#d4d4d8");
        gg.selectAll("text")
          .style("font-family", "monospace")
          .style("font-size", "10px")
          .attr("fill", "#52525b");
        gg.selectAll("line").attr("stroke", "#d4d4d8");
      });

    // Y axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .call(gg => {
        gg.select(".domain").attr("stroke", "#d4d4d8");
        gg.selectAll("text")
          .style("font-family", "monospace")
          .style("font-size", "10px")
          .attr("fill", "#52525b");
        gg.selectAll("line").attr("stroke", "#d4d4d8");
      });

    // Axis labels
    g.append("text")
      .attr("x", w / 2)
      .attr("y", h + 40)
      .attr("text-anchor", "middle")
      .style("font-family", "monospace")
      .style("font-size", "10px")
      .attr("fill", "#71717a")
      .text("N (log scale)");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -52)
      .attr("x", -h / 2)
      .attr("text-anchor", "middle")
      .style("font-family", "monospace")
      .style("font-size", "10px")
      .attr("fill", "#71717a")
      .text("OPS / ms");

    // Lines
    const line = d3.line<SweepPoint>()
      .x(d => x(d.n))
      .y(d => y(d.opsPerMs))
      .curve(d3.curveMonotoneX);

    for (const t of trees) {
      const tPoints = (byTree.get(t) ?? []).filter(p => p.opsPerMs > 0);
      if (tPoints.length < 2) continue;

      g.append("path")
        .datum(tPoints)
        .attr("fill", "none")
        .attr("stroke", TREE_COLORS[t])
        .attr("stroke-width", 2)
        .attr("d", line);

      // Dots
      g.selectAll(`.dot-${t}`)
        .data(tPoints)
        .join("circle")
        .attr("class", `dot-${t}`)
        .attr("cx", d => x(d.n))
        .attr("cy", d => y(d.opsPerMs))
        .attr("r", 3)
        .attr("fill", TREE_COLORS[t]);
    }

    // Legend
    const legend = g.append("g").attr("transform", `translate(${w + 12}, 0)`);
    trees.forEach((t, i) => {
      const row = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
      row.append("line")
        .attr("x1", 0).attr("x2", 18)
        .attr("y1", 6).attr("y2", 6)
        .attr("stroke", TREE_COLORS[t])
        .attr("stroke-width", 2);
      row.append("text")
        .attr("x", 22)
        .attr("y", 10)
        .style("font-family", "monospace")
        .style("font-size", "10px")
        .attr("fill", "#3f3f46")
        .text(TREE_LABELS[t]);
    });
  }, [points, enabledTrees]);

  useEffect(() => {
    draw();
    const observer = new ResizeObserver(draw);
    if (svgRef.current) observer.observe(svgRef.current.parentElement!);
    return () => observer.disconnect();
  }, [draw]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Throughput (ops/ms) vs N — log scale
        </p>
        <button
          onClick={() => {
            if (svgRef.current) downloadSVGAsPNG(svgRef.current, "ops-vs-n.png");
          }}
          className="border border-zinc-300 bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600 hover:border-zinc-500 hover:text-zinc-900"
        >
          Export PNG
        </button>
      </div>
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}
