"use client";

import { useEffect, useRef } from "react";

// Bayer 4×4 ordered dithering matrix, normalized to 0–1
const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => v / 16));

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
    : [0, 0, 0];
}

export interface PixelBlastProps {
  variant?: "square" | "circle";
  pixelSize?: number;
  color?: string;
  patternScale?: number;
  patternDensity?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleSpeed?: number;
  rippleThickness?: number;
  rippleIntensityScale?: number;
  liquid?: boolean;
  liquidStrength?: number;
  liquidRadius?: number;
  liquidWobbleSpeed?: number;
  speed?: number;
  edgeFade?: number;
  transparent?: boolean;
}

/**
 * Canvas-based Bayer-dithered pixel blast.
 * Renders 3 soft circles (one per founder) with an ordered-dithering
 * pixel treatment and optional animated ripples.
 *
 * Inspired by github.com/zavalit/bayer-dithering-webgl-demo
 */
export default function PixelBlast({
  pixelSize = 4,
  color = "#ddeaf6",
  enableRipples = false,
  rippleSpeed = 0.4,
  rippleThickness = 0.12,
  rippleIntensityScale = 1.5,
  speed = 0.5,
  edgeFade = 0.25,
}: PixelBlastProps) {
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
    let w = 0;
    let h = 0;
    const startTime = performance.now();
    const rgb = hexToRgb(color);

    // Two circles — one per founder
    const circles = [
      { x: 0.33, y: 0.55, r: 0.28 },
      { x: 0.67, y: 0.55, r: 0.28 },
    ];

    const resize = () => {
      w = container.clientWidth;
      h = container.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      const t = ((now - startTime) / 1000) * speed;

      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      const ps = pixelSize * dpr;
      const cols = Math.ceil(cw / ps);
      const rows = Math.ceil(ch / ps);
      const aspect = cw / ch;

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const px = (col + 0.5) / cols;
          const py = (row + 0.5) / rows;

          let maxIntensity = 0;

          for (const c of circles) {
            const dx = (px - c.x) * aspect;
            const dy = py - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy) / c.r;

            let intensity = Math.max(0, 1 - dist);
            intensity = Math.pow(intensity, 1.6); // softer edge

            if (enableRipples && dist > 0.08 && dist < 1.9) {
              const wave =
                Math.sin(dist * 10 - t * rippleSpeed * Math.PI * 2) * 0.5 +
                0.5;
              const falloff = Math.exp(-dist * 1.5);
              intensity += wave * rippleIntensityScale * falloff * rippleThickness * 3;
            }

            // Fade near card edges
            const edgeDist = Math.min(px, 1 - px, py, 1 - py);
            if (edgeDist < edgeFade) {
              intensity *= edgeDist / edgeFade;
            }

            maxIntensity = Math.max(maxIntensity, Math.min(1, intensity));
          }

          if (maxIntensity <= 0.01) continue;

          // Bayer ordered dithering
          const threshold = BAYER_4[row % 4][col % 4];
          if (maxIntensity > threshold) {
            ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${maxIntensity.toFixed(3)})`;
            ctx.fillRect(
              Math.round(col * ps),
              Math.round(row * ps),
              Math.round(ps),
              Math.round(ps),
            );
          }
        }
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [
    pixelSize,
    color,
    enableRipples,
    rippleSpeed,
    rippleThickness,
    rippleIntensityScale,
    speed,
    edgeFade,
  ]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} aria-hidden className="block h-full w-full" />
    </div>
  );
}
