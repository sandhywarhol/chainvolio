"use client";
import { useEffect, useRef, useState } from "react";
import { feature } from "topojson-client";

// ─── geometry helpers ────────────────────────────────────────────────────────

type Ring = [number, number][];

function inRing(lon: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function isOnLand(lon: number, lat: number, polys: Ring[][], bbs: [number, number, number, number][]): boolean {
  for (let pi = 0; pi < polys.length; pi++) {
    const [x0, x1, y0, y1] = bbs[pi];
    if (lon < x0 || lon > x1 || lat < y0 || lat > y1) continue;
    const poly = polys[pi];
    if (!inRing(lon, lat, poly[0])) continue;
    let hole = false;
    for (let hi = 1; hi < poly.length && !hole; hi++) hole = inRing(lon, lat, poly[hi]);
    if (!hole) return true;
  }
  return false;
}

function lonLatToXYZ(lon: number, lat: number): [number, number, number] {
  const lonR = (lon * Math.PI) / 180;
  const latR = (lat * Math.PI) / 180;
  const c = Math.cos(latR);
  return [c * Math.cos(lonR), Math.sin(latR), c * Math.sin(lonR)];
}

// ─── dot pre-generation (cached at module level) ─────────────────────────────

let _cached: Float32Array | null = null;
let _promise: Promise<Float32Array> | null = null;

function getLandDots(): Promise<Float32Array> {
  if (_cached) return Promise.resolve(_cached);
  if (_promise) return _promise;

  _promise = (async () => {
    const raw = await fetch("/data/land-110m.json").then((r) => r.json());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = feature(raw as any, (raw as any).objects.land) as any;

    // feature() returns FeatureCollection when the TopoJSON object is a
    // GeometryCollection (which land-110m uses), so collect all MultiPolygon
    // coordinates from all features.
    let polys: Ring[][] = [];
    const features = result.type === "FeatureCollection" ? result.features : [result];
    for (const f of features) {
      const geom = f.geometry;
      if (!geom) continue;
      if (geom.type === "MultiPolygon") polys = polys.concat(geom.coordinates as Ring[][]);
      else if (geom.type === "Polygon") polys.push(geom.coordinates as Ring[]);
    }

    // Bounding boxes for fast rejection
    const bbs: [number, number, number, number][] = polys.map((poly) => {
      let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
      for (const [x, y] of poly[0]) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      return [x0, x1, y0, y1];
    });

    const TARGET = 2400;
    const buf = new Float32Array(TARGET * 4);
    let count = 0, tries = 0;

    while (count < TARGET && tries < 400_000) {
      tries++;
      const lon = Math.random() * 360 - 180;
      const lat = (Math.acos(Math.random() * 2 - 1) * 180) / Math.PI - 90;
      if (!isOnLand(lon, lat, polys, bbs)) continue;
      const [x, y, z] = lonLatToXYZ(lon, lat);
      buf[count * 4] = x;
      buf[count * 4 + 1] = y;
      buf[count * 4 + 2] = z;
      buf[count * 4 + 3] = Math.random(); // random size seed
      count++;
    }

    _cached = new Float32Array(buf.buffer, 0, count * 4);
    return _cached;
  })();

  return _promise;
}

// ─── projection constants ─────────────────────────────────────────────────────

const THETA = 0.22; // fixed X-tilt (same as cobe default)

// ─── component ───────────────────────────────────────────────────────────────

export default function GlobeCanvas({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const phiRef = useRef(0.5);          // starting longitude view
  const pauseRef = useRef(false);
  const cursorRef = useRef<{ x: number; y: number } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dotsRef = useRef<any>(new Float32Array(0));
  const timeRef = useRef(0);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Load land dots async (won't block render)
  useEffect(() => {
    getLandDots().then((d) => { dotsRef.current = d; setReady(true); });
  }, []);

  // Intersection Observer to pause rendering when off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.05 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setDims({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setDims({ w: Math.round(r.width), h: Math.round(r.height) });
    return () => ro.disconnect();
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.w === 0 || !ready || !isVisible) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = Math.max(dims.w, dims.h);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d")!;

    cancelAnimationFrame(rafRef.current);

    const cosT = Math.cos(THETA);
    const sinT = Math.sin(THETA);

    function frame() {
      if (!pauseRef.current) {
        phiRef.current += 0.0022;
        timeRef.current += 1;
      }

      const dots = dotsRef.current;
      const n = dots.length / 4;
      const R = (Math.min(dims.w, dims.h) / 2) * dpr;
      const cx = (size / 2) * dpr, cy = (size / 2) * dpr;

      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      const phi = phiRef.current;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);

      // Convert cursor to canvas-pixel space
      let curCX: number | null = null;
      let curCY: number | null = null;
      const cur = cursorRef.current;
      if (cur) {
        const offX = (size - dims.w) / 2;
        const offY = (size - dims.h) / 2;
        curCX = (cur.x * dims.w + offX) * dpr;
        curCY = (cur.y * dims.h + offY) * dpr;
      }

      const influR = R * 0.15; // increased slightly to ensure we find candidates
      const influR2 = influR * influR;

      // ── Pass 1: Find closest dots ──────────────────────────────────────────
      const winners: { i: number; d2: number; rx: number; ry: number; rz: number }[] = [];
      if (curCX !== null && curCY !== null) {
        for (let i = 0; i < n; i++) {
          const dx = dots[i * 4];
          const dy = dots[i * 4 + 1];
          const dz = dots[i * 4 + 2];
          const rx = dx * cosP - dz * sinP;
          const rz0 = dx * sinP + dz * cosP;
          const rz = dy * sinT + rz0 * cosT;
          const ry = dy * cosT - rz0 * sinT;
          if (rz < -0.05) continue;
          const sx = cx + rx * R;
          const sy = cy - ry * R;
          const d2 = (sx - curCX) ** 2 + (sy - curCY) ** 2;
          if (d2 < influR2) {
            winners.push({ i, d2, rx, ry, rz });
          }
        }
        winners.sort((a, b) => a.d2 - b.d2);
        winners.splice(5); // Keep only top 5
      }
      const winnerIds = new Set(winners.map(w => w.i));

      // ── Pass 2: Render ─────────────────────────────────────────────────────
      const time = timeRef.current;

      for (let i = 0; i < n; i++) {
        const dx = dots[i * 4];
        const dy = dots[i * 4 + 1];
        const dz = dots[i * 4 + 2];
        const rand = dots[i * 4 + 3];

        const rx = dx * cosP - dz * sinP;
        const rz0 = dx * sinP + dz * cosP;
        const rz = dy * sinT + rz0 * cosT;
        const ry = dy * cosT - rz0 * sinT;

        if (rz < -0.05) continue;

        let elev = 0;
        const winner = winners.find(w => w.i === i);
        if (winner) {
          const t = 1 - winner.d2 / influR2;
          elev = t * t * (3 - 2 * t);
        }

        const pop = 1 + elev * 0.15;
        const sx = cx + rx * pop * R;
        const sy = cy - ry * pop * R;
        const erz = rz * pop;
        const depth = (erz + 1) * 0.5;

        // Stronger organic pulse
        const pulse = (
          Math.sin(time * (0.012 + rand * 0.008) + rand * 20) * 0.7 + 
          Math.sin(time * (0.03 + rand * 0.015) + rand * 10) * 0.3
        ) * 0.5 + 0.5;
        
        // Twinkle (kelap-kelip) effect: faster brightness variance
        const twinkle = Math.sin(time * (0.06 + rand * 0.04) + rand * 100) * 0.5 + 0.5;

        // Combine for a more energetic feel
        const alpha = Math.min(0.98, (0.15 + depth * 0.35 + elev * 0.45) * (0.6 + rand * 0.4) * (0.5 + pulse * 0.5) * (0.7 + twinkle * 0.3));
        const radius = (0.35 + depth * 0.5 + elev * 2.5 + rand * 0.8 + pulse * 0.4) * dpr;

        // Random Color Logic (Monochrome)
        let dotColor = "#ffffff"; 
        if (rand > 0.90) dotColor = "#ffffff";      
        else if (rand > 0.75) dotColor = "#cbd5e1"; 
        else dotColor = "#ffffff";                  

        ctx.fillStyle = dotColor;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtler glow for fewer dots
        if (rand > 0.96) {
          ctx.globalAlpha = alpha * 0.3;
          ctx.beginPath();
          ctx.arc(sx, sy, radius * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Less frequent connection arcs
        if (rand > 0.997 && !pauseRef.current) {
          const nextIdx = (i + 13) % n; 
          const nx = dots[nextIdx * 4];
          const ny = dots[nextIdx * 4 + 1];
          const nz = dots[nextIdx * 4 + 2];
          
          const nrx = nx * cosP - nz * sinP;
          const nrz0 = nx * sinP + nz * cosP;
          const nrz = ny * sinT + nrz0 * cosT;
          const nry = ny * cosT - nrz0 * sinT;

          if (nrz > 0) {
            const nsx = cx + nrx * R;
            const nsy = cy - nry * R;
            
            const arcPulse = Math.sin(time * 0.02 + rand * 100);
            if (arcPulse > 0.6) {
              const arcAlpha = (arcPulse - 0.6) * 0.1;
              ctx.beginPath();
              ctx.moveTo(sx, sy);
              ctx.quadraticCurveTo(cx, cy, nsx, nsy);
              ctx.strokeStyle = `rgba(255, 255, 255, ${arcAlpha})`; 
              ctx.lineWidth = 0.4 * dpr;
              ctx.stroke();
            }
          }
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dims, ready, isVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── mouse handling ────────────────────────────────────────────────────────
  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const sz = Math.max(dims.w, dims.h) || 1;
    // Map container position → canvas-relative position
    const cx = nx * (dims.w / sz) + (sz - dims.w) / 2 / sz;
    const cy = ny * (dims.h / sz) + (sz - dims.h) / 2 / sz;
    const onGlobe = Math.hypot(cx - 0.5, cy - 0.5) < 0.47;
    pauseRef.current = onGlobe;
    cursorRef.current = onGlobe ? { x: nx, y: ny } : null;
  }

  function onMouseLeave() {
    pauseRef.current = false;
    cursorRef.current = null;
  }

  const size = Math.max(dims.w, dims.h) || 0;
  const offL = -(size - dims.w) / 2;
  const offT = -(size - dims.h) / 2;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className ?? ""}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {dims.w > 0 && (
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            width: size,
            height: size,
            left: offL,
            top: offT,
            cursor: "default",
          }}
        />
      )}
    </div>
  );
}
