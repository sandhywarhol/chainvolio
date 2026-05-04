"use client";
import { useEffect, useRef } from "react";

interface Props {
  className?: string;
  dotCount?: number;
  speed?: number;
}

// Low-res world map data (0 = sea, 1 = land) encoded in a small matrix
// This helps create the "continent" look of the Stripe globe without external assets
const WORLD_MAP_DATA = [
  "0000000000000000000000000000000000000000",
  "0000000011110000000000000000000000000000",
  "0000011111111110000000001111111100000000",
  "0000111111111111000111111111111111000000",
  "0001111111111111100111111111111111111000",
  "0011111111111111111111111111111111111100",
  "0011111111111111111111111111111111111110",
  "0001111111111111111111111111111111111110",
  "0000111111111111111111111111111111111110",
  "0000011111111110001111111111111111111100",
  "0000001111111100000111111111111111110000",
  "0000000111110000000001111111111111100000",
  "0000000011000000000000111111111110000000",
  "0000000000000000000000011111111100000000",
  "0000000000000000000000001111111000000000",
  "0000000000000000000000000111110000000000",
  "0000000000000000000000000011100000000000",
  "0000000000000000000000000001000000000000",
  "0000000000000000000000000000000000000000"
];

export default function GlobeCanvas({ className, dotCount = 2400, speed = 0.002 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate points based on world map projection
    const points: { x: number, y: number, z: number, alpha: number }[] = [];
    const rows = WORLD_MAP_DATA.length;
    const cols = WORLD_MAP_DATA[0].length;

    for (let i = 0; i < dotCount; i++) {
      const u = Math.random();
      const v = Math.random();
      
      const lat = Math.acos(2 * v - 1) - Math.PI / 2;
      const lon = 2 * Math.PI * u;

      // Map lat/lon to world map data coordinates
      const xMap = Math.floor(u * cols);
      const yMap = Math.floor(v * rows);

      if (WORLD_MAP_DATA[yMap] && WORLD_MAP_DATA[yMap][xMap] === "1") {
        const x = Math.cos(lat) * Math.cos(lon);
        const y = Math.sin(lat);
        const z = Math.cos(lat) * Math.sin(lon);
        points.push({ x, y, z, alpha: Math.random() * 0.4 + 0.6 });
      }
    }

    let rotation = 0;
    let animId: number;
    let running = true;

    function resize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx!.scale(dpr, dpr);
    }

    function draw() {
      if (!running || !canvas || !ctx) return;
      const W = canvas.width / (window.devicePixelRatio || 1);
      const H = canvas.height / (window.devicePixelRatio || 1);
      const R = Math.min(W, H) * 0.48;
      const cx = W / 2;
      const cy = H / 2;

      ctx.clearRect(0, 0, W, H);

      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);

      // Project and draw
      points.forEach(p => {
        // Rotation around Y
        const rx = p.x * cosR - p.z * sinR;
        const rz = p.x * sinR + p.z * cosR;
        
        // Perspective calculation
        const perspective = 2.5;
        const scale = perspective / (perspective + rz);
        const sx = cx + rx * R * scale;
        const sy = cy + p.y * R * scale;

        // Opacity based on depth
        const depthAlpha = (rz + 1) / 2; // 0 to 1
        if (depthAlpha < 0.1) return;

        ctx.beginPath();
        ctx.arc(sx, sy, 0.85 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${(p.alpha * depthAlpha * 0.7).toFixed(2)})`;
        ctx.fill();
      });

      // Subtle atmospheric glow
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      grd.addColorStop(0, "rgba(255, 255, 255, 0.05)");
      grd.addColorStop(0.8, "rgba(255, 255, 255, 0.02)");
      grd.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      rotation += speed;
      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [dotCount, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
