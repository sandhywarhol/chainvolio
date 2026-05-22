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

// ─── spherical linear interpolation ──────────────────────────────────────────

function slerp(
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number,
  t: number
): [number, number, number] {
  const cosA = Math.max(-1, Math.min(1, ax * bx + ay * by + az * bz));
  const omega = Math.acos(cosA);
  if (omega < 0.0001) return [ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t];
  const sinOmega = Math.sin(omega);
  const s0 = Math.sin((1 - t) * omega) / sinOmega;
  const s1 = Math.sin(t * omega) / sinOmega;
  return [s0 * ax + s1 * bx, s0 * ay + s1 * by, s0 * az + s1 * bz];
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
  const dimsRef = useRef({ w: 0, h: 0 });
  const [dimsReady, setDimsReady] = useState(false); // fires once when dims first become non-zero
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
      const colors = ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"];

      // Create 5 hubs spread across the globe — ensures front-face coverage during rotation
      for (let i = 0; i < 5; i++) {
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
          
          // Build local tangent frame at hub for angular spread measurement
          const hx = d[hubIdx * 4], hy = d[hubIdx * 4 + 1], hz = d[hubIdx * 4 + 2];
          let nnx = hz, nny = 0, nnz = -hx;
          if (Math.abs(hy) >= 0.9) { nnx = 0; nny = hz; nnz = -hy; }
          const nnLen = Math.hypot(nnx, nny, nnz) || 1;
          nnx /= nnLen; nny /= nnLen; nnz /= nnLen;
          const nex = hy * nnz - hz * nny, ney = hz * nnx - hx * nnz, nez = hx * nny - hy * nnx;

          // Pick exactly 5 targets, each in a distinct angular sector (~72° apart)
          const targets: number[] = [];
          const targetAngles: number[] = [];
          const MIN_ANG_SEP = (Math.PI * 2) / 5 * 0.55; // ~40° min separation
          let attempts = 0;
          while (targets.length < 5 && attempts < 1000) {
              attempts++;
              const targetIdx = Math.floor(Math.random() * n);
              const tx = d[targetIdx * 4], ty = d[targetIdx * 4 + 1], tz = d[targetIdx * 4 + 2];
              if (Math.hypot(hx - tx, hy - ty, hz - tz) < 0.6) continue;
              // Project onto hub tangent plane to measure angular direction
              const dot = hx * tx + hy * ty + hz * tz;
              const tanX = tx - dot * hx, tanY = ty - dot * hy, tanZ = tz - dot * hz;
              const angle = Math.atan2(tanX * nex + tanY * ney + tanZ * nez,
                                       tanX * nnx + tanY * nny + tanZ * nnz);
              // Reject if angularly too close to any existing target
              let tooClose = false;
              for (const a of targetAngles) {
                  let diff = Math.abs(angle - a);
                  if (diff > Math.PI) diff = 2 * Math.PI - diff;
                  if (diff < MIN_ANG_SEP) { tooClose = true; break; }
              }
              if (!tooClose) { targets.push(targetIdx); targetAngles.push(angle); }
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

  // Observe container size — store in ref to avoid restarting the animation loop on every resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = (w: number, h: number) => {
      dimsRef.current = { w: Math.round(w), h: Math.round(h) };
      if (!dimsReady && w > 0) setDimsReady(true); // one-time trigger to start the render loop
    };
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      update(width, height);
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    update(r.width, r.height);
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Render loop — depends only on ready/visible/dimsReady to avoid restarting on every resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dimsReady || !ready || !isVisible) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
        phiRef.current += 0.0038;
      }
      timeRef.current += 1;

      const { w, h } = dimsRef.current;
      const size = Math.max(w, h);
      const targetPx = Math.round(size * dpr);
      if (canvas!.width !== targetPx || canvas!.height !== targetPx) {
        canvas!.width = targetPx;
        canvas!.height = targetPx;
      }

      const dots = dotsRef.current;
      const n = dots.length / 4;
      const R = (Math.min(w, h) / 2) * dpr;
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
        const offX = (size - w) / 2;
        const offY = (size - h) / 2;
        curCX = (cur.x * w + offX) * dpr;
        curCY = (cur.y * h + offY) * dpr;
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


        const isHub = networkRef.current?.hubs.some(h => h.idx === i);

        let alpha: number, radius: number;

        if (isHub || elev > 0.01) {
          // Hub / elevated dots: subtle pulse so they feel alive
          const pulse = (
            Math.sin(time * (0.012 + rand * 0.008) + rand * 20) * 0.7 +
            Math.sin(time * (0.03 + rand * 0.015) + rand * 10) * 0.3
          ) * 0.5 + 0.5;
          alpha = Math.min(0.95, (0.35 + depth * 0.45 + elev * 0.5) * (0.75 + rand * 0.25) * (0.85 + pulse * 0.15));
          radius = (0.8 + depth * 0.8 + elev * 2.2 + pulse * 0.3) * dpr;
        } else {
          // Background dots: deeper contrast so backside fades out and frontside pops
          alpha = (0.04 + depth * 0.62) * (0.5 + rand * 0.5);
          radius = (0.1 + Math.pow(rand, 2) * 1.4 + depth * 0.7) * dpr;
        }

        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Glow only for actual hub dots — no glow on random background dots
        if (isHub) {
          const hubColor = networkRef.current?.hubs.find(h => h.idx === i)?.color;
          ctx.globalAlpha = alpha * 0.35;
          ctx.beginPath();
          ctx.arc(sx, sy, radius * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = hubColor || "#ffffff";
          ctx.fill();
        }
      }

      // ── Pass 3: Elevated Geodesic Burst + Persistent Growing Trace ──────────
      if (networkRef.current && networkRef.current.hubs.length > 0) {
          const hubs = networkRef.current.hubs;
          const GEO_STEPS = 44;
          const TRACE_STEPS = 32;
          const isHovering = pauseRef.current;
          // CYCLE: travel=1.0 + dissolve=0.2 + silent=0.08 = 1.28 total per hub
          const CYCLE = 1.28;
          const DISSOLVE_DURATION = 0.2; // trail fades quickly after comet arrives
          const flowSpeed = isHovering ? 0.006 : 0.0028;

          hubs.forEach((hub, hubIdx) => {
              const hax = dots[hub.idx * 4];
              const hay = dots[hub.idx * 4 + 1];
              const haz = dots[hub.idx * 4 + 2];

              const hrx = hax * cosP - haz * sinP;
              const hrz0h = hax * sinP + haz * cosP;
              const hrza = hay * sinT + hrz0h * cosT;
              const hrya = hay * cosT - hrz0h * sinT;

              // Soft fade as hub approaches back of globe — no hard cutoff
              const hubVis = Math.max(0, Math.min(1, (hrza + 0.25) / 0.35));
              if (hubVis <= 0) return;

              const hmx = cx + hrx * R;
              const hmy = cy - hrya * R;

              // Hubs fire in sequence — offset evenly across the cycle
              const hubOffset = (hubIdx / hubs.length) * CYCLE;
              const hubRaw = (time * flowSpeed + hubOffset) % CYCLE;
              const isTraveling = hubRaw <= 1.0;
              const isDissolving = !isTraveling && hubRaw <= 1.0 + DISSOLVE_DURATION;

              const burstProg = isTraveling ? hubRaw : 1.0;
              const fadeIn = Math.min(1, burstProg / 0.05);
              // Trail: builds up during travel, dissolves smoothly right after arrival
              const trailMult = isTraveling
                  ? fadeIn
                  : isDissolving
                      ? 1 - (hubRaw - 1.0) / DISSOLVE_DURATION
                      : 0;

              hub.targets.forEach((targetIdx, tIdx) => {
                  const tax = dots[targetIdx * 4];
                  const tay = dots[targetIdx * 4 + 1];
                  const taz = dots[targetIdx * 4 + 2];

                  const trz0t = tax * sinP + taz * cosP;
                  const trza = tay * sinT + trz0t * cosT;

                  // Soft fade for target edge — no hard cutoff
                  const targetVis = Math.max(0, Math.min(1, (trza + 0.25) / 0.35));
                  if (targetVis <= 0) return;

                  const visibility = hubVis * targetVis * Math.max(0, Math.min(1, (hrza + trza + 0.5) * 0.6));
                  if (visibility <= 0.01) return;

                  // Per-arc orbital elevation: 0.08–0.40, stable (seeded by index)
                  const elevFactor = 0.08 + ((hubIdx * 13 + tIdx * 7) % 9) / 9 * 0.32;

                  // Project elevated arc point at param tp.
                  // Rotation is linear so rotate(scale*p) = scale * rotate(p).
                  const proj = (tp: number): [number, number] | null => {
                      const [gx, gy, gz] = slerp(hax, hay, haz, tax, tay, taz, tp);
                      const grx = gx * cosP - gz * sinP;
                      const grz0 = gx * sinP + gz * cosP;
                      const grz = gy * sinT + grz0 * cosT;
                      const gry = gy * cosT - grz0 * sinT;
                      const scale = 1 + elevFactor * Math.sin(Math.PI * tp);
                      if (grz * scale < -0.04) return null;
                      return [cx + grx * scale * R, cy - gry * scale * R];
                  };

                  // ── Base arc (ghost path, always visible, very dim) ──
                  ctx.strokeStyle = hub.color;
                  ctx.globalAlpha = 0.03 * visibility;
                  ctx.lineWidth = 0.25 * dpr;
                  let inPath = false;
                  ctx.beginPath();
                  for (let s = 0; s <= GEO_STEPS; s++) {
                      const pt = proj(s / GEO_STEPS);
                      if (!pt) {
                          if (inPath) { ctx.stroke(); ctx.beginPath(); inPath = false; }
                          continue;
                      }
                      if (!inPath) { ctx.moveTo(pt[0], pt[1]); inPath = true; }
                      else ctx.lineTo(pt[0], pt[1]);
                  }
                  if (inPath) ctx.stroke();

                  if (trailMult <= 0) return; // silent phase

                  // ── Persistent trace: grows from hub → comet, stays through fade ──
                  // Linear gradient: dim at hub (0.22) → bright near head (0.70)
                  ctx.lineWidth = (isHovering ? 0.9 : 0.55) * dpr;
                  ctx.strokeStyle = hub.color;
                  for (let s = 0; s < TRACE_STEPS; s++) {
                      const tp0 = (s / TRACE_STEPS) * burstProg;
                      const tp1 = ((s + 1) / TRACE_STEPS) * burstProg;
                      const pt0 = proj(tp0);
                      const pt1 = proj(tp1);
                      if (!pt0 || !pt1) continue;
                      const segBright = 0.22 + 0.48 * (s / TRACE_STEPS);
                      ctx.globalAlpha = segBright * trailMult * visibility;
                      ctx.beginPath();
                      ctx.moveTo(pt0[0], pt0[1]);
                      ctx.lineTo(pt1[0], pt1[1]);
                      ctx.stroke();
                  }

                  // ── Comet head + smooth tapered tail (travel phase only) ──
                  if (!isTraveling) return;
                  const fadeOut = Math.min(1, (1 - burstProg) / 0.06);
                  const headMult = fadeIn * fadeOut;
                  if (headMult < 0.01) return;

                  const HEAD_N = 38;
                  const HEAD_STEP = 0.007;
                  const maxTailW = (isHovering ? 3.2 : 2.4) * dpr;

                  // Draw tail segments back→front (dim/thin first, bright/thick last)
                  // Round lineCap fills the gap between segments → no breaks
                  ctx.lineCap = "round";
                  ctx.strokeStyle = hub.color;
                  for (let j = HEAD_N - 1; j >= 1; j--) {
                      const tpA = Math.max(0, burstProg - (j - 1) * HEAD_STEP);
                      const tpB = Math.max(0, burstProg - j * HEAD_STEP);
                      const ptA = proj(tpA);
                      const ptB = proj(tpB);
                      if (!ptA || !ptB) continue;
                      const fade = Math.pow(1 - j / HEAD_N, 1.8) * headMult;
                      ctx.globalAlpha = 0.88 * visibility * fade;
                      ctx.lineWidth = maxTailW * Math.pow(1 - j / HEAD_N, 0.5);
                      ctx.beginPath();
                      ctx.moveTo(ptB[0], ptB[1]);
                      ctx.lineTo(ptA[0], ptA[1]);
                      ctx.stroke();
                  }
                  ctx.lineCap = "butt";

                  // Head bloom drawn on top of tail
                  const ptHead = proj(burstProg);
                  if (ptHead) {
                      ctx.globalAlpha = 0.95 * visibility * headMult;
                      ctx.shadowBlur = 14 * dpr;
                      ctx.shadowColor = hub.color;
                      ctx.fillStyle = hub.color;
                      ctx.beginPath();
                      ctx.arc(ptHead[0], ptHead[1], (isHovering ? 2.6 : 2.0) * dpr, 0, Math.PI * 2);
                      ctx.fill();
                      ctx.shadowBlur = 0;
                  }
              });

              // ── Cross-hub geodesic connection ──
              const nextHub = hubs[(hubIdx + 1) % hubs.length];
              const nax = dots[nextHub.idx * 4];
              const nay = dots[nextHub.idx * 4 + 1];
              const naz = dots[nextHub.idx * 4 + 2];
              const nrx = nax * cosP - naz * sinP;
              const nrz0n = nax * sinP + naz * cosP;
              const nrzan = nay * sinT + nrz0n * cosT;
              const nryan = nay * cosT - nrz0n * sinT;
              const nextHubVis = Math.max(0, Math.min(1, (nrzan + 0.25) / 0.35));
              if (nextHubVis <= 0) return;
              const vnx = cx + nrx * R;
              const vny = cy - nryan * R;
              const vis2 = hubVis * nextHubVis * Math.max(0, Math.min(1, (hrza + nrzan + 0.5) * 0.5));
              if (vis2 <= 0.01) return;

              const grad = ctx.createLinearGradient(hmx, hmy, vnx, vny);
              grad.addColorStop(0, hub.color);
              grad.addColorStop(1, nextHub.color);
              ctx.strokeStyle = grad;
              ctx.globalAlpha = 0.09 * vis2;
              ctx.lineWidth = 0.4 * dpr;
              ctx.setLineDash([4 * dpr, 5 * dpr]);

              let inPath2 = false;
              ctx.beginPath();
              for (let s = 0; s <= GEO_STEPS; s++) {
                  const tp = s / GEO_STEPS;
                  const [gx, gy, gz] = slerp(hax, hay, haz, nax, nay, naz, tp);
                  const grx = gx * cosP - gz * sinP;
                  const grz0 = gx * sinP + gz * cosP;
                  const grz = gy * sinT + grz0 * cosT;
                  const gry = gy * cosT - grz0 * sinT;
                  if (grz < -0.04) {
                      if (inPath2) { ctx.stroke(); ctx.beginPath(); inPath2 = false; }
                      continue;
                  }
                  const gsx = cx + grx * R;
                  const gsy = cy - gry * R;
                  if (!inPath2) { ctx.moveTo(gsx, gsy); inPath2 = true; }
                  else ctx.lineTo(gsx, gsy);
              }
              if (inPath2) ctx.stroke();
              ctx.setLineDash([]);
          });
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dimsReady, ready, isVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── mouse handling ────────────────────────────────────────────────────────
  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const { w, h } = dimsRef.current;
    const sz = Math.max(w, h) || 1;
    const cx = nx * (w / sz) + (sz - w) / 2 / sz;
    const cy = ny * (h / sz) + (sz - h) / 2 / sz;
    const onGlobe = Math.hypot(cx - 0.5, cy - 0.5) < 0.47;
    pauseRef.current = onGlobe;
    cursorRef.current = onGlobe ? { x: nx, y: ny } : null;
  }

  function onMouseLeave() {
    pauseRef.current = false;
    cursorRef.current = null;
  }

  const { w: dw, h: dh } = dimsRef.current;
  const size = Math.max(dw, dh) || 0;
  const offL = -(size - dw) / 2;
  const offT = -(size - dh) / 2;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className ?? ""}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {dimsReady && (
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
