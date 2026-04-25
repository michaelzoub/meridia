"use client";

import { useEffect, useRef } from "react";

interface Props {
  color?: string;
  opacity?: number;
}

export default function LoupeAnimation({ color = "#111111", opacity = 0.1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cv = canvas;
    const cx = ctx;
    let rafId: number;
    let t = 0;
    let lastTime = -1;

    // Smooth loupe path — normalised 0..1 coordinates
    const waypoints = [
      { x: 0.28, y: 0.35 },
      { x: 0.58, y: 0.22 },
      { x: 0.68, y: 0.58 },
      { x: 0.35, y: 0.68 },
    ];

    function catmull(p0: number, p1: number, p2: number, p3: number, u: number) {
      return 0.5 * (
        2 * p1 +
        (-p0 + p2) * u +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u +
        (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u
      );
    }

    function getPos(tNorm: number) {
      const len = waypoints.length;
      const scaled = tNorm * len;
      const i  = Math.floor(scaled) % len;
      const u  = scaled - Math.floor(scaled);
      const p0 = waypoints[(i - 1 + len) % len];
      const p1 = waypoints[i % len];
      const p2 = waypoints[(i + 1) % len];
      const p3 = waypoints[(i + 2) % len];
      return {
        x: catmull(p0.x, p1.x, p2.x, p3.x, u),
        y: catmull(p0.y, p1.y, p2.y, p3.y, u),
      };
    }

    // Draw a magnifying glass matching the reference — thick ring + stubby handle
    function drawLoupe(px: number, py: number, R: number) {
      const ringThick  = R * 0.42;          // very thick ring
      const handleLen  = R * 0.82;
      const handleW    = R * 0.36;
      const angle      = Math.PI * 0.8;    // bottom-right (~144°)

      cx.fillStyle   = color;
      cx.strokeStyle = color;
      cx.lineCap     = "round";
      cx.globalAlpha = opacity;

      // Ring — thick stroke on a circle whose radius is mid-way through the thickness
      cx.lineWidth = ringThick;
      cx.beginPath();
      cx.arc(px, py, R - ringThick / 2, 0, Math.PI * 2);
      cx.stroke();

      // Handle — rounded thick line starting at ring edge
      const hx0 = px + Math.cos(angle) * (R - ringThick * 0.05);
      const hy0 = py + Math.sin(angle) * (R - ringThick * 0.05);
      const hx1 = hx0 + Math.cos(angle) * handleLen;
      const hy1 = hy0 + Math.sin(angle) * handleLen;
      cx.lineWidth = handleW;
      cx.beginPath();
      cx.moveTo(hx0, hy0);
      cx.lineTo(hx1, hy1);
      cx.stroke();
    }

    function resize() {
      cv.width  = cv.offsetWidth;
      cv.height = cv.offsetHeight;
    }

    const PERIOD = 22000; // ms per full loop

    function tick(time: number) {
      rafId = requestAnimationFrame(tick);
      if (lastTime < 0) { lastTime = time; return; }
      const dt = Math.min(time - lastTime, 100); // clamp to avoid jumps after tab switch
      lastTime = time;
      t = (t + dt / PERIOD) % 1;

      const w = cv.width;
      const h = cv.height;
      cx.clearRect(0, 0, w, h);

      const pos = getPos(t);
      const R   = Math.min(w, h) * 0.19;
      drawLoupe(pos.x * w, pos.y * h, R);
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
