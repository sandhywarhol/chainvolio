"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Github, Globe, MessageSquare, Copy, Wallet, Mail, MapPin, FileText, Play, Palette, Link as LinkIcon, User, Clock, Briefcase, CheckCircle2, BadgeCheck, Star, Award, ShieldCheck, Instagram, Linkedin, Send, Phone, Check, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { PortfolioModal } from "@/components/portfolio/PortfolioModal";
import { ReceiptDetailModal } from "@/components/receipt/ReceiptDetailModal";
import { ReceiptUpdates } from "@/components/receipt/ReceiptUpdates";
import { WorkTimeline } from "@/components/profile/WorkTimeline";
import { Toast } from "@/components/ui/Toast";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CommunityBadge } from "@/components/profile/CommunityBadge";

type Profile = {
  displayName: string;
  bio: string;
  skills: string;
  twitter?: string;
  github?: string;
  website?: string;
  discord?: string;
  whatsapp?: string;
  email?: string;
  country?: string;
  avatarUrl?: string;
  lookingFor?: string;
  timezone?: string;
  workPreference?: string[];
  lens?: string;
  farcaster?: string;
  tags?: string[];
  telegram?: string;
  linkedin?: string;
  instagram?: string;
  cardNumber?: number;
  isVerified?: boolean;
  verifierTier?: number;
  verificationType?: string;
  verificationTier?: string;
  role?: string;
  organization?: string;
};

type Receipt = {
  id: string;
  role: string;
  org: string;
  description: string;
  startDate: string;
  endDate: string;
  workType: string;
  compensationType: string;
  evidenceHash: string;
  evidenceLinks: { label: string; url: string }[];
  impact?: string[];
  portfolioImages?: { imageUrl: string; thumbnailUrl: string }[];
  attestedBy?: string;
  attestedAt?: string;
  status: string;
  attesterWallet?: string;
  attesterName?: string;
  attesterRole?: string;
  attesterAvatar?: string;
  attesterAt?: string;
  attesterSignature?: string;
  attesterOrg?: string;
  isAttesterVerified?: boolean;
  attesterTier?: number;
  attestationId?: string;
  attestationType?: string;
  isExternal?: boolean;
  txSignature?: string;
  createdAt: string;
};

type PortfolioItem = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
};

// Utility function to format dates and calculate duration
function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const startMonth = monthNames[start.getMonth()];
  const startYear = start.getFullYear();
  const endMonth = monthNames[end.getMonth()];
  const endYear = end.getFullYear();

  // Calculate duration in months
  const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  let durationText = "";

  if (totalMonths >= 12) {
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    durationText = `${years} ${years === 1 ? "year" : "years"}`;
    if (remainingMonths > 0) {
      durationText += ` ${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`;
    }
  } else {
    durationText = `${totalMonths} ${totalMonths === 1 ? "month" : "months"}`;
  }

  return `${startMonth} ${startYear} - ${endMonth} ${endYear} · ${durationText}`;
}

// Tooltip text for evidence links
function getEvidenceTooltip(label: string): string {
  const tooltips: Record<string, string> = {
    "GitHub": "View source code",
    "Website": "View live project",
    "Demo": "View demo",
    "Doc": "View documentation",
    "Docs": "View documentation",
    "Figma": "View design",
  };
  return tooltips[label] || "View evidence";
}

// Get icon for evidence link type
function getEvidenceIcon(label: string) {
  const icons: Record<string, any> = {
    "GitHub": Github,
    "Website": Globe,
    "Demo": Play,
    "Doc": FileText,
    "Docs": FileText,
    "Figma": Palette,
  };
  const Icon = icons[label] || LinkIcon;
  return <Icon className="w-3 h-3" />;
}

