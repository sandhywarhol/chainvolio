"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Github, Globe, MessageSquare, Copy, Wallet, Mail, MapPin, FileText, Play, Palette, Link as LinkIcon, User, Clock, Briefcase, CheckCircle2, BadgeCheck, Star, Award, ShieldCheck } from "lucide-react";
import { PortfolioModal } from "@/components/portfolio/PortfolioModal";
import { ReceiptDetailModal } from "@/components/receipt/ReceiptDetailModal";
import { Toast } from "@/components/ui/Toast";

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
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  const durationText = months === 1 ? "1 month" : `${months} months`;

  return `${startMonth} ${startYear} – ${endMonth} ${endYear} · ${durationText}`;
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

export default function CVPage() {
  const params = useParams();
  const wallet = params.wallet as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isProfileComplete = useMemo(() => {
    if (!profile) return false;
    const hasSocial = !!(profile.twitter || profile.github || profile.discord || profile.telegram || profile.whatsapp || profile.email || profile.lens || profile.farcaster);
    return !!(
      profile.displayName &&
      profile.bio &&
      profile.skills &&
      profile.avatarUrl &&
      profile.country &&
      hasSocial
    );
  }, [profile]);

  const totalYearsExperience = useMemo(() => {
    if (!receipts || receipts.length === 0) return 0;

    // 1. Convert all receipts into date intervals [start, end]
    const intervals = receipts
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
  }, [receipts]);

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
    <main className="min-h-screen text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto relative z-[100]">
        <Link href="/" className="flex items-center gap-1.5 group">
          <img src="/chainvolio%20logo.png" alt="ChainVolio Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold">ChainVolio</span>
        </Link>
        <span className="text-sm text-slate-500 font-mono truncate max-w-[200px]">
          {wallet}
        </span>
      </nav>

      <section className="max-w-3xl mx-auto px-6 py-12">
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
                {isProfileComplete && (
                  <div
                    className="group/badge cursor-pointer"
                    onClick={() => setToastMessage("This candidate has fulfilled all profile requirements, including professional background, skills, and social credentials.")}
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-emerald-500/40 rounded-full blur-md animate-pulse"></div>
                      <div className="relative p-2 rounded-full bg-slate-900/90 border border-emerald-500/50 text-emerald-400 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform duration-300 group-hover/badge:scale-110">
                        <BadgeCheck className="w-6 h-6" />
                      </div>
                      {/* Hover Label - Moved to left to avoid overlapping stacked badges */}
                      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover/badge:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30 backdrop-blur-sm shadow-xl">
                          Verified Portfolio
                        </span>
                      </div>
                    </div>
                  </div>
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
                    <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                      {profile.bio}
                    </p>
                  )}

                  {/* Social Row */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                    {profile.twitter && (
                      <a
                        href={`https://twitter.com/${profile.twitter.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group relative"
                        title="X (Twitter)"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    )}

                    {profile.github && (
                      <a
                        href={`https://github.com/${profile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                        title="GitHub"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    )}

                    {profile.lens && (
                      <a
                        href={`https://lens.xyz/${profile.lens.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-[#BFC500] hover:bg-[#BFC500]/10 hover:border-[#BFC500]/20 transition-all font-bold"
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
                        className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-[#855DCD] hover:bg-[#855DCD]/10 hover:border-[#855DCD]/20 transition-all font-bold"
                        title="Farcaster"
                      >
                        🟣
                      </a>
                    )}

                    {profile.lens && (
                      <a
                        href={`https://lens.xyz/${profile.lens.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-[#BFC500] hover:bg-[#BFC500]/10 hover:border-[#BFC500]/20 transition-all font-bold"
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
                        className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-[#855DCD] hover:bg-[#855DCD]/10 hover:border-[#855DCD]/20 transition-all font-bold"
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
                        className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all"
                        title="Website"
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    )}

                    {profile.discord && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(profile.discord!);
                          setToastMessage(`Discord handle copied: ${profile.discord}`);
                        }}
                        className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all cursor-pointer"
                        title="Copy Discord Handle"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 11.721 11.721 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.862-1.295 1.192-1.996a.076.076 0 0 0-.041-.106 13.046 13.046 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                      </button>
                    )}

                    {profile.telegram && (
                      <a
                        href={`https://t.me/${profile.telegram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-[#26A5E4] hover:bg-[#26A5E4]/10 hover:border-[#26A5E4]/20 transition-all"
                        title="Telegram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0C5.347 0 0 5.347 0 11.944c0 6.597 5.347 11.944 11.944 11.944 6.597 0 11.944-5.347 11.944-11.944C23.888 5.347 18.541 0 11.944 0zm5.204 8.525c-.179 1.884-.962 5.925-1.359 8.041-.168.9-.499 1.203-.82 1.232-.698.064-1.226-.462-1.902-.905-1.057-.695-1.655-1.127-2.682-1.803-1.187-.781-.417-1.21.258-1.912.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.071-.064-.175-.041-.249-.024-.106.024-1.793 1.141-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.098.154.228.163.319.009.091.011.201.009.324z" />
                        </svg>
                      </a>
                    )}

                    {profile.whatsapp && (
                      <a
                        href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-green-400 hover:bg-green-500/10 hover:border-green-500/20 transition-all"
                        title="WhatsApp"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                      </a>
                    )}

                    {profile.email && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(profile.email!);
                          setToastMessage(`Email address copied: ${profile.email}`);
                        }}
                        className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/20 transition-all cursor-pointer"
                        title="Copy Email Address"
                      >
                        <Mail className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
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

            <h2 className="text-xl font-semibold mt-12 mb-4">Proof of Work</h2>
            {receipts.length === 0 ? (
              <p className="text-slate-500">No receipts yet.</p>
            ) : (
              <div className="space-y-6">
                {receipts.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedReceipt(r)}
                    className="p-5 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer group/work"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        {/* Primary: Role + Organization */}
                        <div className="space-y-1">
                          <h3 className="text-base font-semibold text-white">{r.role}</h3>
                          <p className="text-sm text-slate-400">{r.org}</p>
                        </div>

                        {/* Secondary: Date, Duration, Work Type */}
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDateRange(r.startDate, r.endDate)} · {r.workType}
                          {r.compensationType && ` · ${r.compensationType}`}
                        </p>

                        {/* Attester info (if attested) */}
                        {r.status === "Attested" && r.attesterWallet && (
                          <div className="mt-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
                            <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest">Verification Signature</p>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                {r.attesterAvatar ? (
                                  <img src={r.attesterAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <BadgeCheck className="w-4 h-4 text-emerald-500" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white leading-none mb-1">
                                  {r.attesterName || "Community Attester"}
                                  {r.attesterOrg && <span className="text-slate-500 font-normal"> at {r.attesterOrg}</span>}
                                </p>
                                <p className="text-[10px] font-mono text-slate-500">
                                  {r.attesterWallet.slice(0, 8)}...{r.attesterWallet.slice(-6)}
                                  {r.attesterAt && <span className="ml-2 opacity-50">· {new Date(r.attesterAt).toLocaleDateString()}</span>}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        <p className="text-sm text-slate-300 mt-3 leading-relaxed">{r.description}</p>

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
                                  title={getEvidenceTooltip(link.label)}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs text-emerald-400 hover:text-emerald-300 transition-colors border border-slate-600"
                                >
                                  {getEvidenceIcon(link.label)} {link.label}
                                </a>
                              ))}
                            </div>
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
                                  onClick={() => setSelectedPortfolio({ title: r.role, description: r.org, imageUrl: img.imageUrl } as any)}
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
                  </div>
                ))}
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
    </main >
  );
}
