"use client";

import { useEffect, useRef } from "react";

export interface ThreadsProps {
  color?: [number, number, number];
  amplitude?: number;
  distance?: number;
  enableMouseInteraction?: boolean;
}

/**
 * Canvas-based animated flowing threads.
 * Color is supplied as normalized [r, g, b] values (0–1), matching the
 * react-bits/Threads-JS-CSS API.
 */
export default function Threads({
  color = [0.32, 0.15, 1],
  amplitude = 1,
  enableMouseInteraction = false,
}: ThreadsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

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

    const [r, g, b] = color.map((c) => Math.round(c * 255));
    const THREAD_COUNT = 32;

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

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    if (enableMouseInteraction) {
      container.addEventListener("mousemove", onMouseMove);
      container.addEventListener("mouseleave", onMouseLeave);
    }

    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      const t = (now - startTime) / 1000;

      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < THREAD_COUNT; i++) {
        const progress = i / (THREAD_COUNT - 1);
        const baseY = ch * progress;
        // Slightly different phase and speed per thread
        const phase = progress * Math.PI * 6 + i * 0.45;
        const spd = 0.25 + progress * 0.18 + (i % 3) * 0.06;
        const freq = 1.2 + (i % 4) * 0.15;

        ctx.beginPath();

        const SEGMENTS = 100;
        for (let s = 0; s <= SEGMENTS; s++) {
          const sx = (s / SEGMENTS) * cw;
          const spx = s / SEGMENTS;

          let y =
            baseY +
            Math.sin(spx * freq * Math.PI * 2 + phase + t * spd) *
              (ch * 0.055 * amplitude);

          // Secondary harmonic for more organic look
          y +=
            Math.sin(spx * freq * Math.PI * 3.7 + phase * 1.3 + t * spd * 1.4) *
            (ch * 0.018 * amplitude);

          // Mouse repulsion
          if (enableMouseInteraction) {
            const dx = sx - mx;
            const dy = y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const repulseR = ch * 0.18;
            if (dist < repulseR && dist > 0.1) {
              const force = ((1 - dist / repulseR) * ch * 0.05) / (dist * 0.08 + 1);
              y += (dy / dist) * force;
            }
          }

          if (s === 0) {
            ctx.moveTo(sx, y);
          } else {
            ctx.lineTo(sx, y);
          }
        }

        // Threads near the edges are subtler
        const edgeFade = Math.min(progress, 1 - progress) * 4;
        const opacity = Math.min(0.18, (0.04 + progress * 0.1) * Math.min(1, edgeFade));
        ctx.strokeStyle = `rgba(${r},${g},${b},${opacity.toFixed(3)})`;
        ctx.lineWidth = 0.75 * dpr;
        ctx.stroke();
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      if (enableMouseInteraction) {
        container.removeEventListener("mousemove", onMouseMove);
        container.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [color, amplitude, enableMouseInteraction]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} aria-hidden className="block h-full w-full" />
    </div>
  );
}
