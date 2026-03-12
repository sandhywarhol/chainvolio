"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Github, Globe, MessageSquare, Copy, Wallet, Mail, MapPin, FileText, Play, Palette, Link as LinkIcon, User, Clock, Briefcase, CheckCircle2, BadgeCheck, Star, Award, ShieldCheck, Instagram, Linkedin, Send, Phone, Check, ExternalLink } from "lucide-react";
import { PortfolioModal } from "@/components/portfolio/PortfolioModal";
import { ReceiptDetailModal } from "@/components/receipt/ReceiptDetailModal";
import { ReceiptUpdates } from "@/components/receipt/ReceiptUpdates";
import { WorkTimeline } from "@/components/profile/WorkTimeline";
import { Toast } from "@/components/ui/Toast";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

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

const TIER_DATA: Record<number, { label: string; icon: boolean; color: string; bars: number; weight: number }> = {
  1: { label: "Individual", icon: false, color: "text-slate-500 bg-slate-500/10 border-slate-500/20", bars: 1, weight: 1 },
  2: { label: "Verified Figure", icon: true, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", bars: 2, weight: 3 },
  3: { label: "Verified Organization", icon: true, color: "text-teal-400 bg-teal-400/10 border-teal-400/20", bars: 3, weight: 6 },
};

function TrustBadge({ tier, isVerified, verificationType, className = "" }: { tier: number; isVerified: boolean; verificationType?: string; className?: string }) {
  const data = TIER_DATA[tier as keyof typeof TIER_DATA] || TIER_DATA[1];
  // Tier 2 & 3 visuals only active if isVerified is true
  const isActive = tier > 1 ? isVerified : true;
  const showShield = tier > 1 && isVerified && data.icon;

  const displayLabel = (isActive && verificationType) ? `Verified ${verificationType}` : data.label;

  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${isActive ? data.color : 'text-slate-500 bg-slate-500/10 border-slate-500/20'}`}>
        {showShield && <ShieldCheck size={10} strokeWidth={3} />} {displayLabel}
      </span>
      {isActive && (
        <div className={`text-[8px] leading-none tracking-[-0.1em] transition-opacity duration-300 ${data.color} opacity-60 ml-0.5`}>
          {"▬".repeat(data.bars)}
        </div>
      )}
    </div>
  );
}

function ProfileCompleteBadge({ isComplete, onClick, className = "" }: { isComplete: boolean; onClick?: () => void; className?: string }) {
  if (!isComplete) return null;
  return (
    <div
      className={`group/badge cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-emerald-500/40 rounded-full blur-md animate-pulse"></div>
        <div className="relative p-2 rounded-full bg-slate-900/90 border border-emerald-500/50 text-emerald-400 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform duration-300 group-hover/badge:scale-110">
          <BadgeCheck className="w-6 h-6" />
        </div>
        {/* Hover Label */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover/badge:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30 backdrop-blur-sm shadow-xl">
            Profile Complete
          </span>
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

              {/* Profile Complete / Verified Badge */}
              <div className="absolute top-6 right-6 z-30 flex flex-col gap-4 items-center">
                <ProfileCompleteBadge
                  isComplete={isProfileComplete}
                  onClick={() => setToastMessage("This candidate has fulfilled all profile requirements, including professional background, skills, work evidence, and contact information.")}
                />

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
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                      {profile.displayName}
                    </h1>

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

                  {/* Profile Identity (Role) */}
                  {profile.role ? (
                    <p className="text-sm font-medium text-slate-400 mt-1">
                      {profile.role}
                      {profile.organization && <span> at {profile.organization}</span>}
                    </p>
                  ) : null}

                  {/* Badges & Trust Hierarchy */}
                  <div className="flex flex-col items-center md:items-start gap-3 mt-4">
                    <TrustBadge
                      tier={profile.verifierTier || 1}
                      isVerified={!!profile.isVerified}
                      verificationType={profile.verificationType}
                    />
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
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-green-400 hover:bg-green-500/10 hover:border-green-500/20 transition-all"
                        title="WhatsApp"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
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
            <div className="mt-10 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-start gap-3">
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



            <h2 className="text-xl font-semibold mt-12 mb-4">Proof of Work</h2>
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

            {/* Verified Hiring Section - Minimal Appendage */}
            {verifiedHiringRecords.length > 0 && (
              <div className="mt-20 border-t border-white/5 pt-12 pb-8">
                <div className="flex items-center gap-2 mb-8 opacity-60">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Verified Hiring</h2>
                </div>

                <div className="space-y-6">
                  {(showAllHiring ? verifiedHiringRecords : verifiedHiringRecords.slice(0, 2)).map((record, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedReceipt(record)}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all cursor-pointer group/hiring"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white group-hover/hiring:text-emerald-400 transition-colors">{record.role} at {record.org}</p>
                        <div className="flex flex-col gap-1 text-[11px] text-slate-500 font-medium">
                           <div className="flex items-center gap-2">
                              <span>Position: {record.role}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-800" />
                              <span className="text-emerald-500/80">Verified by {record.attesterName || record.attesterWallet?.slice(0, 6)}</span>
                           </div>
                           <span>{record.startDate ? new Date(record.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Mar 2026'}</span>
                        </div>
                        {record.description && (
                           <p className="text-[10px] text-slate-400/80 leading-relaxed font-medium mt-1 line-clamp-2 italic">
                             "{record.description}"
                           </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded border border-emerald-500/50 text-emerald-400 bg-emerald-500/10 whitespace-nowrap">
                          ✓ Attested
                        </span>
                      </div>
                    </div>
                  ))}

                  {verifiedHiringRecords.length > 2 && !showAllHiring && (
                    <button 
                      onClick={() => setShowAllHiring(true)}
                      className="w-full py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      View Full Hiring History
                    </button>
                  )}
                </div>
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
    </main >
  );
}
