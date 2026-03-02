"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SKILLS_QUERYResult } from "@/sanity/types";
import { SkillButton } from "@/components/SkillsButton";

interface SkillsGridProps {
  skills: SKILLS_QUERYResult;
}

type Pt = { x: number; y: number; id: string };

export function SkillsGrid({ skills }: SkillsGridProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [burstId, setBurstId] = useState<string | null>(null);

  const pointsRef = useRef<Pt[]>([]);
  const rafRef = useRef<number | null>(null);
  const tRef = useRef(0);

  const skillIds = useMemo(() => skills.map((s) => s._id), [skills]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const measure = () => {
      const r = wrap.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width));
      canvas.height = Math.max(1, Math.floor(r.height));

      const btns = wrap.querySelectorAll<HTMLButtonElement>("button.skillBtn");
      const wr = wrap.getBoundingClientRect();

      const pts: Pt[] = [];
      btns.forEach((b, i) => {
        const br = b.getBoundingClientRect();
        pts.push({
          x: br.left - wr.left + br.width / 2,
          y: br.top - wr.top + br.height / 2,
          id: skillIds[i] ?? `i-${i}`,
        });
      });
      pointsRef.current = pts;
    };

    measure();
    window.addEventListener("resize", measure);

    const draw = () => {
      tRef.current += 1;
      const t = tRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pts = pointsRef.current;
      if (!pts.length) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const hover = hoverId ? pts.find((p) => p.id === hoverId) : null;
      const burst = burstId ? pts.find((p) => p.id === burstId) : null;

      // base constellation lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d > 260) continue;

          let alpha = 0.12;
          let w = 1;

          if (hover && (a.id === hover.id || b.id === hover.id) && d < 320) {
            alpha = 0.35 + 0.08 * Math.sin(t / 12);
            w = 1.6;
          }

          ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // hover node glow
      if (hover) {
        const r = 10 + 2 * Math.sin(t / 10);
        const g = ctx.createRadialGradient(
          hover.x,
          hover.y,
          0,
          hover.x,
          hover.y,
          r * 3,
        );
        g.addColorStop(0, "rgba(56,189,248,0.35)");
        g.addColorStop(1, "rgba(56,189,248,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(hover.x, hover.y, r * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // click burst ring
      if (burst) {
        const p = ((t % 60) / 60) * 1.0;
        const radius = 8 + p * 80;
        const alpha = Math.max(0, 0.35 - p * 0.35);
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", measure);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hoverId, burstId, skillIds]);

  useEffect(() => {
    if (!burstId) return;
    const to = setTimeout(() => setBurstId(null), 650);
    return () => clearTimeout(to);
  }, [burstId]);

  return (
    <div ref={wrapRef} className="relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 relative z-10">
        {skills.map((skill, idx) => (
          <SkillButton
            key={skill._id}
            skill={skill}
            index={idx}
            onHoverChange={(id) => setHoverId(id)}
            onClickBurst={(id) => setBurstId(id)}
          />
        ))}
      </div>
    </div>
  );
}
