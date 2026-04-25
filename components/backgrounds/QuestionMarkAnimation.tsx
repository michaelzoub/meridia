"use client";

import { useEffect, useRef } from "react";

interface Props {
  color?: string;
  opacity?: number;
}

/**
 * A large question mark drawn with bezier curves, centered in its canvas.
 * The hook dome and dot size slowly morph via two overlapping sine waves
 * so the shape breathes in a non-repeating, organic way.
 */
export default function QuestionMarkAnimation({
  color = "#111111",
  opacity = 0.10,
}: Props) {
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

    /**
     * Draw the question mark.
     *
     * m  — morph value in [-1, 1], controls how much the dome bows
     *       and how large the dot is.
     */
    function drawQ(px: number, py: number, s: number, m: number) {
      const sw = s * 0.115;
      cx.lineWidth   = sw;
      cx.lineCap     = "round";
      cx.lineJoin    = "round";
      cx.strokeStyle = color;
      cx.fillStyle   = color;
      cx.globalAlpha = opacity;

      // ── Hook ───────────────────────────────────────────────────────────────
      // Drawn as two cubic bezier segments:
      //   Seg A: from hook-left-bottom → left apex → dome top
      //   Seg B: from dome top → right apex → hook-right-bottom
      // The hook-bottom gap (between left and right endpoints) naturally
      // creates the open mouth of the ?
      //
      // Morph affects the dome apex (bows it up/down slightly) and the
      // bulge on each side.
      const domeY   = py - s * 0.42 + m * s * 0.04; // breathes up/down
      const sideX   = s  * 0.22 + m * s * 0.01;     // slight width morph
      const sideY   = py - s * 0.22;

      // Hook left bottom (where hook ends on the left / feeds into stem area)
      const hLx = px - s * 0.09;
      const hLy = py;

      // Hook right bottom (where hook ends on the right)
      const hRx = px + s * 0.07;
      const hRy = py - s * 0.01;

      cx.beginPath();
      // Seg A: left-bottom → top dome (going counter-clockwise / up-and-over)
      cx.moveTo(hLx, hLy);
      cx.bezierCurveTo(
        px - sideX * 1.1,  sideY + s * 0.02,   // cp1: pull left side
        px - sideX * 0.9,  domeY - s * 0.04,   // cp2: up toward dome
        px,                domeY,                // dome top center
      );
      // Seg B: dome top → right side → right-bottom
      cx.bezierCurveTo(
        px + sideX * 0.9,  domeY - s * 0.04,   // cp1: mirror
        px + sideX * 1.0,  sideY + s * 0.02,   // cp2: right side
        hRx,               hRy,                  // right-bottom of hook
      );
      cx.stroke();

      // ── Stem ───────────────────────────────────────────────────────────────
      const stemTop = py + s * 0.06;
      const stemBot = py + s * 0.22;
      cx.beginPath();
      cx.moveTo(px, stemTop);
      cx.lineTo(px, stemBot);
      cx.stroke();

      // ── Dot ────────────────────────────────────────────────────────────────
      const dotR = s * 0.075 + m * s * 0.012;
      cx.beginPath();
      cx.arc(px, py + s * 0.33, Math.max(dotR, 0.5), 0, Math.PI * 2);
      cx.fill();
    }

    function tick(time: number) {
      rafId = requestAnimationFrame(tick);
      const t = time / 1000;

      const w = cv.width;
      const h = cv.height;
      cx.clearRect(0, 0, w, h);

      // Two overlapping sine waves → slow, organic, never truly repeating
      const m = Math.sin(t * 0.31) * 0.65 + Math.sin(t * 0.13) * 0.35;

      const s = Math.min(w, h) * 0.58;
      drawQ(w / 2, h / 2 + s * 0.05, s, m);

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
