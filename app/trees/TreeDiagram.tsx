"use client";

import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import type { BenchmarkResult, TreeType } from "@/lib/trees/benchmark";
import type { AVLNode } from "@/lib/trees/avl";
import type { RBNode } from "@/lib/trees/redblack";
import type { SplayNode } from "@/lib/trees/splay";
import type { TwoFourNode } from "@/lib/trees/twofour";
import { TREE_COLORS, TREE_LABELS } from "./TreeBenchmarker";
import { downloadSVGAsPNG } from "./chartUtils";

interface TreeDiagramProps {
  benchResult: BenchmarkResult;
  selectedTree: TreeType;
  onSelectTree: (t: TreeType) => void;
  enabledTrees: Record<TreeType, boolean>;
}

const MAX_NODES = 120; // cap for readable diagram

interface LayoutNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  textColor: string;
  shape: "circle" | "rect";
  width?: number;
  height?: number;
  recentlyAccessed?: boolean;
}

interface LayoutEdge {
  x1: number; y1: number;
  x2: number; y2: number;
}

/** Build d3 hierarchy from AVL root */
function avlToHierarchy(root: AVLNode | null): d3.HierarchyNode<AVLNode> | null {
  if (!root) return null;
  return d3.hierarchy(root, n => {
    const children: AVLNode[] = [];
    if (n.left) children.push(n.left);
    if (n.right) children.push(n.right);
    return children.length ? children : null;
  });
}

function rbToHierarchy(root: RBNode, NIL: RBNode): d3.HierarchyNode<RBNode> | null {
  if (root === NIL) return null;
  return d3.hierarchy(root, n => {
    const children: RBNode[] = [];
    if (n.left && n.left !== NIL) children.push(n.left);
    if (n.right && n.right !== NIL) children.push(n.right);
    return children.length ? children : null;
  });
}

function splayToHierarchy(root: SplayNode | null): d3.HierarchyNode<SplayNode> | null {
  if (!root) return null;
  return d3.hierarchy(root, n => {
    const children: SplayNode[] = [];
    if (n.left) children.push(n.left);
    if (n.right) children.push(n.right);
    return children.length ? children : null;
  });
}

function tfToHierarchy(root: TwoFourNode | null): d3.HierarchyNode<TwoFourNode> | null {
  if (!root) return null;
  return d3.hierarchy(root, n => n.children.length ? n.children : null);
}

