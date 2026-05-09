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
  const [network, setNetwork] = useState<{ hubs: { idx: number; targets: number[]; color: string }[] } | null>(null);
  const networkRef = useRef<{ hubs: { idx: number; targets: number[]; color: string }[] } | null>(null);

  // Load land dots async (won't block render)
  useEffect(() => {
    getLandDots().then((d) => { 
      dotsRef.current = d; 
      
      const n = d.length / 4;
      const hubs: { idx: number; targets: number[]; color: string }[] = [];
      const colors = ["#ffffff", "#ffffff", "#ffffff"];
      
      // Create 3 hubs with distinct colors
      // Create 3 hubs with distinct colors, ensuring they are spread out
      for (let i = 0; i < 3; i++) {
          let hubIdx = -1;
          let bestHubIdx = -1;
          let maxMinDist = -1;

          // Try multiple candidates and pick the one farthest from existing hubs
          for (let attempt = 0; attempt < 50; attempt++) {
              const testIdx = Math.floor(Math.random() * n);
              let minDist = 2.0; // Max possible distance on unit sphere is 2.0

              for (const existing of hubs) {
                  const d3d = Math.hypot(
                      d[testIdx * 4] - d[existing.idx * 4],
                      d[testIdx * 4 + 1] - d[existing.idx * 4 + 1],
                      d[testIdx * 4 + 2] - d[existing.idx * 4 + 2]
                  );
                  if (d3d < minDist) minDist = d3d;
              }

              // Weight by distance AND brightness (rand)
              const score = minDist * (0.5 + d[testIdx * 4 + 3] * 0.5);
              if (score > maxMinDist) {
                  maxMinDist = score;
                  bestHubIdx = testIdx;
              }
          }
          hubIdx = bestHubIdx;
          
          const targets: number[] = [];
          const numTargets = 10 + Math.floor(Math.random() * 5); 
          let attempts = 0;
          while (targets.length < numTargets && attempts < 200) {
              attempts++;
              const targetIdx = Math.floor(Math.random() * n);
              const d3d = Math.hypot(
                  d[hubIdx * 4] - d[targetIdx * 4],
                  d[hubIdx * 4 + 1] - d[targetIdx * 4 + 1],
                  d[hubIdx * 4 + 2] - d[targetIdx * 4 + 2]
              );
              if (d3d > 0.8) { // Increased minimum distance to target for a "wider" network
                  targets.push(targetIdx);
              }
          }
          hubs.push({ idx: hubIdx, targets, color: colors[i] });
      }
      
      networkRef.current = { hubs };
      setNetwork({ hubs });
      setReady(true); 
    });
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
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

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

      const influR = R * 0.15; 
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

      // ── Pass 2: Render Dots and Network ────────────────────────────────────
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
        
        // Twinkle (kelap-kelip) effect
        const twinkle = Math.sin(time * (0.06 + rand * 0.04) + rand * 100) * 0.5 + 0.5;

        const alpha = Math.min(0.98, (0.15 + depth * 0.35 + elev * 0.45) * (0.6 + rand * 0.4) * (0.5 + pulse * 0.5) * (0.7 + twinkle * 0.3));
        const radius = (0.35 + depth * 0.5 + elev * 2.5 + rand * 0.8 + pulse * 0.4) * dpr;

        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtler glow for prominent dots
        if (rand > 0.94) {
          const isHub = networkRef.current?.hubs.some(h => h.idx === i);
          ctx.globalAlpha = alpha * (isHub ? 0.6 : 0.25);
          ctx.beginPath();
          ctx.arc(sx, sy, radius * (isHub ? 3.5 : 2.2), 0, Math.PI * 2);
          const hubColor = networkRef.current?.hubs.find(h => h.idx === i)?.color;
          ctx.fillStyle = hubColor || "#ffffff";
          ctx.fill();
        }
      }

      // ── Pass 3: Draw Neural Network Connections ────────────────────────────
      if (networkRef.current && networkRef.current.hubs.length > 0) {
          const hubs = networkRef.current.hubs;
          
          hubs.forEach((hub, hubIdx) => {
              const masterDot = {
                  dx: dots[hub.idx * 4],
                  dy: dots[hub.idx * 4 + 1],
                  dz: dots[hub.idx * 4 + 2]
              };
              
              const rx = masterDot.dx * cosP - masterDot.dz * sinP;
              const rz0 = masterDot.dx * sinP + masterDot.dz * cosP;
              const rz = masterDot.dy * sinT + rz0 * cosT;
              const ry = masterDot.dy * cosT - rz0 * sinT;
              
              if (rz < -0.1) return;
              
              const mx = cx + rx * R;
              const my = cy - ry * R;

              hub.targets.forEach((targetIdx, tIdx) => {
                  const targetDot = {
                      dx: dots[targetIdx * 4],
                      dy: dots[targetIdx * 4 + 1],
                      dz: dots[targetIdx * 4 + 2]
                  };
                  
                  const isHovering = pauseRef.current;
                  const trx = targetDot.dx * cosP - targetDot.dz * sinP;
                  const trz0 = targetDot.dx * sinP + targetDot.dz * cosP;
                  const trz = targetDot.dy * sinT + trz0 * cosT;
                  const try_ = targetDot.dy * cosT - trz0 * sinT;
                  
                  if (trz < -0.1) return;
                  
                  const tx = cx + trx * R;
                  const ty = cy - try_ * R;

                  // Visibility based on average depth
                  const visibility = Math.max(0, Math.min(1, (rz + trz) * 0.8));
                  if (visibility <= 0) return;

                  // Curve Calculation (Spherical Surface Approximation)
                  const midX = (mx + tx) / 2;
                  const midY = (my + ty) / 2;
                  
                  // Calculate control point that arcs follow the globe's radius
                  const dToCenter = Math.hypot(midX - cx, midY - cy) || 1;
                  const cpX = cx + (midX - cx) * (R / dToCenter) * 1.12; 
                  const cpY = cy + (midY - cy) * (R / dToCenter) * 1.12;

                  const linePulse = Math.sin(time * (isHovering ? 0.08 : 0.03) + hubIdx) * 0.5 + 0.5;
                  const lineAlpha = (0.05 + linePulse * (isHovering ? 0.35 : 0.15)) * visibility;
                  
                  ctx.beginPath();
                  ctx.moveTo(mx, my);
                  ctx.quadraticCurveTo(cpX, cpY, tx, ty);
                  
                  ctx.strokeStyle = hub.color;
                  ctx.globalAlpha = lineAlpha;
                  ctx.lineWidth = (isHovering ? 1.0 : 0.5) * dpr;
                  ctx.stroke();

                  // ── Sequential Flow Logic ──
                  const flowSpeed = isHovering ? 0.008 : 0.004;
                  const hubCycleTime = time * flowSpeed;
                  const activeTIdx = Math.floor(hubCycleTime % hub.targets.length);
                  const flowProgress = hubCycleTime % 1;

                  if (tIdx === activeTIdx) {
                      const tailLength = 45; // Increased for a longer tail
                      for (let j = 0; j < tailLength; j++) {
                          // Reduced spacing (0.006) ensures segments overlap for a smooth, non-fragmented look
                          const t = Math.max(0, flowProgress - j * 0.006);
                          
                          const px = (1 - t) * (1 - t) * mx + 2 * (1 - t) * t * cpX + t * t * tx;
                          const py = (1 - t) * (1 - t) * my + 2 * (1 - t) * t * cpY + t * t * ty;
                          
                          // Non-linear fade for a more organic "comet" look
                          const tailScale = Math.pow(1 - j / tailLength, 1.2);
                          ctx.globalAlpha = lineAlpha * (isHovering ? 14 : 9) * visibility * tailScale;
                          ctx.fillStyle = hub.color;
                          
                          if (j === 0) {
                              // Lead particle bloom
                              ctx.shadowBlur = 15 * dpr;
                              ctx.shadowColor = hub.color;
                              ctx.beginPath();
                              ctx.arc(px, py, (isHovering ? 2.6 : 2.0) * dpr, 0, Math.PI * 2);
                              ctx.fill();
                              ctx.shadowBlur = 0; 
                          } else {
                              // Tail segments - slightly larger to ensure overlap
                              ctx.beginPath();
                              ctx.arc(px, py, (isHovering ? 2.2 : 1.6) * dpr * (0.5 + 0.5 * tailScale), 0, Math.PI * 2);
                              ctx.fill();
                          }
                      }
                  }
              });

              // Cross-hub connection (connect hub to next hub)
              const nextHub = hubs[(hubIdx + 1) % hubs.length];
              const nextDot = {
                  dx: dots[nextHub.idx * 4],
                  dy: dots[nextHub.idx * 4 + 1],
                  dz: dots[nextHub.idx * 4 + 2]
              };
              
              const nrx = nextDot.dx * cosP - nextDot.dz * sinP;
              const nrz0 = nextDot.dx * sinP + nextDot.dz * cosP;
              const nrz = nextDot.dy * sinT + nrz0 * cosT;
              const nry = nextDot.dy * cosT - nrz0 * sinT;
              
              if (nrz > -0.1) {
                  const nx = cx + nrx * R;
                  const ny = cy - nry * R;
                  
                  const visibility = Math.max(0, Math.min(1, (rz + nrz) * 0.6));
                  if (visibility > 0) {
                      ctx.beginPath();
                      ctx.moveTo(mx, my);
                      const midX = (mx + nx) / 2;
                      const midY = (my + ny) / 2;
                      const offsetX = (midX - cx) * 0.25;
                      const offsetY = (midY - cy) * 0.25;
                      ctx.quadraticCurveTo(midX + offsetX, midY + offsetY, nx, ny);
                      
                      const grad = ctx.createLinearGradient(mx, my, nx, ny);
                      grad.addColorStop(0, hub.color);
                      grad.addColorStop(1, nextHub.color);
                      
                      ctx.strokeStyle = grad;
                      ctx.globalAlpha = 0.1 * visibility;
                      ctx.setLineDash([4, 4]);
                      ctx.stroke();
                      ctx.setLineDash([]);
                  }
              }
          });
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