// ── Tier definitions: 4 tiers, each with label, color, and attestation bar count ──
const TIER_DATA: Record<number, { label: string; color: string; bars: number; weight: number }> = {
  1: { label: "Builder",              color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", bars: 1, weight: 1 },
  2: { label: "Public Figure",         color: "text-pink-400 bg-pink-500/10 border-pink-500/20",         bars: 2, weight: 3 },
  3: { label: "Community / DAO",       color: "text-blue-400 bg-blue-500/10 border-blue-500/20",         bars: 3, weight: 6 },
  4: { label: "Company / Organization",color: "text-amber-400 bg-amber-500/10 border-amber-500/20",      bars: 4, weight: 10 },
};

const getBadgeStyles = (verificationType?: string) => {
  const type = (verificationType || "").toLowerCase();

  if (type.includes("public") || type.includes("figure")) return {
    color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    iconText: "text-pink-400",
    border: "border-pink-500/50",
    bgBase: "bg-pink-500",
    hex: "#ec4899",
    bars: 2,
    tierLabel: "Public Figure",
  };
  if (type.includes("community") || type.includes("dao")) return {
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    iconText: "text-blue-400",
    border: "border-blue-500/50",
    bgBase: "bg-blue-500",
    hex: "#3b82f6",
    bars: 3,
    tierLabel: "Community / DAO",
  };
  if (type.includes("company") || type.includes("organization") || type.includes("org")) return {
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    iconText: "text-amber-400",
    border: "border-amber-500/50",
    bgBase: "bg-amber-500",
    hex: "#f59e0b",
    bars: 4,
    tierLabel: "Company / Organization",
  };
  // Default → Builder (Emerald)
  return {
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    iconText: "text-emerald-400",
    border: "border-emerald-500/50",
    bgBase: "bg-emerald-500",
    hex: "#10b981",
    bars: 1,
    tierLabel: "Builder",
  };
};

// ── TrustBadge: verified tier label + attestation power strips ──
function TrustBadge({ isVerified, verificationType, className = "" }: { tier?: number; isVerified: boolean; verificationType?: string; className?: string }) {
  if (!isVerified) return null;

  const s = getBadgeStyles(verificationType);

  const TIER_TOOLTIPS: Record<string, { title: string; desc: string }> = {
    "Builder":               { title: "Verified Builder",              desc: "Individual with verified on-chain career records and proof of work." },
    "Public Figure":         { title: "Verified Public Figure",         desc: "Recognized individual with verified identity and proven contribution record." },
    "Community / DAO":       { title: "Verified Community / DAO",       desc: "Official community representative with established governance history." },
    "Company / Organization":{ title: "Verified Company / Organization", desc: "Institutional entity with verified registration and professional standing." },
  };

  const tooltip = TIER_TOOLTIPS[s.tierLabel] || TIER_TOOLTIPS["Builder"];

  return (
    <div className={`relative group/trust flex flex-col items-center gap-1 ${className}`}>
      {/* Tier label badge */}
      <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${s.color} transition-all duration-300 hover:scale-105 cursor-default shadow-sm`}>
        <ShieldCheck size={10} strokeWidth={3} />
        {s.tierLabel}
      </span>

      {/* Attestation power strips */}
      <div className="flex gap-[3px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-[2px] w-3 rounded-full transition-all ${i < s.bars ? `${s.bgBase} opacity-70` : 'bg-white/10'}`}
          />
        ))}
      </div>

      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 opacity-0 group-hover/trust:opacity-100 transition-opacity duration-300 pointer-events-none z-[100]">
        <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className={`text-[10px] font-black mb-1.5 uppercase tracking-widest leading-none ${s.iconText}`}>{tooltip.title}</p>
          <p className="text-[9px] text-slate-400 leading-relaxed">{tooltip.desc}</p>
          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between gap-3">
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-tight whitespace-nowrap">Attestation Power</span>
            <div className="flex gap-[3px]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`h-[3px] w-3 rounded-full ${i < s.bars ? `${s.bgBase} opacity-90` : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-900" />
      </div>
    </div>
  );
}

