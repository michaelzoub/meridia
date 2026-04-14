"use client";

import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import type { TreeResult } from "@/lib/trees/benchmark";
import { TREE_COLORS, TREE_LABELS } from "./TreeBenchmarker";
import { downloadSVGAsPNG } from "./chartUtils";

interface BarChartProps {
  results: TreeResult[];
}

export function BarChart({ results }: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    if (!svg || results.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const W = svg.clientWidth || 600;
    const H = 340;
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    d3.select(svg).selectAll("*").remove();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("height", String(H));

    const g = d3.select(svg)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(results.map(r => TREE_LABELS[r.tree]))
      .range([0, w])
      .padding(0.35);

    const maxH = d3.max(results, r => r.finalHeight) ?? 1;
    const y = d3.scaleLinear().domain([0, maxH * 1.15]).range([h, 0]);

    // Gridlines
    g.append("g")
      .attr("class", "grid")
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
      .call(d3.axisBottom(x))
      .call(gg => {
        gg.select(".domain").attr("stroke", "#d4d4d8");
        gg.selectAll("text")
          .style("font-family", "monospace")
          .style("font-size", "11px")
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
          .style("font-size", "11px")
          .attr("fill", "#52525b");
        gg.selectAll("line").attr("stroke", "#d4d4d8");
      });

    // Y label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -h / 2)
      .attr("text-anchor", "middle")
      .style("font-family", "monospace")
      .style("font-size", "10px")
      .attr("fill", "#71717a")
      .text("TREE HEIGHT");

    // Bars
    g.selectAll(".bar")
      .data(results)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(TREE_LABELS[d.tree])!)
      .attr("y", d => y(d.finalHeight))
      .attr("width", x.bandwidth())
      .attr("height", d => h - y(d.finalHeight))
      .attr("fill", d => TREE_COLORS[d.tree])
      .attr("opacity", 0.88);

    // Value labels
    g.selectAll(".bar-label")
      .data(results)
      .join("text")
      .attr("class", "bar-label")
      .attr("x", d => x(TREE_LABELS[d.tree])! + x.bandwidth() / 2)
      .attr("y", d => y(d.finalHeight) - 6)
      .attr("text-anchor", "middle")
      .style("font-family", "monospace")
      .style("font-size", "11px")
      .attr("fill", "#18181b")
      .text(d => d.finalHeight);
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
          Final tree height comparison
        </p>
        <button
          onClick={() => {
            if (svgRef.current) downloadSVGAsPNG(svgRef.current, "tree-height-comparison.png");
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
