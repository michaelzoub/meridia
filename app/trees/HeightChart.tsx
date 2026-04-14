"use client";

import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import type { TreeResult, HeightSample, TreeType } from "@/lib/trees/benchmark";
import { TREE_COLORS, TREE_LABELS } from "./TreeBenchmarker";
import { downloadSVGAsPNG } from "./chartUtils";

interface HeightChartProps {
  results: TreeResult[];
}

export function HeightChart({ results }: HeightChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    if (!svg || results.length === 0) return;

    const margin = { top: 20, right: 110, bottom: 50, left: 55 };
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

    const allSamples: (HeightSample & { tree: TreeType })[] = results.flatMap(r =>
      r.heightSamples.map(s => ({ ...s, tree: r.tree }))
    );

    if (allSamples.length === 0) {
      g.append("text")
        .attr("x", w / 2)
        .attr("y", h / 2)
        .attr("text-anchor", "middle")
        .style("font-family", "monospace")
        .style("font-size", "12px")
        .attr("fill", "#a1a1aa")
        .text("No height samples (increase N)");
      return;
    }

    const maxBatch = d3.max(allSamples, d => d.batch) ?? 1;
    const maxHeight = d3.max(allSamples, d => d.height) ?? 1;

    const x = d3.scaleLinear().domain([1, maxBatch]).range([0, w]);
    const y = d3.scaleLinear().domain([0, maxHeight * 1.1]).range([h, 0]);

    // Gridlines
    g.append("g")
      .call(d3.axisLeft(y).tickSize(-w).ticks(5).tickFormat(() => ""))
      .call(gg => {
        gg.select(".domain").remove();
        gg.selectAll("line").attr("stroke", "#e4e4e7").attr("stroke-dasharray", "3,3");
      });

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(5))
      .call(gg => {
        gg.select(".domain").attr("stroke", "#d4d4d8");
        gg.selectAll("text").style("font-family", "monospace").style("font-size", "10px").attr("fill", "#52525b");
        gg.selectAll("line").attr("stroke", "#d4d4d8");
      });

    // Y axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .call(gg => {
        gg.select(".domain").attr("stroke", "#d4d4d8");
        gg.selectAll("text").style("font-family", "monospace").style("font-size", "10px").attr("fill", "#52525b");
        gg.selectAll("line").attr("stroke", "#d4d4d8");
      });

    g.append("text")
      .attr("x", w / 2).attr("y", h + 40)
      .attr("text-anchor", "middle")
      .style("font-family", "monospace").style("font-size", "10px")
      .attr("fill", "#71717a")
      .text("Batch (×1000 ops)");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -46).attr("x", -h / 2)
      .attr("text-anchor", "middle")
      .style("font-family", "monospace").style("font-size", "10px")
      .attr("fill", "#71717a")
      .text("TREE HEIGHT");

    const line = d3.line<HeightSample>()
      .x(d => x(d.batch))
      .y(d => y(d.height))
      .curve(d3.curveMonotoneX);

    for (const r of results) {
      if (r.heightSamples.length < 2) continue;
      g.append("path")
        .datum(r.heightSamples)
        .attr("fill", "none")
        .attr("stroke", TREE_COLORS[r.tree])
        .attr("stroke-width", 2)
        .attr("d", line);
    }

    // Legend
    const legend = g.append("g").attr("transform", `translate(${w + 12}, 0)`);
    results.forEach((r, i) => {
      const row = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
      row.append("line")
        .attr("x1", 0).attr("x2", 18).attr("y1", 6).attr("y2", 6)
        .attr("stroke", TREE_COLORS[r.tree]).attr("stroke-width", 2);
      row.append("text")
        .attr("x", 22).attr("y", 10)
        .style("font-family", "monospace").style("font-size", "10px")
        .attr("fill", "#3f3f46")
        .text(TREE_LABELS[r.tree]);
    });
  }, [results]);

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
          Height evolution per 1k-op batch
        </p>
        <button
          onClick={() => {
            if (svgRef.current) downloadSVGAsPNG(svgRef.current, "height-over-time.png");
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