async function buildLayout(
  result: BenchmarkResult,
  selectedTree: TreeType
): Promise<{ nodes: LayoutNode[]; edges: LayoutEdge[]; tooLarge: boolean }> {
  const { AVLTree } = await import("@/lib/trees/avl");
  const { RedBlackTree } = await import("@/lib/trees/redblack");
  const { SplayTree } = await import("@/lib/trees/splay");
  const { TwoFourTree } = await import("@/lib/trees/twofour");

  const config = result.config;
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];

  let tooLarge = false;

  const levelSep = 56;
  const nodeSep = 8;

  if (selectedTree === "avl") {
    const tree = new AVLTree();
    const keys = generateKeysForConfig(config);
    for (const k of keys) tree.insert(k);

    const totalNodes = tree.size();
    if (totalNodes > MAX_NODES) { tooLarge = true; return { nodes, edges, tooLarge }; }

    const h = avlToHierarchy(tree.root);
    if (!h) return { nodes, edges, tooLarge };
    const layout = d3.tree<AVLNode>().nodeSize([nodeSep * 3, levelSep])(h);
    layout.each(d => {
      nodes.push({
        id: String(d.data.key),
        label: String(d.data.key),
        x: d.x,
        y: d.y,
        color: TREE_COLORS.avl,
        textColor: "#fff",
        shape: "circle",
      });
    });
    layout.links().forEach(l => {
      edges.push({ x1: l.source.x, y1: l.source.y, x2: l.target.x, y2: l.target.y });
    });
  }

  if (selectedTree === "redblack") {
    const tree = new RedBlackTree();
    const keys = generateKeysForConfig(config);
    for (const k of keys) tree.insert(k);

    const totalNodes = tree.size();
    if (totalNodes > MAX_NODES) { tooLarge = true; return { nodes, edges, tooLarge }; }

    const NIL = tree.getNIL();
    const h = rbToHierarchy(tree.root, NIL);
    if (!h) return { nodes, edges, tooLarge };
    const layout = d3.tree<RBNode>().nodeSize([nodeSep * 3, levelSep])(h);
    layout.each(d => {
      nodes.push({
        id: String(d.data.key),
        label: String(d.data.key),
        x: d.x,
        y: d.y,
        color: d.data.color === "RED" ? "#dc2626" : "#18181b",
        textColor: "#fff",
        shape: "circle",
      });
    });
    layout.links().forEach(l => {
      edges.push({ x1: l.source.x, y1: l.source.y, x2: l.target.x, y2: l.target.y });
    });
  }

  if (selectedTree === "splay") {
    const tree = new SplayTree();
    const keys = generateKeysForConfig(config);
    for (const k of keys) tree.insert(k);
    // perform some lookups to establish access pattern
    for (let i = 0; i < Math.min(50, keys.length); i++) {
      tree.search(keys[i % keys.length]);
    }

    const totalNodes = tree.size();
    if (totalNodes > MAX_NODES) { tooLarge = true; return { nodes, edges, tooLarge }; }

    const h = splayToHierarchy(tree.root);
    if (!h) return { nodes, edges, tooLarge };
    const layout = d3.tree<SplayNode>().nodeSize([nodeSep * 3, levelSep])(h);
    const rootKey = tree.root?.key ?? -1;
    layout.each(d => {
      const isRoot = d.data.key === rootKey;
      const isRecent = d.data.recentlyAccessed;
      nodes.push({
        id: String(d.data.key),
        label: String(d.data.key),
        x: d.x,
        y: d.y,
        color: isRoot ? "#15803d" : isRecent ? "#86efac" : TREE_COLORS.splay,
        textColor: "#fff",
        shape: "circle",
        recentlyAccessed: isRecent,
      });
    });
    layout.links().forEach(l => {
      edges.push({ x1: l.source.x, y1: l.source.y, x2: l.target.x, y2: l.target.y });
    });
  }

  if (selectedTree === "twofour") {
    const tree = new TwoFourTree();
    const keys = generateKeysForConfig(config);
    for (const k of keys) tree.insert(k);

    const totalNodes = tree.size();
    if (totalNodes > MAX_NODES) { tooLarge = true; return { nodes, edges, tooLarge }; }

    const h = tfToHierarchy(tree.root);
    if (!h) return { nodes, edges, tooLarge };
    const layout = d3.tree<TwoFourNode>().nodeSize([nodeSep * 6, levelSep])(h);
    layout.each(d => {
      const label = d.data.keys.join(" | ");
      const w = Math.max(40, label.length * 7 + 12);
      nodes.push({
        id: d.data.keys.join(","),
        label,
        x: d.x,
        y: d.y,
        color: TREE_COLORS.twofour,
        textColor: "#fff",
        shape: "rect",
        width: w,
        height: 22,
      });
    });
    layout.links().forEach(l => {
      edges.push({ x1: l.source.x, y1: l.source.y, x2: l.target.x, y2: l.target.y });
    });
  }

  return { nodes, edges, tooLarge };
}

