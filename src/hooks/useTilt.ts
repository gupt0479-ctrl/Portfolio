"use client";

import { useEffect, useRef } from "react";

type TiltOptions = {
  max?: number;
  scale?: number;
  speed?: number;
};

export function useTilt<T extends HTMLElement>(opts: TiltOptions = {}) {
  const ref = useRef<T | null>(null);
  const { max = 10, scale = 1.02, speed = 0.12 } = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rx = 0,
      ry = 0;
    let tx = 0,
      ty = 0;
    let raf = 0;

    const tick = () => {
      rx += (tx - rx) * speed;
      ry += (ty - ry) * speed;
      el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const dx = px - 0.5;
      const dy = py - 0.5;
      tx = -dy * max;
      ty = dx * max;
      el.style.setProperty("--s", `${scale}`);
      el.style.setProperty("--hx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--hy", `${(py * 100).toFixed(1)}%`);
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      el.style.setProperty("--s", `1`);
    };

    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--s", "1");
    el.style.setProperty("--hx", "50%");
    el.style.setProperty("--hy", "50%");

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max, scale, speed]);

  return ref;
}
