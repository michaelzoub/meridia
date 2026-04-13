"use client";

import * as React from "react";

type RippleProps = {
  className?: string;
  /** Warm tones use terracotta/stone rings instead of cyan. */
  tone?: "default" | "warm";
};

export function Ripple({ className, tone = "default" }: RippleProps) {
  const warm = tone === "warm";
  return (
    <div className={["absolute inset-0", className].filter(Boolean).join(" ")}>
      <div className="ripple-layer" />
      <div className={`ripple-layer ripple-layer--2 ${warm ? "ripple-layer--warm2" : ""}`} />
      <div className={`ripple-layer ripple-layer--3 ${warm ? "ripple-layer--warm3" : ""}`} />
      <style jsx>{`
        .ripple-layer {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 38rem;
          height: 38rem;
          transform: translate(-50%, -50%) scale(0.2);
          border-radius: 9999px;
          border: 1px solid rgba(24, 24, 27, 0.22);
          opacity: 0;
          animation: ripple 3.2s ease-out infinite;
        }

        .ripple-layer--2 {
          animation-delay: 0.85s;
          border-color: rgba(8, 145, 178, 0.26);
        }

        .ripple-layer--3 {
          animation-delay: 1.7s;
          border-color: rgba(8, 145, 178, 0.18);
        }

        .ripple-layer--warm2 {
          border-color: rgba(180, 83, 9, 0.22);
        }

        .ripple-layer--warm3 {
          border-color: rgba(120, 53, 15, 0.16);
        }

        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.15);
            opacity: 0;
          }
          14% {
            opacity: 0.85;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

