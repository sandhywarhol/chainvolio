"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Globe, ShieldCheck, Users, Activity, CheckCircle2, Zap, Star, ChevronDown, AlertTriangle, TrendingUp, Wallet } from "lucide-react";
import { getVerificationLabel, getBadgeStyles } from "@/lib/paymentConfig";
import { Toast } from "@/components/ui/Toast";

// ─── Types (mirror the CV page shape) ─────────────────────────────────────────
type Profile = {
  displayName: string;
  bio: string;
  skills: string;
  twitter?: string;
  github?: string;
  website?: string;
  discord?: string;
  email?: string;
  country?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  verifierTier?: number;
  verificationType?: string;
  verificationTier?: string;
  role?: string;
  organization?: string;
  linkedin?: string;
  location?: string;
  cardNumber?: number;
};

type Receipt = {
  id: string;
  role: string;
  org: string;
  description: string;
  status: string;
  attesterName?: string;
  attesterWallet?: string;
  attesterAvatar?: string;
  attesterRole?: string;
  attesterOrg?: string;
  isAttesterVerified?: boolean;
  attestationType?: string;
  startDate: string;
  endDate: string;
  workType?: string;
  createdAt: string;
};

type Props = {
  profile: Profile;
  receipts: Receipt[];
  scoreData: any;
  wallet: string;
};

// ─── Threshold for "Top Contributor" tag ──────────────────────────────────────
// A member row is considered a top contributor if their record is attested AND
// they appear among the top-3 most common orgs in this community's records.
function getTopOrgs(receipts: Receipt[], topN = 3): Set<string> {
  const freq: Record<string, number> = {};
  receipts.forEach((r) => {
    if (r.org) freq[r.org] = (freq[r.org] || 0) + 1;
  });
  return new Set(
    Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([org]) => org)
  );
}

