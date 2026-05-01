"use client";

import { useEffect, useRef } from "react";

const DEFAULT_ACCENT: [number, number, number] = [103, 232, 249];

export type PixelHammerProps = {
  /** RGB stroke/fill accent (default: cyan). Use warm sand/rust on Caliga / variation1. */
  accentRgb?: [number, number, number];
};

/**
 * Nested concentric gears — all rings rotate together as one unit.
 */
export default function PixelHammer({
  accentRgb = DEFAULT_ACCENT,
}: PixelHammerProps) {
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

    const [r, g, b] = accentRgb;

    function drawGear(
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      bodyR: number,
      toothH: number,
      teeth: number,
      angle: number,
      strokeAlpha: number,
      fillAlpha: number,
      lw: number,
    ) {
      const outerR = bodyR + toothH;
      const step = (Math.PI * 2) / teeth;
      const toothHalf = step * 0.22;

      c.beginPath();
      for (let i = 0; i < teeth; i++) {
        const center = i * step + angle;
        const rootL = center - toothHalf;
        const rootR = center + toothHalf;
        c.arc(cx, cy, bodyR, center - step * 0.5 + toothHalf, rootL);
        c.lineTo(cx + Math.cos(rootL) * outerR, cy + Math.sin(rootL) * outerR);
        c.arc(cx, cy, outerR, rootL, rootR);
        c.lineTo(cx + Math.cos(rootR) * bodyR, cy + Math.sin(rootR) * bodyR);
      }
      c.closePath();

      if (fillAlpha > 0) {
        c.fillStyle = `rgba(${r},${g},${b},${fillAlpha.toFixed(3)})`;
        c.fill();
      }
      c.strokeStyle = `rgba(${r},${g},${b},${strokeAlpha.toFixed(3)})`;
      c.lineWidth = lw;
      c.stroke();
    }

    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      const t = (now - startTime) / 1000;

      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const rotAngle = t * 0.22;

      const cx = cw * 0.5;
      const cy = ch * 0.62;
      const maxR = Math.min(cw, ch) * 0.43;

      const ringDefs = [
        { frac: 0.2, teeth: 8 },
        { frac: 0.36, teeth: 12 },
        { frac: 0.52, teeth: 16 },
        { frac: 0.7, teeth: 22 },
        { frac: 0.88, teeth: 28 },
      ];

      for (let i = 0; i < ringDefs.length; i++) {
        const def = ringDefs[i];
        const frac = def.frac;
        const bodyR = maxR * frac;
        const toothH = bodyR * 0.12;
        const strokeAlpha = 0.12 + frac * 0.18;
        const fillAlpha = i === 0 ? 0.07 : 0;
        const lw = (0.5 + frac * 0.8) * dpr;

        drawGear(
          ctx,
          cx,
          cy,
          bodyR,
          toothH,
          def.teeth,
          rotAngle,
          strokeAlpha,
          fillAlpha,
          lw,
        );
      }

      // Center hub
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 0.04, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},0.18)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${r},${g},${b},0.26)`;
      ctx.lineWidth = 0.8 * dpr;
      ctx.stroke();

      // Spokes
      const spokeR = maxR * ringDefs[0].frac * 0.88;
      const hubR = maxR * 0.04;
      for (let s = 0; s < 4; s++) {
        const a = s * (Math.PI / 2) + rotAngle;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * hubR, cy + Math.sin(a) * hubR);
        ctx.lineTo(cx + Math.cos(a) * spokeR, cy + Math.sin(a) * spokeR);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.18)`;
        ctx.lineWidth = 0.8 * dpr;
        ctx.stroke();
      }

      // Boundary ring
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 1.01, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},0.07)`;
      ctx.lineWidth = 0.6 * dpr;
      ctx.stroke();
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