function generateKeysForConfig(config: BenchmarkResult["config"]): number[] {
  if (config.customData && config.customData.length > 0) return config.customData;
  const n = Math.min(config.n, MAX_NODES);
  if (config.pattern === "sequential") return Array.from({ length: n }, (_, i) => i + 1);
  const arr = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function TreeDiagram({ benchResult, selectedTree, onSelectTree, enabledTrees }: TreeDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [layout, setLayout] = React.useState<{ nodes: LayoutNode[]; edges: LayoutEdge[]; tooLarge: boolean } | null>(null);

  useEffect(() => {
    setLayout(null);
    buildLayout(benchResult, selectedTree).then(setLayout);
  }, [benchResult, selectedTree]);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    if (!svg || !layout) return;
    if (layout.tooLarge) return;

    const { nodes, edges } = layout;
    if (nodes.length === 0) return;

    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const pad = 40;
    const W = Math.max(maxX - minX + pad * 2, 400);
    const H = Math.max(maxY - minY + pad * 2, 200);
    const offX = -minX + pad;
    const offY = -minY + pad;

    d3.select(svg).selectAll("*").remove();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("height", String(Math.min(H, 500)));

    const g = d3.select(svg).append("g");

    // Edges
    for (const e of edges) {
      g.append("line")
        .attr("x1", e.x1 + offX)
        .attr("y1", e.y1 + offY)
        .attr("x2", e.x2 + offX)
        .attr("y2", e.y2 + offY)
        .attr("stroke", "#d4d4d8")
        .attr("stroke-width", 1);
    }

    // Nodes
    for (const n of nodes) {
      if (n.shape === "circle") {
        g.append("circle")
          .attr("cx", n.x + offX)
          .attr("cy", n.y + offY)
          .attr("r", 14)
          .attr("fill", n.color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5);

        g.append("text")
          .attr("x", n.x + offX)
          .attr("y", n.y + offY + 4)
          .attr("text-anchor", "middle")
          .style("font-family", "monospace")
          .style("font-size", "9px")
          .attr("fill", n.textColor)
          .text(n.label.length > 5 ? n.label.slice(0, 4) + "…" : n.label);
      } else {
        const rw = (n.width ?? 50) / 2;
        const rh = (n.height ?? 22) / 2;
        g.append("rect")
          .attr("x", n.x + offX - rw)
          .attr("y", n.y + offY - rh)
          .attr("width", n.width ?? 50)
          .attr("height", n.height ?? 22)
          .attr("rx", 3)
          .attr("fill", n.color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5);

        g.append("text")
          .attr("x", n.x + offX)
          .attr("y", n.y + offY + 4)
          .attr("text-anchor", "middle")
          .style("font-family", "monospace")
          .style("font-size", "9px")
          .attr("fill", n.textColor)
          .text(n.label);
      }
    }

    // Zoom & pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on("zoom", (event) => g.attr("transform", event.transform));
    d3.select(svg).call(zoom as d3.ZoomBehavior<SVGSVGElement, unknown>);
  }, [layout]);

  useEffect(() => {
    draw();
  }, [draw]);

  const enabledList = (Object.keys(enabledTrees) as TreeType[]).filter(t => enabledTrees[t]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {enabledList.map(t => (
            <button
              key={t}
              onClick={() => onSelectTree(t)}
              className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                selectedTree === t
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-500"
              }`}
            >
              {TREE_LABELS[t]}
            </button>
          ))}
        </div>
        <p className="font-mono text-[9px] text-zinc-400">scroll to zoom · drag to pan</p>
        <div className="ml-auto">
          <button
            onClick={() => {
              if (svgRef.current) downloadSVGAsPNG(svgRef.current, `tree-diagram-${selectedTree}.png`);
            }}
            className="border border-zinc-300 bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600 hover:border-zinc-500 hover:text-zinc-900"
          >
            Export PNG
          </button>
        </div>
      </div>

      {!layout && (
        <div className="flex h-64 items-center justify-center">
          <p className="font-mono text-xs text-zinc-400">Building tree…</p>
        </div>
      )}

      {layout?.tooLarge && (
        <div className="flex h-64 items-center justify-center border border-dashed border-zinc-200">
          <p className="font-mono text-sm text-zinc-400">
            Tree too large to display ({benchResult.config.n} keys). Use N ≤ {MAX_NODES} for diagram.
          </p>
        </div>
      )}

      {layout && !layout.tooLarge && layout.nodes.length === 0 && (
        <div className="flex h-64 items-center justify-center border border-dashed border-zinc-200">
          <p className="font-mono text-sm text-zinc-400">Empty tree.</p>
        </div>
      )}

      {layout && !layout.tooLarge && layout.nodes.length > 0 && (
        <>
          {selectedTree === "redblack" && (
            <div className="mb-2 flex gap-3">
              <span className="flex items-center gap-1 font-mono text-[9px] text-zinc-500">
                <span className="inline-block h-3 w-3 rounded-full bg-[#dc2626]" /> RED node
              </span>
              <span className="flex items-center gap-1 font-mono text-[9px] text-zinc-500">
                <span className="inline-block h-3 w-3 rounded-full bg-[#18181b]" /> BLACK node
              </span>
            </div>
          )}
          {selectedTree === "splay" && (
            <div className="mb-2 flex gap-3">
              <span className="flex items-center gap-1 font-mono text-[9px] text-zinc-500">
                <span className="inline-block h-3 w-3 rounded-full bg-[#15803d]" /> Root
              </span>
              <span className="flex items-center gap-1 font-mono text-[9px] text-zinc-500">
                <span className="inline-block h-3 w-3 rounded-full bg-[#86efac]" /> Recently accessed
              </span>
            </div>
          )}
          <div className="overflow-hidden border border-zinc-100 bg-zinc-50">
            <svg ref={svgRef} className="w-full" style={{ minHeight: 200, maxHeight: 500 }} />
          </div>
        </>
      )}
    </div>
  );
}