function ProfileCompleteBadge({ 
  isComplete,
  onClick,
  className = "" 
}: { 
  isComplete: boolean;
  isVerified?: boolean;
  verificationType?: string;
  onClick?: () => void;
  className?: string; 
}) {
  if (!isComplete) return null;

  const usedStyle = getBadgeStyles("builder");
  const labelText = "Profile Complete";

  return (
    <div
      className={`relative group/complete flex items-start ${className}`}
      onClick={onClick}
    >
      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${usedStyle.color} transition-all duration-300 hover:scale-105 cursor-pointer`}>
        <BadgeCheck className={`w-[10px] h-[10px] ${usedStyle.iconText}`} strokeWidth={3} />
        <span>{labelText}</span>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover/complete:opacity-100 transition-opacity duration-300 pointer-events-none z-[100]">
        <div className="bg-slate-900 border border-white/10 p-2.5 rounded-xl shadow-2xl backdrop-blur-xl text-center">
          <p className="text-[10px] font-black text-white mb-1 uppercase tracking-widest leading-none">Profile Complete</p>
          <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
            Candidate has fulfilled all requirements: Bio, Skills, Experience, and Contact details.
          </p>
        </div>
        {/* Arrow pointer */}
        <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-900"></div>
      </div>
    </div>
  );
}

// ── VerifiedCheckBadge: rosette icon top-right of CV card, color-coded by tier ──
function VerifiedCheckBadge({ verificationType }: { verificationType?: string }) {
  const s = getBadgeStyles(verificationType);
  const color = s.hex;

  return (
    <div className="relative group/vcheck cursor-default">
      {/* Outer ring */}
      <div
        className="relative w-11 h-11 flex items-center justify-center rounded-full bg-slate-900/90 backdrop-blur-xl transition-all duration-300"
        style={{ border: `1px solid ${color}40`, boxShadow: `0 0 18px ${color}22` }}
      >
        {/* Rosette SVG */}
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg viewBox="0 0 24 24" aria-label="Verified" className="w-full h-full" style={{ fill: "none", stroke: color, strokeWidth: "1.5" }}>
            <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z" />
          </svg>
          <Check className="absolute w-2.5 h-2.5" style={{ color }} strokeWidth={3.5} />
        </div>
      </div>

      {/* Hover tooltip */}
      <div className="absolute top-full right-0 mt-2 w-44 opacity-0 group-hover/vcheck:opacity-100 transition-opacity duration-300 pointer-events-none z-[100]">
        <div className="bg-slate-900 border border-white/10 p-2.5 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-widest leading-tight" style={{ color }}>
            Verified {s.tierLabel}
          </p>
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-tight">Attestation Power</span>
            <div className="flex gap-[3px]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`h-[3px] w-2.5 rounded-full ${i < s.bars ? `${s.bgBase} opacity-90` : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CVPage(props: any) {
  const params = useParams();
  const wallet = props?.walletAddressOverride || (params?.wallet as string);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAllHiring, setShowAllHiring] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

  const verifiedHiringRecords = useMemo(() => {
    return receipts.filter(r => 
      (r as any).attestationType === "Hiring Proof" || 
      r.description?.includes("Official Verified Hiring Proof")
    );
  }, [receipts]);

  const contributionReceipts = useMemo(() => {
    return receipts.filter(r => 
      (r as any).attestationType !== "Hiring Proof" && 
      !r.description?.includes("Official Verified Hiring Proof")
    );
  }, [receipts]);

  const isProfileComplete = useMemo(() => {
    if (!profile) return false;
    const hasSocial = !!(
      profile.twitter ||
      profile.github ||
      profile.discord ||
      profile.telegram ||
      profile.whatsapp ||
      profile.email ||
      profile.website ||
      profile.linkedin ||
      profile.instagram ||
      profile.lens ||
      profile.farcaster
    );
    const hasExperience = contributionReceipts && contributionReceipts.length > 0;

    return !!(
      profile.bio &&
      profile.skills &&
      hasExperience &&
      hasSocial
    );
  }, [profile, contributionReceipts]);

  const totalYearsExperience = useMemo(() => {
    if (!contributionReceipts || contributionReceipts.length === 0) return 0;

    // 1. Convert all contribution receipts into date intervals [start, end]
    const intervals = contributionReceipts
      .map(r => ({
        start: new Date(r.startDate).getTime(),
        end: r.endDate ? new Date(r.endDate).getTime() : new Date().getTime()
      }))
      .filter(i => !isNaN(i.start) && !isNaN(i.end))
      .sort((a, b) => a.start - b.start);

    if (intervals.length === 0) return 0;

    // 2. Merge overlapping intervals
    const merged: { start: number; end: number }[] = [];
    let current = intervals[0];

    for (let i = 1; i < intervals.length; i++) {
      const next = intervals[i];
      if (next.start <= current.end) {
        // Overlap: extend current interval
        current.end = Math.max(current.end, next.end);
      } else {
        // No overlap: push current and move to next
        merged.push(current);
        current = next;
      }
    }
    merged.push(current);

    // 3. sum up durations in months
    let totalMonths = 0;
    merged.forEach(interval => {
      const start = new Date(interval.start);
      const end = new Date(interval.end);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += Math.max(1, months); // at least 1 month per interval
    });

    return Math.floor(totalMonths / 12);
  }, [contributionReceipts]);



  useEffect(() => {
    if (!wallet) return;

    Promise.all([
      fetch(`/api/profile?wallet=${wallet}`).then((r) => r.json()),
      fetch(`/api/receipts?wallet=${wallet}`).then((r) => r.json()),
      fetch(`/api/portfolio?wallet=${wallet}`).then((r) => r.json()),
    ]).then(([prof, recs, port]) => {
      setProfile(prof);
      const sortedRecs = Array.isArray(recs)
        ? [...recs].sort((a: any, b: any) => (b.status === "Attested" ? 1 : 0) - (a.status === "Attested" ? 1 : 0))
        : [];
      setReceipts(sortedRecs);
      setPortfolio(Array.isArray(port) ? port : []);
    }).finally(() => setLoading(false));
  }, [wallet]);

  if (loading) {
    return (
      <main className="min-h-screen text-white flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white">
      {/* Very subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <Navbar isVerified={!!profile?.isVerified} verifierTier={profile?.verifierTier} />

      <div className="max-w-3xl mx-auto px-6 pt-24 pb-2 flex justify-end">
        <span className="text-[10px] font-mono text-slate-500 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
          Source: {wallet}
        </span>
      </div>

      <section className="max-w-3xl mx-auto px-6 pt-4 pb-12">
        {!profile ? (
          <p className="text-slate-500">Profile not found.</p>
        ) : (
          <>
            <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 p-8 rounded-3xl overflow-hidden group">
              {/* Animated silver gradient border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-slate-400/20 via-white/30 to-slate-400/20 opacity-60 animate-pulse"></div>

              {/* Dark solid background */}
              <div className="absolute inset-[1px] rounded-3xl bg-slate-800/80"></div>

              {/* Main Card Background Image */}
              <div
                className="absolute inset-[1px] rounded-3xl opacity-60 bg-cover bg-center mix-blend-overlay"
                style={{
                  backgroundImage: 'url("/card%20background.jpeg")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              ></div>

              {/* Dark gradient overlay */}
              <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/70 to-slate-900/80"></div>

              {/* Lightning shine effect - diagonal sweep (Always active) */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-lightning-shine"></div>
              </div>

              {/* Subtle silver shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-300/5 via-transparent to-white/5"></div>

              {/* Inner silver glow */}
              <div className="absolute inset-0 rounded-3xl shadow-[inset_0_1px_0_0_rgba(241,245,249,0.1),inset_0_-1px_0_0_rgba(241,245,249,0.05)]"></div>

              {/* Outer glow with silver accent */}
              <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-br from-slate-400/20 via-white/10 to-slate-500/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>

              {/* Sparkle effect on corners */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-white/60 rounded-full blur-sm animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-2 h-2 bg-slate-300/60 rounded-full blur-sm animate-pulse" style={{ animationDelay: '0.5s' }}></div>

              <div className="absolute top-6 right-6 z-30 flex flex-col gap-5 items-center">
                {profile.isVerified && (
                  <VerifiedCheckBadge verificationType={profile.verificationType} />
                )}
                {totalYearsExperience > 0 && (
                  <div className="group/exp cursor-default">
                    <div className="relative flex items-center justify-center translate-x-[1px]">
                      <div className="relative text-blue-400/90 transition-all duration-300 group-hover/exp:text-blue-400 flex flex-col items-center justify-center leading-none">
                        <span className="text-sm font-black">{totalYearsExperience}</span>
                        <span className="text-[8px] font-black uppercase tracking-tighter">Yrs</span>
                      </div>
                      {/* Hover Label - Moved to left to match layout */}
                      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover/exp:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/30 backdrop-blur-sm shadow-xl">
                          {totalYearsExperience}+ Years Experience
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Content wrapper */}
              <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 w-full z-10">
                {/* Avatar Column */}
                <div className="flex-shrink-0">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-slate-800 shadow-xl"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-4xl border-4 border-slate-800 shadow-xl">
                      👤
                    </div>
                  )}

                  {/* Country below avatar */}
                  {(profile.country || profile.timezone) && (
                    <div className="flex flex-col items-center gap-1 mt-3 text-slate-400">
                      {profile.country && (
                        <div className="flex items-center justify-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{profile.country}</span>
                        </div>
                      )}
                      {profile.timezone && (
                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-mono">{profile.timezone}</span>
                        </div>
                      )}

                      {/* Work Preference */}
                      {profile.workPreference?.length && (
                        <div className="flex flex-col items-center gap-1 mt-2">
                          <span className="text-[9px] text-slate-500 uppercase tracking-wide font-medium">Availability</span>
                          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[200px]">
                            {profile.workPreference?.map((pref) => (
                              <span key={pref} className="px-2 py-0.5 rounded-full bg-emerald-900/20 border border-emerald-500/30 text-[10px] font-medium text-emerald-300">
                                {pref}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>


                {/* Info Column */}
                <div className="flex-1 text-center md:text-left space-y-4 w-full">
                  {/* Looking For Badge */}
                  {profile.lookingFor && (
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span className="font-medium">{profile.lookingFor}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
                      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        {profile.displayName}
                      </h1>
                    </div>

                    {/* Wallet Badge - Next to Name */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(wallet);
                        setToastMessage("Wallet address copied!");
                      }}
                      className="group flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900/50 border border-slate-700/50 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all cursor-pointer self-center md:self-auto"
                    >
                      <Wallet className="w-3 h-3 text-purple-400" />
                      <span className="font-mono text-[10px] text-slate-400 group-hover:text-purple-400 transition-colors">
                        {wallet.slice(0, 4)}...{wallet.slice(-4)}
                      </span>
                      <Copy className="w-2.5 h-2.5 text-slate-500 group-hover:text-purple-400 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>

                  {/* Profile Identity (Role/Tier) - Single Source of Truth */}
                  {(profile.verificationTier || profile.role) ? (
                    <p className="text-sm font-medium text-slate-400 mt-1">
                      {profile.verificationTier || profile.role}
                      {profile.organization && <span> at {profile.organization}</span>}
                    </p>
                  ) : null}

                  {/* Badges & Trust Hierarchy */}
                  <div className="flex flex-wrap items-start justify-center md:justify-start gap-4 mt-4">
                    <TrustBadge
                      tier={profile.verifierTier || 1}
                      isVerified={!!profile.isVerified}
                      verificationType={profile.verificationType}
                    />
                    <ProfileCompleteBadge
                      isComplete={isProfileComplete}
                      onClick={() => {
                        setToastMessage("This candidate has fulfilled all profile requirements, including professional background, skills, work evidence, and contact information.");
                      }}
                    />
                    <CommunityBadge cvId={profile.cardNumber || 0} />
                  </div>

                  {/* Skills Pills */}
                  {profile.skills && (
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                      {profile.skills.split(',').map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {profile.bio && (
                    <ExpandableText
                      text={profile.bio}
                      maxLength={350}
                      className="text-slate-300 text-sm leading-relaxed max-w-2xl"
                    />
                  )}

                  {/* Social Row */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                    {profile.twitter && (
                      <a
                        href={`https://x.com/${profile.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                        title="Twitter / X"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    )}

                    {profile.github && (
                      <a
                        href={`https://github.com/${profile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                        title="GitHub"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                      </a>
                    )}

                    {profile.linkedin && (
                      <a
                        href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/20 transition-all"
                        title="LinkedIn"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                        </svg>
                      </a>
                    )}

                    {profile.instagram && (
                      <a
                        href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-[#E4405F] hover:bg-[#E4405F]/10 hover:border-[#E4405F]/20 transition-all font-bold"
                        title="Instagram"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.166.054 1.8.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.427.359 1.061.413 2.227.057 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.166-.249 1.8-.415 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.427.164-1.061.359-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.166-.054-1.8-.249-2.227-.415-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.427-.359-1.061-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.166.249-1.8.415-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.427-.164 1.061-.359 2.227-.413 1.266-.057 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.057-2.149.261-2.911.558-.788.306-1.457.715-2.122 1.381-.666.665-1.075 1.334-1.381 2.122-.297.762-.501 1.634-.558 2.911-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.057 1.277.261 2.149.558 2.911.306.788.715 1.457 1.381 2.122.665.666 1.334 1.075 2.122 1.381.762.297 1.634.501 2.911.558 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.057 2.149-.261 2.911-.558.788-.306 1.457-.715 2.122-1.381.666-.665 1.075-1.334 1.381-2.122.297-.762.501-1.634.558-2.911.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.057-1.277-.261-2.149-.558-2.911-.306-.788-.715-1.457-1.381-2.122-.665-.666-1.334-1.075-2.122-1.381-.762-.297-1.634-.501-2.911-.558-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    )}

                    {profile.lens && (
                      <a
                        href={`https://lens.xyz/${profile.lens.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 px-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-[#BFC500] hover:bg-[#BFC500]/10 hover:border-[#BFC500]/20 transition-all font-bold text-xs"
                        title="Lens Protocol"
                      >
                        🌿
                      </a>
                    )}

                    {profile.farcaster && (
                      <a
                        href={`https://warpcast.com/${profile.farcaster.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 px-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-[#855DCD] hover:bg-[#855DCD]/10 hover:border-[#855DCD]/20 transition-all font-bold text-xs"
                        title="Farcaster"
                      >
                        🟣
                      </a>
                    )}

                    {profile.website && (
                      <a
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all"
                        title="Website"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {profile.discord && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(profile.discord!);
                          setToastMessage(`Discord handle copied: ${profile.discord}`);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all cursor-pointer"
                        title="Copy Discord Handle"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 11.721 11.721 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.862-1.295 1.192-1.996a.076.076 0 0 0-.041-.106 13.046 13.046 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                      </button>
                    )}

                    {profile.telegram && (
                      <a
                        href={`https://t.me/${profile.telegram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-[#26A5E4] hover:bg-[#26A5E4]/10 hover:border-[#26A5E4]/20 transition-all"
                        title="Telegram"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0C5.347 0 0 5.347 0 11.944c0 6.597 5.347 11.944 11.944 11.944 6.597 0 11.944-5.347 11.944-11.944C23.888 5.347 18.541 0 11.944 0zm5.204 8.525c-.179 1.884-.962 5.925-1.359 8.041-.168.9-.499 1.203-.82 1.232-.698.064-1.226-.462-1.902-.905-1.057-.695-1.655-1.127-2.682-1.803-1.187-.781-.417-1.21.258-1.912.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.071-.064-.175-.041-.249-.024-.106.024-1.793 1.141-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.098.154.228.163.319.009.091.011.201.009.324z" />
                        </svg>
                      </a>
                    )}

                    {profile.whatsapp && (
                      <a
                        href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-green-400 hover:bg-green-500/10 hover:border-green-500/20 transition-all font-bold"
                        title="WhatsApp"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </a>
                    )}

                    {profile.email && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(profile.email!);
                          setToastMessage(`Email address copied: ${profile.email}`);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/20 transition-all cursor-pointer"
                        title="Copy Email Address"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Number */}
              {profile.cardNumber && (
                <div className="absolute bottom-6 right-8 z-30 opacity-40 group-hover:opacity-100 transition-opacity flex flex-col items-end">
                  <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-0.5">CV ID</span>
                  <span className="font-mono text-xs tracking-[0.2em] text-white/80">
                    #{String(profile.cardNumber).padStart(5, '0')}
                  </span>
                </div>
              )}
            </div>

            {/* Recruiter Trust Disclaimer */}
            <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Recruiter Note: Verified Integrity</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Attestations marked with <span className="text-emerald-400 font-bold">✓ Attested</span> are cryptographically signed by third-party verifiers. These claims are publicly verifiable and cannot be altered by the candidate.
                </p>
              </div>
            </div>

            {contributionReceipts.length > 0 && (
              <WorkTimeline
                receipts={contributionReceipts}
                onSelectReceipt={setSelectedReceipt}
              />
            )}



            <h2 className="text-xl font-semibold mt-4 mb-4">Proof of Work</h2>
            {contributionReceipts.length === 0 ? (
              <p className="text-slate-500">No work records submitted yet.</p>
            ) : (
              <div className="space-y-6">
                {contributionReceipts.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedReceipt(r)}
                    className="p-5 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer group/work"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        {/* Primary: Role + Organization */}
                        <div className="space-y-1">
                          {r.role && <h3 className="text-base font-semibold text-white">{r.role}</h3>}
                          {r.org && <p className={`text-base text-emerald-400 font-bold ${!r.role ? "text-white" : ""}`}>{r.org}</p>}
                        </div>

                        {/* Secondary: Date, Duration, Work Type */}
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDateRange(r.startDate, r.endDate)} · {r.workType}
                          {r.compensationType && ` · ${r.compensationType}`}
                        </p>

                        {/* Attester info (if attested) */}
                        {r.status === "Attested" && r.attesterWallet && (
                          <div className="mt-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest">
                                {r.attestationType === "Hiring Proof" ? "On-chain Recruiter Proof" : "Verification Signature"}
                              </p>
                              {r.attestationType === "Hiring Proof" ? (
                                <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 tracking-tighter uppercase flex items-center gap-1">
                                  <ShieldCheck className="w-2.5 h-2.5" /> Institutional Verified
                                </span>
                              ) : r.isExternal && (
                                <span className="text-[8px] font-black bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-700 tracking-tighter uppercase">
                                  External Attestation
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                {r.attesterAvatar ? (
                                  <img src={r.attesterAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <BadgeCheck className="w-4 h-4 text-emerald-500" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <p className="text-xs font-bold text-white leading-none">
                                    {r.attesterName || "Community Attester"}
                                  </p>
                                  <TrustBadge
                                    tier={r.attesterTier || 1}
                                    isVerified={!!r.isAttesterVerified}
                                  />
                                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-normal truncate">
                                    {r.attesterRole && <span>{r.attesterRole}</span>}
                                    {r.attesterOrg && <span>at {r.attesterOrg}</span>}
                                  </div>
                                </div>
                                <p className="text-[10px] font-mono text-slate-500">
                                  {r.attesterWallet.slice(0, 8)}...{r.attesterWallet.slice(-6)}
                                  {r.attesterAt && <span className="ml-2 opacity-50">· {new Date(r.attesterAt).toLocaleDateString()}</span>}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        <ExpandableText
                          text={r.description}
                          maxLength={320}
                          className="text-sm text-slate-300 mt-3 leading-relaxed"
                        />

                        {/* Impact (if present) */}
                        {r.impact && r.impact.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Impact</p>
                            <ul className="space-y-1">
                              {r.impact.map((item, idx) => (
                                <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                  <span className="text-emerald-400 mt-0.5">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Evidence Links */}
                        {r.evidenceLinks && r.evidenceLinks.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Evidence</p>
                            <div className="flex flex-wrap gap-2">
                              {r.evidenceLinks.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  title={getEvidenceTooltip(link.label)}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs text-emerald-400 hover:text-emerald-300 transition-colors border border-slate-600"
                                >
                                  {getEvidenceIcon(link.label)} {link.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* View Transaction Button for Hiring Proofs */}
                        {r.attestationType === "Hiring Proof" && r.txSignature && (
                          <div className="mt-6 flex flex-col gap-2">
                             <div className="h-px bg-white/5 w-full mb-2" />
                             <a
                               href={`https://solscan.io/tx/${r.txSignature}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               onClick={(e) => e.stopPropagation()}
                               className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-all border border-emerald-500/20 text-[11px] font-black uppercase tracking-widest"
                             >
                               <ExternalLink className="w-3.5 h-3.5" /> View Transaction
                             </a>
                          </div>
                        )}

                        {/* Portfolio Images */}
                        {r.portfolioImages && r.portfolioImages.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Portfolio</p>
                            <div className="flex flex-wrap gap-2">
                              {r.portfolioImages.map((img: any, idx: number) => (
                                <img
                                  key={idx}
                                  src={img.thumbnailUrl}
                                  alt={`Portfolio ${idx + 1}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPortfolio({ title: r.role, description: r.org, imageUrl: img.imageUrl } as any);
                                  }}
                                  className="w-16 h-16 rounded object-cover border border-slate-700 hover:border-emerald-500 cursor-pointer transition-all"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tertiary: Status Badge (top-right) */}
                      <span
                        className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap ${r.status === "Attested"
                          ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                          : "border-slate-600 text-slate-400 bg-slate-800"
                          }`}
                        title={
                          r.status === "Attested"
                            ? "Verified by wallet signature"
                            : "Reported by candidate"
                        }
                      >
                        {r.status === "Attested" ? "✓ Attested" : "Self-Declared"}
                      </span>
                    </div>

                    <ReceiptUpdates receipt={r} isOwner={false} />
                  </div>
                ))}
              </div>
            )}

            {/* Verified Hiring Section - Redesigned to match Career Timeline style */}
            {verifiedHiringRecords.length > 0 && (
              <div className="w-full mb-6 border-t border-slate-800/50 pt-12 mt-12">
                <button
                  onClick={() => setShowAllHiring(!showAllHiring)}
                  className="w-full text-left py-2 hover:opacity-80 transition-opacity group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 flex-shrink-0 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-lg">
                      <ShieldCheck className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors mb-0.5">Verified Hiring</h2>
                      <p className="text-xs text-slate-400 font-medium tracking-wide">On-chain recruiter proofs and institutional hires.</p>
                    </div>
                  </div>
                  <div className="p-2 flex items-center justify-center text-slate-400">
                    {showAllHiring ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {showAllHiring && (
                  <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    {verifiedHiringRecords.map((record, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedReceipt(record)}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all cursor-pointer group/hiring relative overflow-hidden"
                      >
                        {/* Subtle background glow for hiring cards */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent opacity-0 group-hover/hiring:opacity-100 transition-opacity" />
                        
                        <div className="relative z-10 space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                             <p className="text-base font-bold text-white group-hover/hiring:text-blue-400 transition-colors">
                               {record.role} at {record.org}
                             </p>
                          </div>
                          
                          <div className="flex flex-col gap-1.5 ml-3.5 text-[11px] text-slate-400 font-medium tracking-wide">
                             <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-slate-500 px-1.5 py-0.5 rounded bg-slate-800/50 border border-slate-700/50 uppercase text-[9px]">Recruiter Proof</span>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="text-blue-400/80">Verified by {record.attesterName || record.attesterWallet?.slice(0, 6)}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                <span>{record.startDate ? new Date(record.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Mar 2026'}</span>
                             </div>
                          </div>
                          
                          {record.description && (
                             <div className="ml-3.5 border-l-2 border-blue-500/10 pl-4 py-1 mt-2">
                               <p className="text-[11px] text-slate-400/90 leading-relaxed font-medium line-clamp-2 italic">
                                 "{record.description}"
                               </p>
                             </div>
                          )}
                        </div>
                        
                        <div className="relative z-10 flex items-center gap-3">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[8px] font-black text-blue-500/60 uppercase tracking-[0.2em]">Institutional</span>
                            <span className="text-[10px] px-3 py-1 rounded-full border border-blue-500/50 text-blue-400 bg-blue-500/10 whitespace-nowrap font-black uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                              ✓ Attested
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <PortfolioModal
          item={selectedPortfolio}
          onClose={() => setSelectedPortfolio(null)}
        />

        <ReceiptDetailModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />

        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        )}

        <footer className="mt-16 text-center border-t border-slate-800 pt-8 pb-4">
          <p className="text-slate-600 text-xs max-w-md mx-auto">
            ChainVolio provides infrastructure for career history. Verification is performed by cryptographic signatures, not by ChainVolio itself. Please verify critical claims independently.
          </p>
        </footer>
      </section>
      <Footer />
    </main>
  );
}
