"use client";

import { useEffect, useRef } from "react";

const DEFAULT_ACCENT: [number, number, number] = [103, 232, 249];

export type PixelMountainProps = {
  /** RGB stroke/fill accent (default: cyan). Use warm sand/rust on Meridia / variation1. */
  accentRgb?: [number, number, number];
};

export default function PixelMountain({ accentRgb = DEFAULT_ACCENT }: PixelMountainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const startTime = performance.now();
    const [r, g, b] = accentRgb;

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    /**
     * Resolve a distance along the two-segment mountain path
     * (bottomLeft → peak → bottomRight) into canvas {x, y}.
     */
    function pointOnPath(
      dist: number,
      p0: { x: number; y: number },
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      legA: number,
      total: number,
    ) {
      // Clamp into [0, total)
      const d = ((dist % total) + total) % total;
      if (d <= legA) {
        const f = d / legA;
        return { x: p0.x + (p1.x - p0.x) * f, y: p0.y + (p1.y - p0.y) * f };
      }
      const f = (d - legA) / (total - legA);
      return { x: p1.x + (p2.x - p1.x) * f, y: p1.y + (p2.y - p1.y) * f };
    }

    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      const t = (now - startTime) / 1000;

      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      ctx.lineCap  = "round";
      ctx.lineJoin = "round";

      const baseY = ch * 1.01;
      const peakX = cw * 0.5;
      const numLayers = 7;

      // ── Static nested mountain outlines ─────────────────────────────
      for (let i = 0; i < numLayers; i++) {
        const frac  = (i + 1) / numLayers;
        const halfW = cw * 0.52 * frac;
        const peakY = baseY - ch * 0.60 * frac;
        const opacity = 0.10 + frac * 0.16;

        if (i === numLayers - 1) {
          ctx.beginPath();
          ctx.moveTo(peakX - halfW, baseY);
          ctx.lineTo(peakX, peakY);
          ctx.lineTo(peakX + halfW, baseY);
          ctx.closePath();
          ctx.fillStyle = `rgba(${r},${g},${b},0.07)`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.moveTo(peakX - halfW, baseY);
        ctx.lineTo(peakX, peakY);
        ctx.lineTo(peakX + halfW, baseY);
        ctx.strokeStyle = `rgba(${r},${g},${b},${opacity.toFixed(3)})`;
        ctx.lineWidth   = (0.6 + frac * 0.8) * dpr;
        ctx.stroke();
      }

      // ── Border-beam along the outermost mountain outline ────────────
      // Path: bottomLeft → peak → bottomRight
      const halfW = cw * 0.52;
      const peakY = baseY - ch * 0.60;

      const p0 = { x: peakX - halfW, y: baseY };
      const p1 = { x: peakX,         y: peakY };
      const p2 = { x: peakX + halfW, y: baseY };

      const legA  = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const legB  = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const total = legA + legB;

      // Beam: head travels at `total * 0.28` units/s, trail length = 22% of path
      const trailLen  = total * 0.22;
      const headDist  = (t * total * 0.28) % total;
      const steps     = 32;

      ctx.lineWidth = 1.8 * dpr;

      for (let i = 0; i < steps; i++) {
        const frac0 = i / steps;
        const frac1 = (i + 1) / steps;

        // Distance of this segment's start/end from the head (tail = 0, head = 1)
        const d0 = headDist - trailLen * (1 - frac0);
        const d1 = headDist - trailLen * (1 - frac1);

        const pt0 = pointOnPath(d0, p0, p1, p2, legA, total);
        const pt1 = pointOnPath(d1, p0, p1, p2, legA, total);

        // Alpha: 0 at tail, peaks at head
        const alpha = Math.pow(frac1, 2) * 0.65;

        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(pt0.x, pt0.y);
        ctx.lineTo(pt1.x, pt1.y);
        ctx.stroke();
      }

      // Bright leading dot at beam head
      const head = pointOnPath(headDist, p0, p1, p2, legA, total);
      ctx.beginPath();
      ctx.arc(head.x, head.y, 2.2 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},0.75)`;
      ctx.fill();
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [accentRgb]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} aria-hidden className="block h-full w-full" />
    </div>
  );
}
