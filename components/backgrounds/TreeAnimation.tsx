"use client";

import { useEffect, useRef } from "react";

// Fixed tree topology — root at top, leaves at bottom (upside-down real-tree / decision-tree)
const NODES = [
  { id: 0, parent: -1, depth: 0, rx: 0.50, ry: 0.10 },  // root
  { id: 1, parent:  0, depth: 1, rx: 0.28, ry: 0.50 },  // left branch
  { id: 2, parent:  0, depth: 1, rx: 0.72, ry: 0.50 },  // right branch
  { id: 3, parent:  1, depth: 2, rx: 0.12, ry: 0.88 },  // leaf LL
  { id: 4, parent:  1, depth: 2, rx: 0.44, ry: 0.88 },  // leaf LR
  { id: 5, parent:  2, depth: 2, rx: 0.56, ry: 0.88 },  // leaf RL
  { id: 6, parent:  2, depth: 2, rx: 0.88, ry: 0.88 },  // leaf RR
];
const EDGES = NODES.filter((n) => n.parent >= 0).map((n) => [n.parent, n.id] as [number, number]);

// Pulse travels from depth 0 → 1 → 2 over DEPTH_DELAY * MAX_DEPTH seconds
const CYCLE_S     = 3.2;   // seconds for one full root-to-leaf cycle
const DEPTH_DELAY = 0.65;  // seconds between each depth level lighting up
const PULSE_DUR   = 0.55;  // seconds each node stays lit

export default function TreeAnimation({
  color   = "#111111",
  opacity = 0.12,
}: { color?: string; opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cv = canvas;
    const cx = ctx;
    let rafId: number;

    function resize() {
      cv.width  = cv.offsetWidth;
      cv.height = cv.offsetHeight;
    }

    function tick(time: number) {
      rafId = requestAnimationFrame(tick);
      const t = (time / 1000) % CYCLE_S;
      const w = cv.width;
      const h = cv.height;
      cx.clearRect(0, 0, w, h);

      // Absolute pixel positions
      const pos = NODES.map((n) => ({ x: n.rx * w, y: n.ry * h }));

      // ── Edges ──────────────────────────────────────────────────────────────
      cx.strokeStyle = color;
      cx.lineWidth   = 0.9;
      cx.lineCap     = "round";
      for (const [a, b] of EDGES) {
        cx.globalAlpha = opacity * 0.55;
        cx.beginPath();
        cx.moveTo(pos[a].x, pos[a].y);
        cx.lineTo(pos[b].x, pos[b].y);
        cx.stroke();
      }

      // ── Nodes with propagating pulse ────────────────────────────────────────
      cx.fillStyle = color;
      for (let i = 0; i < NODES.length; i++) {
        const { depth } = NODES[i];
        const pulseT = t - depth * DEPTH_DELAY;

        // Ramp up in 0.1 s, ramp down over the remaining pulse duration
        let pulse = 0;
        if (pulseT > 0 && pulseT < PULSE_DUR) {
          const rampUp = 0.10;
          pulse = pulseT < rampUp
            ? pulseT / rampUp
            : 1 - (pulseT - rampUp) / (PULSE_DUR - rampUp);
          pulse = Math.max(0, pulse);
        }

        const r = 2.2 + pulse * 1.2;
        cx.globalAlpha = opacity * (0.45 + pulse * 0.55);
        cx.beginPath();
        cx.arc(pos[i].x, pos[i].y, r, 0, Math.PI * 2);
        cx.fill();
      }

      cx.globalAlpha = 1;
    }

    resize();
    rafId = requestAnimationFrame(tick);

    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, [color, opacity]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
