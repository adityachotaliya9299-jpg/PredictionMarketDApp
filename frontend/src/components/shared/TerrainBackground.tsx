"use client";
import { useEffect, useRef } from "react";

/**
 * 3D perspective-projected "golden terrain" — a slow, undulating field of
 * gold particles receding to the horizon, drawn on a raw canvas (no deps).
 * Static single frame when prefers-reduced-motion; pauses when tab hidden.
 */
export function TerrainBackground({ opacity = 1 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0, height = 0, raf = 0, t = 0, running = true;

    const isLight = () => document.documentElement.classList.contains("light");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Grid of points in 3D space: x ∈ [-1,1], z ∈ [0,1] (0 near, 1 far)
    const COLS = 60;
    const ROWS = 26;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const light = isLight();
      const horizon = height * 0.42;
      const fov = width * 0.9;

      for (let r = 0; r < ROWS; r++) {
        const z = r / (ROWS - 1); // 0 near → 1 far
        const depth = 0.25 + z * 2.4;
        for (let c = 0; c <= COLS; c++) {
          const x = (c / COLS) * 2 - 1;
          // slow rolling waves; two frequencies so it feels organic
          const wave =
            Math.sin(x * 2.6 + t * 0.00022 + z * 5) * 0.5 +
            Math.sin(x * 5.2 - t * 0.00013 + z * 9) * 0.25;
          const y = wave * (0.18 + z * 0.5);

          const px = (x * fov * 0.9) / depth + width / 2;
          const py = horizon + ((0.9 + y) * height * 0.5) / depth;
          if (px < -8 || px > width + 8 || py > height + 8) continue;

          const fade = Math.max(0, 1 - z * 1.05); // fog toward horizon
          const size = Math.max(0.4, 1.7 * fade);
          const crest = Math.max(0, wave); // crests glow brighter

          const alpha = (0.05 + fade * 0.24 + crest * 0.12) * opacity;
          ctx.fillStyle = light
            ? `rgba(122, 94, 20, ${alpha * 0.8})`
            : `rgba(226, 193, 120, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      t = now;
      draw();
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) {
      t = 40000; // pleasant static frame
      draw();
    } else {
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => { resize(); if (reduced) draw(); };
    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running && !reduced) raf = requestAnimationFrame(loop);
      else cancelAnimationFrame(raf);
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [opacity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
