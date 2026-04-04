"use client";

import * as React from "react";
import createGlobe from "cobe";

type GlobeProps = {
  className?: string;
};

export function Globe({ className }: GlobeProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = 0;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let phi = 0;
    let raf = 0;

    const onResize = () => {
      const nextWidth = canvas.offsetWidth;
      if (!nextWidth || nextWidth === width) return;
      width = nextWidth;
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(width * dpr);
      globe?.update({ width: canvas.width, height: canvas.height, devicePixelRatio: dpr });
    };

    onResize();
    window.addEventListener("resize", onResize, { passive: true });

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);

    globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: canvas.width,
      height: canvas.height,
      phi,
      theta: 0.22,
      dark: 0,
      // Flatter, print-like shading to match site UI (avoid "3D ball" look).
      diffuse: 0.55,
      mapSamples: 16000,
      mapBrightness: 1.05,
      baseColor: [0.97, 0.98, 0.99],
      markerColor: [0.97, 0.98, 0.99],
      glowColor: [0.97, 0.98, 0.99],
      markers: [],
      opacity: 0.9,
    });

    const loop = () => {
      phi += 0.003;
      globe?.update({ phi });
      raf = window.requestAnimationFrame(loop);
    };

    raf = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(raf);
      globe?.destroy();
    };
  }, []);

  return (
    <div
      className={[
        "pointer-events-none absolute left-1/2 -translate-x-1/2",
        className ?? "",
      ].join(" ")}
    >
      <div className="relative h-[360px] w-[360px] md:h-[420px] md:w-[420px]">
        <canvas
          ref={canvasRef}
          className="h-full w-full select-none opacity-90"
          aria-hidden
        />
      </div>
    </div>
  );
}

