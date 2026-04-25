"use client";

import { useEffect, useRef } from "react";

// Three squares at fixed triangle vertices — no physics, just cycle through
// which one is "active" (brighter) every SWAP_MS milliseconds.
const SIDE = 22;
const R    = SIDE / Math.sqrt(3); // circumradius of equilateral triangle
const TX   = 62, TY = 34;        // triangle centroid

const POS = [
  { x: TX,           y: TY - R      }, // top
  { x: TX + SIDE / 2, y: TY + R / 2 }, // bottom-right
  { x: TX - SIDE / 2, y: TY + R / 2 }, // bottom-left
] as const;

const SWAP_MS = 1800; // swap every 1.8 s

export function FooterCornerSquarcles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cv = canvas;
    const cx = ctx;
    let activeIdx = 0;

    function draw() {
      cx.clearRect(0, 0, cv.width, cv.height);
      for (let i = 0; i < 3; i++) {
        const isActive = i === activeIdx;
        cx.globalAlpha = isActive ? 0.82 : 0.32;
        cx.fillStyle   = "#a1a1aa";
        const half = isActive ? 2.5 : 1.5;
        cx.fillRect(
          Math.round(POS[i].x) - half,
          Math.round(POS[i].y) - half,
          half * 2,
          half * 2,
        );
      }
      cx.globalAlpha = 1;
    }

    cv.width  = cv.offsetWidth;
    cv.height = cv.offsetHeight;
    draw();

    const id = setInterval(() => {
      activeIdx = (activeIdx + 1) % 3;
      draw();
    }, SWAP_MS);

    return () => clearInterval(id);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute right-0 top-0 h-[80px] w-[100px] select-none"
      aria-hidden
    />
  );
}

FooterCornerSquarcles.displayName = "FooterCornerSquarcles";
