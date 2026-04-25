"use client";

import { useEffect, useRef } from "react";

// Pre-defined network topology — a few hub nodes + leaves
const N = 10;
const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 7],
  [1, 2], [1, 4], [1, 5],
  [2, 6], [2, 8],
  [3, 9], [5, 9], [7, 8],
];
// Node degree for hub sizing
const DEGREE = new Array(N).fill(0);
for (const [a, b] of EDGES) { DEGREE[a]++; DEGREE[b]++; }

export default function OpenNetworkAnimation({
  color = "#111111",
  opacity = 0.13,
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

    interface Node { x: number; y: number; vx: number; vy: number; }
    let nodes: Node[] = [];

    function init() {
      const w = cv.width;
      const h = cv.height;
      nodes = Array.from({ length: N }, () => ({
        x: w * 0.15 + Math.random() * w * 0.7,
        y: h * 0.15 + Math.random() * h * 0.7,
        vx: 0,
        vy: 0,
      }));
    }

    function resize() {
      cv.width = cv.offsetWidth;
      cv.height = cv.offsetHeight;
      init();
    }

    // Force-directed physics parameters
    const K_REP  = 700;   // Coulomb repulsion strength
    const K_SPR  = 0.025; // spring attraction along edges
    const REST   = 52;    // spring rest length (px)
    const K_GRA  = 0.012; // gravity towards canvas center
    const DAMP   = 0.86;  // velocity damping
    const NOISE  = 0.06;  // small random perturbation to keep it alive

    function step() {
      const w = cv.width;
      const h = cv.height;
      const cx0 = w / 2;
      const cy0 = h / 2;
      const fx = new Float32Array(N);
      const fy = new Float32Array(N);

      // Coulomb repulsion between all pairs
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const d2 = dx * dx + dy * dy + 1;
          const d  = Math.sqrt(d2);
          const f  = K_REP / d2;
          fx[i] -= f * dx / d;  fy[i] -= f * dy / d;
          fx[j] += f * dx / d;  fy[j] += f * dy / d;
        }
      }

      // Spring forces along edges
      for (const [a, b] of EDGES) {
        const dx = nodes[b].x - nodes[a].x;
        const dy = nodes[b].y - nodes[a].y;
        const d  = Math.sqrt(dx * dx + dy * dy) + 0.001;
        const f  = K_SPR * (d - REST);
        fx[a] += f * dx / d;  fy[a] += f * dy / d;
        fx[b] -= f * dx / d;  fy[b] -= f * dy / d;
      }

      // Center gravity
      for (let i = 0; i < N; i++) {
        fx[i] += K_GRA * (cx0 - nodes[i].x);
        fy[i] += K_GRA * (cy0 - nodes[i].y);
      }

      // Integrate + damping + clamp
      for (let i = 0; i < N; i++) {
        nodes[i].vx = (nodes[i].vx + fx[i]) * DAMP + (Math.random() - 0.5) * NOISE;
        nodes[i].vy = (nodes[i].vy + fy[i]) * DAMP + (Math.random() - 0.5) * NOISE;
        nodes[i].x  = Math.max(8, Math.min(w - 8, nodes[i].x + nodes[i].vx));
        nodes[i].y  = Math.max(8, Math.min(h - 8, nodes[i].y + nodes[i].vy));
      }
    }

    function draw() {
      cx.clearRect(0, 0, cv.width, cv.height);

      // Edges
      cx.strokeStyle = color;
      cx.lineWidth = 0.9;
      for (const [a, b] of EDGES) {
        cx.globalAlpha = opacity * 0.45;
        cx.beginPath();
        cx.moveTo(nodes[a].x, nodes[a].y);
        cx.lineTo(nodes[b].x, nodes[b].y);
        cx.stroke();
      }

      // Nodes — hubs slightly larger
      cx.fillStyle = color;
      for (let i = 0; i < N; i++) {
        const r = DEGREE[i] >= 3 ? 3.2 : 2;
        cx.globalAlpha = opacity;
        cx.beginPath();
        cx.arc(nodes[i].x, nodes[i].y, r, 0, Math.PI * 2);
        cx.fill();
      }

      cx.globalAlpha = 1;
    }

    function loop() {
      rafId = requestAnimationFrame(loop);
      step();
      draw();
    }

    resize();
    loop();

    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, [color, opacity]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
