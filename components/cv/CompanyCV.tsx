"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  Briefcase,
  Users,
  Globe,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Building2,
  Clock,
  ChevronDown,
  AlertTriangle,
  Info,
  Wallet,
} from "lucide-react";
import { getVerificationLabel, getBadgeStyles } from "@/lib/paymentConfig";
import { Toast } from "@/components/ui/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────
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
  workType?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
};

type Props = {
  profile: Profile;
  receipts: Receipt[];
  scoreData: any;
  wallet: string;
};

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
  weight: number;
  value: number;
  tooltip: string;
  accentHex: string;
  badgeText?: string;
  hintText?: React.ReactNode;
}) {
  const [showTip, setShowTip] = useState(false);
  const contribution = Math.round(value * (weight / 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 relative">
          <button
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            className="flex items-center gap-1.5 cursor-default focus:outline-none"
          >
            <span className="text-[11px] font-semibold text-slate-300">{label}</span>
            <span className="text-[9px] text-slate-600 font-bold">({weight}%)</span>
          </button>
          {showTip && (
            <div
              className="absolute left-0 bottom-full mb-1.5 z-20 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-200 font-medium whitespace-nowrap pointer-events-none"
              style={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
            >
              {tooltip}
            </div>
          )}
        </div>
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
  receipts,
  isVerified,
}: {
  score: number;
  accentHex: string;
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
        // Position below trigger, aligned to right
        setCoords({
          top: rect.bottom + 8,
          left: rect.left - 260 + rect.width, // shift left to keep popover on screen
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

  const attested      = receipts.filter(r => r.status === "Attested").length;
  const total         = receipts.length || 1;
  const withDates     = receipts.filter(r => r.startDate && r.endDate).length;

  const sortedReceipts = [...receipts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const latestActivity = sortedReceipts.length > 0 ? sortedReceipts[0].createdAt : null;
  const daysAgo = latestActivity ? Math.floor((Date.now() - new Date(latestActivity).getTime()) / (1000 * 60 * 60 * 24)) : null;

  let activityScore = 0;
  let activityBadgeText = "No recent hiring activity";

  if (daysAgo === null) {
      activityScore = 0;
  } else if (daysAgo < 60) {
      activityScore = 100;
      activityBadgeText = "Active";
  } else if (daysAgo < 120) {
      activityScore = 75;
      activityBadgeText = "Stable";
  } else if (daysAgo < 180) {
      activityScore = 50;
      activityBadgeText = "No recent activity";
  } else {
      activityScore = 25;
      activityBadgeText = "No recent activity";
  }

  const activityHint = (
    <div className="flex flex-col gap-0.5 text-[10px] font-medium mt-1">
      <p className="text-slate-400">{daysAgo !== null ? `Last activity: ${daysAgo === 0 ? 'Today' : `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`}` : "No recent activity"}</p>
    </div>
  );

  const talentQuality      = Math.min(100, Math.round((attested / total) * 100));
  const endorsementVolume  = Math.min(100, Math.round((total / 20) * 100));
  const consistencyScore   = Math.min(100, Math.round((withDates / total) * 100));

  const factors = [
    { label: "Talent Quality",      weight: 40, value: talentQuality,     tooltip: "Average score of endorsed talent" },
    { label: "Endorsement Volume",  weight: 40, value: endorsementVolume,  tooltip: "Total number of talent records you have endorsed" },
    { label: "Activity",            weight: 10, value: activityScore,      tooltip: "Activity relevance based on recency", badgeText: activityBadgeText, hintText: activityHint },
    { label: "Consistency",         weight: 10, value: consistencyScore,   tooltip: "How consistently you document hiring records" },
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
          Verified Org
        </span>
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
             style={{ background: `${accentHex}08` }} />
      </button>

      {/* Popover content rendered via Portal */}
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  accentHex,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accentHex?: string;
  icon?: React.FC<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.025] border border-white/5">
      {Icon && (
        <Icon
          className="w-4 h-4 mb-0.5"
          // @ts-ignore — style prop is valid on SVG elements
          style={{ color: accentHex || "#64748b" }}
        />
      )}
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

// ─── Endorsed Talent Row ──────────────────────────────────────────────────────
function EndorsedTalentRow({
  receipt,
  accentHex,
}: {
  receipt: Receipt;
  accentHex: string;
}) {
  const name = receipt.attesterName || receipt.role || "Unknown";
  const roleLabel = receipt.attesterRole || receipt.org || null;
  const isHiringProof = receipt.attestationType === "Hiring Proof";
  const isAttested = receipt.status === "Attested";

  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-white/5 last:border-0 group">
      {/* Avatar + info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {receipt.attesterAvatar ? (
            <img
              src={receipt.attesterAvatar}
              alt={name}
              className="w-9 h-9 rounded-full object-cover border"
              style={{ borderColor: `${accentHex}30` }}
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border"
              style={{
                background: `${accentHex}10`,
                borderColor: `${accentHex}25`,
                color: accentHex,
              }}
            >
              {name[0]?.toUpperCase() || "?"}
            </div>
          )}
          {/* Verified tick overlay */}
          {isAttested && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border"
              style={{ background: "#10b981", borderColor: "#0b0d12" }}
            >
              <CheckCircle2 className="w-2 h-2 text-white" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Name / role */}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate leading-tight">{name}</p>
          {roleLabel && (
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{roleLabel}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isHiringProof && (
          <span
            className="text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest"
            style={{
              color: accentHex,
              background: `${accentHex}12`,
              borderColor: `${accentHex}30`,
            }}
          >
            Hired
          </span>
        )}
        <span
          className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest ${
            isAttested
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-white/[0.03] text-slate-500 border-white/8"
          }`}
        >
          {isAttested ? "Endorsed" : "Signed"}
        </span>
      </div>
    </div>
  );
}

// ─── Hiring Activity Timeline Item ────────────────────────────────────────────
function HiringTimelineItem({
  receipt,
  accentHex,
  isLast,
}: {
  receipt: Receipt;
  accentHex: string;
  isLast: boolean;
}) {
  const isHiringProof = receipt.attestationType === "Hiring Proof";
  const isAttested = receipt.status === "Attested";

  const actionLabel = isHiringProof
    ? "Issued hiring proof for"
    : isAttested
    ? "Endorsed"
    : "Reviewed";

  const date = receipt.createdAt
    ? new Date(receipt.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex gap-3 group">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
          style={{ background: isHiringProof ? accentHex : isAttested ? "#10b981" : "#334155" }}
        />
        {!isLast && <div className="w-px flex-1 bg-white/5 mt-1 min-h-[20px]" />}
      </div>

      {/* Content */}
      <div className="pb-4 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 leading-snug">
              <span className="font-bold text-slate-300">{actionLabel}</span>{" "}
              <span className="text-white font-semibold">{receipt.role || receipt.org || "a candidate"}</span>
              {receipt.org && receipt.role && (
                <span className="text-slate-500"> · {receipt.org}</span>
              )}
            </p>
            {isHiringProof && (
              <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-2 h-2" /> On-chain verified
              </span>
            )}
          </div>
          {date && (
            <span className="text-[9px] font-mono text-slate-600 flex-shrink-0 pt-0.5">{date}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function CompanyCV({ profile, receipts, scoreData, wallet }: Props) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const badge = getBadgeStyles(profile.verificationType);
  const accentHex = badge.hex;
  const tierLabel = getVerificationLabel(profile.verificationType);

  // Derived data
  const endorsedEntries = receipts.filter((r) => r.status === "Attested");
  const hiringProofs = receipts.filter((r) => r.attestationType === "Hiring Proof");
  const allActivity = [...receipts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalAttested = endorsedEntries.length;
  const totalHiring = hiringProofs.length;
  const totalRecords = receipts.length;

  // Unique candidates touched (use attesterWallet as proxy)
  const uniqueCandidates = new Set(
    receipts.map((r) => r.attesterWallet || r.role).filter(Boolean)
  ).size;

  // ── Reputation Logic (Display Only) ────────────────────────────────────────
  const scoreValue = scoreData?.score ?? 0;
  const displayScore = profile.isVerified
    ? Math.min(100, Math.max(50, scoreValue + 5))
    : scoreValue;

  const reputationSubtext =
    displayScore >= 80
      ? "Elite Hiring Entity"
      : displayScore >= 60
      ? "Trusted Company"
      : displayScore >= 50
      ? "Verified Company"
      : "Emerging Organization";

  // Insight line
  const insightLine =
    totalRecords > 0
      ? `Endorsed ${totalAttested} talent${totalAttested !== 1 ? "s" : ""} with verified contribution records`
      : "This organization is establishing its hiring presence on ChainVolio.";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

      {/* ── 1. Hero Card ──────────────────────────────────────────────────────── */}
      <div
        className="relative p-6 md:p-8 rounded-2xl md:rounded-3xl overflow-hidden"
        style={{ boxShadow: `0 4px 48px ${accentHex}18` }}
      >
        {/* Background layers */}
        <div
          className="absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${accentHex}22 0%, transparent 65%)` }}
        />
        <div className="absolute inset-[1px] rounded-2xl md:rounded-3xl bg-[#0a0b0f]/97 pointer-events-none" />
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
               receipts={receipts}
               isVerified={profile.isVerified}
             />
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-start gap-6 md:gap-8">
          {/* Logo */}
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
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center border-2"
                style={{ background: `${accentHex}10`, borderColor: `${accentHex}30` }}
              >
                <Building2 className="w-8 h-8" style={{ color: accentHex, opacity: 0.7 }} />
              </div>
            )}

            {/* Country/Location below avatar */}
            {(profile.country || profile.location) && (
              <div className="mt-3 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-white/5 bg-white/[0.03] text-slate-500">
                📍 {profile.country || profile.location}
              </div>
            )}
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
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
                {totalAttested} Endorsements
              </span>
            </div>

            {profile.role && (
              <p className="text-sm font-semibold text-slate-300 mb-0.5">{profile.role}</p>
            )}
            {profile.organization && (
              <p className="text-sm text-slate-500 mb-3">{profile.organization}</p>
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
              <div className="flex-1" />

              {/* Wallet & ID */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 opacity-60 hover:opacity-100 transition-opacity">
                {/* Wallet Section */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(wallet);
                    setToastMessage("Wallet address copied!");
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer backdrop-blur-sm"
                >
                  <Wallet className="w-2.5 h-2.5 text-emerald-400" />
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

      {/* ── 2. Insight Line ────────────────────────────────────────────────────── */}
      <p
        className="text-[12px] text-slate-400 leading-relaxed px-1 border-l-2 pl-3"
        style={{ borderColor: `${accentHex}50` }}
      >
        {insightLine}
      </p>

      {/* ── 3. Metrics Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Endorsed Talents"
          value={totalAttested}
          sub="Verified attestations"
          accentHex={accentHex}
          icon={UserCheck as any}
        />
        <StatCard
          label="Hiring Activities"
          value={totalHiring}
          sub="On-chain validated"
          accentHex={accentHex}
          icon={Briefcase as any}
        />
        <StatCard
          label="Total Records"
          value={totalRecords}
          sub="All interactions"
          icon={TrendingUp as any}
        />
        <StatCard
          label="Verification"
          value={tierLabel}
          sub="ChainVolio verified"
          icon={ShieldCheck as any}
        />
      </div>

      {/* ── 4. Endorsed Talent ─────────────────────────────────────────────────── */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="p-2 rounded-xl"
            style={{ background: `${accentHex}15`, border: `1px solid ${accentHex}25` }}
          >
            <UserCheck className="w-4 h-4" style={{ color: accentHex }} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Endorsed Talent
            </h2>
            <p className="text-[10px] text-slate-500">
              Professionals verified by this organization
            </p>
          </div>
          <span className="ml-auto text-[10px] font-black px-2 py-1 rounded border text-slate-400 border-white/10 bg-white/[0.03]">
            {totalAttested} total
          </span>
        </div>

        {endorsedEntries.length > 0 ? (
          <div>
            {endorsedEntries.slice(0, 10).map((r) => (
              <EndorsedTalentRow key={r.id} receipt={r} accentHex={accentHex} />
            ))}
            {endorsedEntries.length > 10 && (
              <p className="text-[11px] text-slate-500 mt-4 text-center">
                +{endorsedEntries.length - 10} more endorsements
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <UserCheck className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No talent endorsed yet</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Attestations given by this organization will appear here
            </p>
          </div>
        )}
      </div>

      {/* ── 5. Hiring Activity Timeline ─────────────────────────────────────────── */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2 rounded-xl"
            style={{ background: `${accentHex}15`, border: `1px solid ${accentHex}25` }}
          >
            <Briefcase className="w-4 h-4" style={{ color: accentHex }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Hiring Activity
            </h2>
            <p className="text-[10px] text-slate-500">
              Chronological record of endorsements and hiring proofs
            </p>
          </div>
          <span className="ml-auto text-[10px] font-black px-2 py-1 rounded border text-slate-400 border-white/10 bg-white/[0.03]">
            {allActivity.length} event{allActivity.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Hiring Summary Banner ────────────────────────────────────── */}
        <div
          className="flex flex-wrap items-center gap-3 mb-5 px-3 py-2.5 rounded-xl border"
          style={{ background: `${accentHex}08`, borderColor: `${accentHex}20` }}
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5" style={{ color: accentHex }} />
            <span className="text-[11px] font-bold text-slate-300">
              Endorsed{" "}
              <span style={{ color: accentHex }} className="font-black">{totalAttested}</span>{" "}
              talent{totalAttested !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-400">
              Active hiring:{" "}
              <span className="text-slate-300 font-black">{totalHiring}</span>
            </span>
          </div>
        </div>

        {allActivity.length > 0 ? (
          <div>
            {allActivity.slice(0, 12).map((r, i) => (
              <HiringTimelineItem
                key={r.id}
                receipt={r}
                accentHex={accentHex}
                isLast={i === Math.min(allActivity.length, 12) - 1}
              />
            ))}
            {allActivity.length > 12 && (
              <p className="text-[11px] text-slate-500 mt-2 pl-5">
                +{allActivity.length - 12} more events
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No activity recorded yet</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Endorsements and hiring proofs will appear here
            </p>
          </div>
        )}
      </div>

      {/* ── 6. Trust Signals ────────────────────────────────────────────────────── */}
      <div className="mt-4 pt-6 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Verified Organization Identity", icon: ShieldCheck },
            { label: "On-chain Attestation Authority", icon: CheckCircle2 },
            { label: "Institutional Trust Signal", icon: TrendingUp },
          ].map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2 p-3 rounded-xl border text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-white/[0.015] border-white/5"
            >
              <Icon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> {label}
            </div>
          ))}
        </div>
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
