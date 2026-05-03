"use client";

import { useRef, useEffect, useCallback } from "react";
import Image from "next/image";

interface Spark {
  segments: Array<{ x: number; y: number }>;
  life: number;
  maxLife: number;
  width: number;
  color: string;
}

interface Props {
  src: string;
  alt: string;
}

export default function ProblemCardEffect({ src, alt }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, inside: false });
  const sparksRef = useRef<Spark[]>([]);
  const frameRef = useRef<number>(0);
  const lastSparkRef = useRef<number>(0);

  const createSpark = useCallback((w: number, h: number) => {
    // Start from a random edge or interior point
    const startX = w * 0.1 + Math.random() * w * 0.8;
    const startY = h * 0.1 + Math.random() * h * 0.8;

    const segments: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];
    const numSegments = 3 + Math.floor(Math.random() * 5);
    const totalLength = 15 + Math.random() * 50;
    const baseAngle = Math.random() * Math.PI * 2;

    let cx = startX;
    let cy = startY;

    for (let i = 0; i < numSegments; i++) {
      const segLen = (totalLength / numSegments) * (0.4 + Math.random() * 1.2);
      const deviation = (Math.random() - 0.5) * 1.5;
      const angle = baseAngle + deviation;
      cx += Math.cos(angle) * segLen;
      cy += Math.sin(angle) * segLen;
      // Occasionally add a sharp kink (true electric arc look)
      if (Math.random() < 0.4) {
        cx += (Math.random() - 0.5) * 12;
        cy += (Math.random() - 0.5) * 12;
      }
      segments.push({ x: cx, y: cy });
    }

    // Color: orange-red spectrum matching brand
    const hue = 10 + Math.random() * 30; // 10–40 deg: red-orange
    const sat = 90 + Math.random() * 10;
    const maxLife = 12 + Math.random() * 20;

    sparksRef.current.push({
      segments,
      life: maxLife,
      maxLife,
      width: 0.5 + Math.random() * 1,
      color: `hsl(${hue}, ${sat}%, 70%)`,
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const animate = (time: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const mouse = mouseRef.current;

      // Spawn sparks
      const idleInterval = 120; // ms between sparks at idle
      const hoverInterval = 30;
      const interval = mouse.inside ? hoverInterval : idleInterval;

      if (time - lastSparkRef.current > interval) {
        const count = mouse.inside ? 2 : 1;
        for (let i = 0; i < count; i++) {
          createSpark(w, h);
        }
        // Occasional burst
        if (!mouse.inside && Math.random() < 0.12) {
          for (let i = 0; i < 3; i++) createSpark(w, h);
        }
        lastSparkRef.current = time;
      }

      // Draw sparks
      sparksRef.current = sparksRef.current.filter((spark) => {
        const t = spark.life / spark.maxLife; // 1 → 0 as it dies
        // Fade in quickly, hold, fade out
        const fadein = Math.min(1, (spark.maxLife - spark.life) / 3);
        const alpha = fadein * t * 0.9;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = spark.color;
        ctx.lineWidth = spark.width;
        ctx.shadowBlur = 8 + t * 12;
        ctx.shadowColor = spark.color;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(spark.segments[0].x, spark.segments[0].y);
        for (let i = 1; i < spark.segments.length; i++) {
          ctx.lineTo(spark.segments[i].x, spark.segments[i].y);
        }
        ctx.stroke();

        // Double-draw for brighter core
        ctx.globalAlpha = alpha * 0.5;
        ctx.lineWidth = spark.width * 0.4;
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff";
        ctx.stroke();

        ctx.restore();

        spark.life -= 1;
        return spark.life > 0;
      });

      // Hover spotlight
      if (mouse.inside) {
        const mx = mouse.x * w;
        const my = mouse.y * h;
        const r = Math.min(w, h) * 0.55;
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, r);
        grad.addColorStop(0, "rgba(255, 100, 30, 0.13)");
        grad.addColorStop(0.35, "rgba(255, 60, 10, 0.06)");
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.save();
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        // Bright ring at cursor
        const ring = ctx.createRadialGradient(mx, my, 0, mx, my, 28);
        ring.addColorStop(0, "rgba(255,160,80,0.18)");
        ring.addColorStop(0.6, "rgba(255,80,20,0.08)");
        ring.addColorStop(1, "rgba(0,0,0,0)");
        ctx.save();
        ctx.fillStyle = ring;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
    };
    const onEnter = () => { mouseRef.current.inside = true; };
    const onLeave = () => { mouseRef.current.inside = false; };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, [createSpark]);

  return (
    <div ref={containerRef} className="h-[300px] relative flex items-center justify-center">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain mix-blend-screen"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}