// ─── Member Row ───────────────────────────────────────────────────────────────
function MemberRow({
  receipt,
  isTop,
  accentHex,
}: {
  receipt: Receipt;
  isTop: boolean;
  accentHex: string;
}) {
  const name = receipt.role || receipt.org || "Contributor";
  const isVerified = receipt.status === "Attested";

  return (
    <div className="flex items-center justify-between gap-3 py-3.5 border-b border-white/5 last:border-0 group">
      {/* Avatar stub + name */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border"
          style={{
            background: isVerified ? `${accentHex}12` : "rgba(255,255,255,0.03)",
            borderColor: isVerified ? `${accentHex}30` : "rgba(255,255,255,0.08)",
          }}
        >
          <Users
            className="w-3.5 h-3.5"
            style={{ color: isVerified ? accentHex : "#64748b" }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate leading-tight">{name}</p>
          {receipt.org && receipt.role && (
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {receipt.workType || "Contribution"}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isTop && (
          <span className="inline-flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest text-amber-400 bg-amber-500/10 border-amber-500/20">
            <Star className="w-2 h-2" /> Top
          </span>
        )}
        <span
          className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest ${
            isVerified
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-white/[0.03] text-slate-500 border-white/8"
          }`}
        >
          {isVerified ? "✓ Verified" : "Recorded"}
        </span>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  accentHex,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accentHex?: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-white/[0.025] border border-white/5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p
        className="text-2xl font-black leading-none"
        style={{ color: accentHex || "white" }}
      >
        {value}
      </p>
      {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
    </div>
  );
}

// ─── Score Factor Row ─────────────────────────────────────────────────────────
function ScoreFactorRow({
  label,
  weight,
  value,
  tooltip,
  accentHex,
  badgeText,
  hintText,
}: {
  label: string;
  weight: number;   // e.g. 40 = 40%
  value: number;    // 0–100 estimated factor score
  tooltip: string;
  accentHex: string;
  badgeText?: string;
  hintText?: React.ReactNode;
}) {
  const [showTip, setShowTip] = useState(false);
  // Weighted contribution: value * (weight/100)
  const contribution = Math.round(value * (weight / 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        {/* Label + tooltip trigger */}
        <div className="flex items-center gap-1.5 relative">
          <button
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            className="flex items-center gap-1.5 cursor-default focus:outline-none"
          >
            <span className="text-[11px] font-semibold text-slate-300">{label}</span>
            <span className="text-[9px] text-slate-600 font-bold">({weight}%)</span>
          </button>
          {/* Tooltip */}
          {showTip && (
            <div
              className="absolute left-0 bottom-full mb-1.5 z-20 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-200 font-medium whitespace-nowrap pointer-events-none"
              style={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
            >
              {tooltip}
            </div>
          )}
        </div>

        {/* Right side: optional custom badge & percentage */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {badgeText && (
            <span className="text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest text-slate-400 bg-slate-800 border-slate-700">
              {badgeText}
            </span>
          )}
          <span
            className="text-[11px] font-black tabular-nums"
            style={{ color: accentHex }}
          >
            {contribution > 0 ? `${contribution}pts` : "—"}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${accentHex}90, ${accentHex})`,
          }}
        />
      </div>
      
      {/* Subtle Hint String */}
      {hintText && (
        <div className="pt-0.5">{hintText}</div>
      )}
    </div>
  );
}

// ─── Score Hero ───────────────────────────────────────────────────────────────
function ScoreHero({
  score,
  accentHex,
  tierLabel,
  receipts,
  isVerified,
}: {
  score: number;
  accentHex: string;
  tierLabel: string;
  receipts: any[];
  isVerified?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + 8,
          left: rect.left - 260 + rect.width,
        });
      }
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const scoreValue = score;
  const displayScore = isVerified
    ? Math.min(100, Math.max(50, scoreValue + 5))
    : scoreValue;

  const attested  = receipts.filter(r => r.status === "Attested").length;
  const total     = receipts.length || 1;
  const uniqueOrgs = new Set(receipts.map(r => r.org).filter(Boolean)).size;

  const sortedReceipts = [...receipts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const latestActivity = sortedReceipts.length > 0 ? sortedReceipts[0].createdAt : null;
  const daysAgo = latestActivity ? Math.floor((Date.now() - new Date(latestActivity).getTime()) / (1000 * 60 * 60 * 24)) : null;

  let activityScore = 0;
  let activityBadgeText = "Inactive";

  if (daysAgo === null) {
      activityScore = 0;
  } else if (daysAgo < 30) {
      activityScore = 100;
      activityBadgeText = "Active";
  } else if (daysAgo < 60) {
      activityScore = 75;
      activityBadgeText = "Growing";
  } else if (daysAgo < 90) {
      activityScore = 50;
      activityBadgeText = "Low activity";
  } else {
      activityScore = 25;
  }

  const activityHint = (
    <div className="flex flex-col gap-0.5 text-[10px] font-medium mt-1">
      <p className="text-slate-400">{daysAgo !== null ? `Last activity: ${daysAgo === 0 ? 'Today' : `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`}` : "No recent activity"}</p>
    </div>
  );

  const memberQuality        = Math.min(100, Math.round((attested / total) * 100));
  const contributionVolume   = Math.min(100, Math.round((total / 20) * 100));   // 20 records = 100%
  const diversityScore       = Math.min(100, Math.round((uniqueOrgs / 5) * 100)); // 5 orgs = 100%

  const factors = [
    { label: "Member Quality",       weight: 40, value: memberQuality,      tooltip: "Average verification rate of active members" },
    { label: "Contribution Volume",  weight: 40, value: contributionVolume,  tooltip: "Total number of contribution records on-chain" },
    { label: "Activity",             weight: 10, value: activityScore,       tooltip: "Activity relevance based on recency", badgeText: activityBadgeText, hintText: activityHint },
    { label: "Diversity",            weight: 10, value: diversityScore,      tooltip: "Variety of organizations and contribution types" },
  ];

  return (
    <>
      {/* Subtle Capsule Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300"
        style={{
          background: open ? `${accentHex}15` : "rgba(255,255,255,0.03)",
          borderColor: open ? `${accentHex}40` : "rgba(255,255,255,0.08)",
        }}
        title="View reputation insights"
      >
        <ShieldCheck
          className="w-3 h-3 transition-colors"
          style={{ color: "#10b981" }}
        />
        <span
          className="text-[9px] font-black uppercase tracking-[0.1em] transition-colors"
          style={{ color: open ? "white" : "#94a3b8" }}
        >
          Verified Community
        </span>
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
             style={{ background: `${accentHex}08` }} />
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          className="fixed z-[9999] w-[280px] p-4 rounded-xl border shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          style={{
            top: coords.top,
            left: coords.left,
            background: "#0c0e14",
            borderColor: "rgba(255,255,255,0.12)",
            boxShadow: `0 20px 50px -10px rgba(0,0,0,0.8), 0 0 15px ${accentHex}15`,
          }}
        >
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
            <div className="flex flex-col">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Reputation</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tabular-nums text-white">
                  {displayScore}
                </span>
                <span className="text-[10px] font-bold text-slate-500 mt-1">/100</span>
              </div>
            </div>
            <div className="p-1.5 rounded-lg border border-white/5 bg-white/[0.03]">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-3">
            {factors.map(f => (
              <ScoreFactorRow key={f.label} accentHex={accentHex} {...f} />
            ))}
          </div>

          <p className="text-[9px] font-medium text-slate-500 leading-relaxed mt-3 pt-3 border-t border-white/5 italic">
            Computed by ChainVolio Verified Trust Engine.
          </p>
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function CommunityCV({ profile, receipts, scoreData, wallet }: Props) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const badge = getBadgeStyles(profile.verificationType);
  const tierLabel = getVerificationLabel(profile.verificationType);
  const accentHex = badge.hex;

  // Derived stats
  const attestedCount = receipts.filter((r) => r.status === "Attested").length;
  const totalRecords = receipts.length;
  const uniqueOrgs = new Set(receipts.map((r) => r.org).filter(Boolean)).size;
  const uniqueMembers = new Set(
    receipts.map((r) => r.attesterWallet || r.role).filter(Boolean)
  ).size;

  // Top orgs for "Top Contributor" tag
  const topOrgs = getTopOrgs(receipts, 3);

  // Contribution type breakdown
  const workTypeBreakdown = receipts.reduce<Record<string, number>>((acc, r) => {
    const key = r.workType || "Other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topWorkTypes = Object.entries(workTypeBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // ── Reputation Logic (Display Only) ────────────────────────────────────────
  const scoreValue = scoreData?.score ?? 0;
  const displayScore = profile.isVerified
    ? Math.min(100, Math.max(50, scoreValue + 5))
    : scoreValue;

  const reputationSubtext =
    displayScore >= 80
      ? "High Impact Community"
      : displayScore >= 60
      ? "Growing Community"
      : displayScore >= 50
      ? "Verified Community"
      : "Early Stage Community";

  // Dynamic insight line
  const insightLine =
    totalRecords > 0
      ? `Built on ${attestedCount} verified contribution${attestedCount !== 1 ? "s" : ""} across ${uniqueMembers || totalRecords} member${uniqueMembers !== 1 ? "s" : ""}`
      : "This community is building its on-chain presence. Contributions will appear here as they are verified.";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* ── Hero Card ─────────────────────────────────────────────────────── */}
      <div
        className="relative p-6 md:p-8 rounded-2xl md:rounded-3xl overflow-hidden"
        style={{ boxShadow: `0 4px 48px ${accentHex}18` }}
      >
        {/* Background layers */}
        <div
          className="absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${accentHex}20 0%, transparent 65%)` }}
        />
        <div className="absolute inset-[1px] rounded-2xl md:rounded-3xl bg-[#0b0d12]/96 pointer-events-none" />
        <div
          className="absolute inset-0 rounded-2xl md:rounded-3xl border pointer-events-none"
          style={{ borderColor: `${accentHex}22` }}
        />

        {/* Top-Right Trigger */}
        {profile.isVerified && scoreData && (
          <div className="absolute top-6 right-6 md:top-8 md:right-8 z-30">
            <ScoreHero
              score={scoreData.score}
              accentHex={accentHex}
              tierLabel={tierLabel}
              receipts={receipts}
              isVerified={profile.isVerified}
            />
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-start gap-6 md:gap-8">
          {/* Left: Avatar */}
          <div className="flex flex-col items-center flex-shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2"
                style={{ borderColor: `${accentHex}40` }}
              />
            ) : (
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-3xl border-2"
                style={{ background: `${accentHex}10`, borderColor: `${accentHex}30` }}
              >
                🌐
              </div>
            )}

            {/* Country/Location below avatar */}
            {(profile.country || profile.location) && (
              <div className="mt-3 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-white/5 bg-white/[0.03] text-slate-500">
                📍 {profile.country || profile.location}
              </div>
            )}
          </div>

          {/* Center: Identity */}
          <div className="flex-1 min-w-0">
            {/* Name + badge */}
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-2">
              {profile.displayName}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-white/10 bg-white/[0.03] text-slate-400"
              >
                {reputationSubtext}
              </span>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-white/10 bg-white/[0.03] text-slate-400"
              >
                {attestedCount} Contributions
              </span>
            </div>

            {profile.role && (
              <p className="text-sm font-semibold text-slate-300 mb-1">{profile.role}</p>
            )}
            {profile.organization && (
              <p className="text-sm text-slate-400 mb-3">{profile.organization}</p>
            )}
            {profile.bio && (
              <div className="max-w-[700px] mt-3">
                <p className="text-[15px] text-slate-300 !leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
              {profile.twitter && (
                <a
                  href={`https://twitter.com/${profile.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
                >
                  𝕏 Twitter
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Linked In
                </a>
              )}
              {profile.discord && (
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                  💬 {profile.discord}
                </span>
              )}

              <div className="flex-1" />

              {/* Wallet & ID */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 opacity-60 hover:opacity-100 transition-opacity">
                {/* Wallet Section */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(wallet);
                    setToastMessage("Wallet address copied!");
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/10 hover:border-sky-500/40 transition-all cursor-pointer backdrop-blur-sm"
                >
                  <Wallet className="w-2.5 h-2.5 text-sky-400" />
                  <span className="font-mono text-[10px] text-slate-400">
                    {typeof wallet === 'string' ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : '0x...'}
                  </span>
                </button>

                {/* CV ID */}
                {profile?.cardNumber && (
                  <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-tight text-slate-400">
                    <span className="text-[8px] uppercase font-bold text-slate-600">ID</span>
                    <span className="font-black text-slate-300">#{String(profile?.cardNumber || 0).padStart(5, '0')}</span>
                  </div>
                )}
              </div>
            </div>



          </div>
        </div>

      </div>

      {/* ── Insight Line ─────────────────────────────────────────────────────── */}
      {totalRecords > 0 && (
        <p className="text-[12px] text-slate-400 leading-relaxed px-1 border-l-2 pl-3"
          style={{ borderColor: `${accentHex}40` }}>
          {insightLine}
        </p>
      )}

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard
          label="Verified Contributors"
          value={attestedCount}
          sub="Attested contributions"
          accentHex={accentHex}
        />
        <StatCard
          label="Total Contributions"
          value={totalRecords}
          sub="All contribution records"
        />
        <StatCard
          label="Organizations Involved"
          value={uniqueOrgs || "—"}
          sub="Distinct organizations"
        />
      </div>

      {/* ── Active Members Section ────────────────────────────────────────────── */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-1">
          <div
            className="p-2 rounded-xl"
            style={{ background: `${accentHex}15`, border: `1px solid ${accentHex}25` }}
          >
            <Users className="w-4 h-4" style={{ color: accentHex }} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Active Members</h2>
            <p className="text-[10px] text-slate-500">
              Top contributors associated with this community
            </p>
          </div>
          <span className="ml-auto text-[10px] font-black px-2 py-1 rounded border text-slate-400 border-white/10 bg-white/[0.03]">
            {totalRecords} records
          </span>
        </div>

        {/* Legend */}
        {receipts.length > 0 && (
          <div className="flex items-center gap-3 mb-4 mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded border tracking-widest text-amber-400 bg-amber-500/10 border-amber-500/20 uppercase">
                <Star className="w-2 h-2" /> Top
              </span>
              <span className="text-[10px] text-slate-500">Top contributor in this community</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/20 uppercase tracking-widest">
                ✓ Verified
              </span>
              <span className="text-[10px] text-slate-500">On-chain attested</span>
            </div>
          </div>
        )}

        {receipts.length > 0 ? (
          <div>
            {receipts.slice(0, 10).map((r) => (
              <MemberRow
                key={r.id}
                receipt={r}
                isTop={!!r.org && topOrgs.has(r.org) && r.status === "Attested"}
                accentHex={accentHex}
              />
            ))}
            {receipts.length > 10 && (
              <p className="text-[11px] text-slate-500 mt-4 text-center">
                +{receipts.length - 10} more records
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No member records yet</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Contribution records will appear here as members are verified
            </p>
          </div>
        )}
      </div>

      {/* ── Member Contribution Activity ──────────────────────────────────────── */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="p-2 rounded-xl"
            style={{ background: `${accentHex}15`, border: `1px solid ${accentHex}25` }}
          >
            <Activity className="w-4 h-4" style={{ color: accentHex }} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Member Contribution Activity
            </h2>
            <p className="text-[10px] text-slate-500">
              Distribution of contribution types across members
            </p>
          </div>
        </div>

        {topWorkTypes.length > 0 ? (
          <div className="space-y-4">
            {topWorkTypes.map(([type, count], idx) => {
              const pct = Math.round((count / totalRecords) * 100);
              const isTop = idx === 0;
              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap
                        className="w-3 h-3"
                        style={{ color: isTop ? accentHex : "#475569", opacity: isTop ? 1 : 0.7 }}
                      />
                      <span
                        className={`text-xs font-semibold ${
                          isTop ? "text-white" : "text-slate-400"
                        }`}
                      >
                        {type}
                      </span>
                      {isTop && (
                        <span
                          className="text-[8px] font-black px-1 py-0.5 rounded border uppercase tracking-widest"
                          style={{ color: accentHex, background: `${accentHex}15`, borderColor: `${accentHex}30` }}
                        >
                          Most Common
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-[10px] font-bold text-slate-400">
                        {count} · {pct}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: isTop ? accentHex : "#334155",
                        opacity: isTop ? 0.85 : 0.55,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No activity data yet</p>
          </div>
        )}
      </div>

      {/* ── Trust Signals ───────────────────────────────────────────────────── */}
      <div className="mt-4 pt-6 border-t border-white/5 space-y-2">
        {[
          "Verified Community Identity",
          "On-chain Contribution Records",
          "Collective Attestation Authority",
        ].map((s) => (
          <div
            key={s}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-400"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {s}
          </div>
        ))}
      </div>
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
