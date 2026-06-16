"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Globe,
  Send,
  ExternalLink,
  FolderOpen,
  LayoutDashboard,
  Copy,
  Check,
  Users,
  X,
  Crown,
  UserCheck,
  User,
  MapPin,
  ChevronDown,
  Github,
  Instagram,
  Briefcase,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Toast } from "@/components/ui/Toast";
import { XIcon, LinkedInIcon, DiscordIcon } from "@/components/ui/SocialIcons";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { RoleBadge } from "@/components/profile/RoleBadge";
import { CommunityBadge } from "@/components/profile/CommunityBadge";
import { BadgeCheck, Clock } from "lucide-react";
import { getBadgeStyles } from "@/lib/paymentConfig";

type PublicOrg = {
  auth_uid: string;
  org_name: string | null;
  org_type: string | null;
  account_type: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  discord: string | null;
  telegram: string | null;
  country: string | null;
  github: string | null;
  instagram: string | null;
  whatsapp: string | null;
  skills: string | null;
  role: string | null;
  timezone: string | null;
  looking_for: string | null;
  work_preference: string[] | null;
  effective_plan: string;
  is_verified: boolean;
  org_id_number: number;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  project_type: string | null;
  project_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_ongoing: boolean;
  status: string | null;
  tags: string[];
};

type Collection = {
  id: string;
  title: string;
  slug: string;
  created_at: string;
};

type PublicMember = {
  id: string;
  role: "member" | "admin";
  joined_at: string;
  display_name: string | null;
  avatar_url: string | null;
  card_number: number | null;
  wallet_address: string;
};

function ProfileCompleteBadge({ isComplete, onClick }: { isComplete: boolean; onClick?: () => void }) {
  if (!isComplete) return null;
  const s = getBadgeStyles("builder");
  return (
    <div className="relative group/complete inline-flex" onClick={onClick}>
      <div className={`inline-flex items-center justify-center gap-1.5 px-2.5 h-6 rounded border text-[10px] font-black uppercase tracking-widest ${s.color} transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm`}>
        <BadgeCheck className={`w-3.5 h-3.5 ${s.iconText}`} strokeWidth={3} />
        <span>Ready</span>
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover/complete:opacity-100 transition-all duration-300 delay-150 pointer-events-none z-[100] translate-y-1 group-hover/complete:translate-y-0">
        <div className="bg-slate-900 border border-white/10 p-2.5 rounded-xl shadow-2xl backdrop-blur-xl text-center">
          <p className="text-[10px] font-black text-white mb-1 uppercase tracking-widest leading-none">Ready</p>
          <p className="text-[9px] text-slate-400 leading-relaxed font-medium">Profile has bio, social links, and at least one project.</p>
        </div>
        <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-900" />
      </div>
    </div>
  );
}

function ExperienceBadge({ years }: { years: number }) {
  if (years <= 0) return null;
  return (
    <div className="relative group/exp inline-flex">
      <div className="inline-flex items-center justify-center gap-1.5 px-2.5 h-6 rounded border text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border-blue-500/30 shadow-sm cursor-default transition-all duration-300 hover:scale-105">
        <Clock size={12} strokeWidth={3} />
        <span>{years}Y Exp</span>
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover/exp:opacity-100 transition-all duration-300 delay-150 pointer-events-none z-[100] translate-y-1 group-hover/exp:translate-y-0">
        <div className="bg-slate-900 border border-white/10 p-2.5 rounded-xl shadow-2xl backdrop-blur-xl text-center">
          <p className="text-[10px] font-black text-white mb-1 uppercase tracking-widest leading-none">Experience</p>
          <p className="text-[9px] text-slate-400 leading-relaxed font-medium">Total years of experience based on projects.</p>
        </div>
        <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-900" />
      </div>
    </div>
  );
}

function BuilderWorkCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);

  const startStr = project.start_date
    ? new Date(project.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;
  const endStr = project.is_ongoing
    ? "Ongoing"
    : project.end_date
    ? new Date(project.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;
  const dateStr = [startStr, endStr].filter(Boolean).join(" — ");

  return (
    <div
      className="p-4 md:p-5 rounded-lg hover:border-white/20 transition-all relative overflow-hidden shadow-[0_12px_20px_-8px_rgba(0,0,0,0.8)]"
      style={{ background: "#0a0a0c", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="animate-lightning-shine absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-16 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04)_0%,transparent_70%)] pointer-events-none z-10" />
      <div className="absolute inset-0 rounded-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_1px_0_0_0_rgba(255,255,255,0.02)] pointer-events-none z-10" />
      <div className="absolute top-0 left-0 w-16 h-16 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none z-10" />
      <div className="relative z-20">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white break-words">{project.title}</h3>
          {project.project_type && (
            <p className="text-sm text-amber-400/80 font-bold">{project.project_type}</p>
          )}
        </div>
        {dateStr && <p className="text-xs text-slate-500 mt-1">{dateStr}</p>}
        {project.description && (
          <div className="mt-3">
            <p className={`text-sm text-slate-300 leading-relaxed break-words ${expanded ? "" : "line-clamp-3"}`}>
              {project.description}
            </p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-white/60 hover:text-white text-xs font-bold flex items-center gap-1 md:hidden"
            >
              {expanded ? "Show less" : "Read more"}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}
        {project.project_url && (
          <div className="mt-3">
            <a
              href={project.project_url.startsWith("http") ? project.project_url : `https://${project.project_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.08] text-xs text-white/60 hover:text-white transition-colors border border-white/[0.08]"
            >
              <ExternalLink className="w-3 h-3" /> View Project
            </a>
          </div>
        )}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {project.tags.map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-600 border border-slate-700/50">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublicOrgPage({ authUidOverride }: { authUidOverride?: string }) {
  const { auth_uid } = useParams<{ auth_uid: string }>();
  const { session: googleSession } = useGoogleAuth();
  const isOwner = !!(googleSession?.user?.id && googleSession.user.id === (authUidOverride || auth_uid));
  const [org, setOrg] = useState<PublicOrg | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [members, setMembers] = useState<PublicMember[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [scoreData, setScoreData] = useState<any>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  useEffect(() => {
    const authUid = authUidOverride || auth_uid;

    if (!authUid) {
      setLoading(false);
      return;
    }

    const recruiterWallet = `gauth:${authUid}`;

    Promise.all([
      fetch(`/api/org/public?auth_uid=${authUid}`).then(r => r.json()),
      fetch(`/api/org/projects?auth_uid=${authUid}`).then(r => r.ok ? r.json() : { data: [] }),
      fetch(`/api/hiring/collections?auth_uid=${authUid}`).then(r => r.ok ? r.json() : { data: [] }),
      fetch(`/api/members/public?recruiterWallet=${encodeURIComponent(recruiterWallet)}`).then(r => r.ok ? r.json() : { data: [] }),
    ]).then(([orgRes, projRes, colRes, membersRes]) => {
      if (orgRes.error || !orgRes.org) { setNotFound(true); return; }
      setOrg(orgRes.org);
      if (Array.isArray(projRes.data)) setProjects(projRes.data);
      if (Array.isArray(colRes.data)) setCollections(colRes.data);
      if (Array.isArray(membersRes.data)) setMembers(membersRes.data);

      if (orgRes.org?.account_type === "builder") {
        fetch(`/api/v1/wallet/${encodeURIComponent(`gauth:${authUid}`)}/score`)
          .then(r => r.json())
          .then(score => { if (score && !score.error && score.score) setScoreData(score); })
          .catch(() => {});
      }
    }).finally(() => setLoading(false));
  }, [auth_uid, authUidOverride]);

  const isBuilder = org?.account_type === "builder";
  const isCommunity = !isBuilder && org?.org_type === "community";
  const accentHex = isBuilder ? "#6366f1" : isCommunity ? "#14b8a6" : "#f59e0b";

  const isProfileComplete = useMemo(() => {
    if (!isBuilder || !org) return false;
    const hasSocial = !!(org.twitter || org.linkedin || org.website || org.discord || org.telegram);
    return !!(org.bio && hasSocial && projects.length > 0);
  }, [isBuilder, org, projects]);

  const totalYearsExperience = useMemo(() => {
    if (!isBuilder || projects.length === 0) return 0;
    const intervals = projects
      .filter(p => p.start_date)
      .map(p => ({
        start: new Date(p.start_date!).getTime(),
        end: p.is_ongoing ? Date.now() : p.end_date ? new Date(p.end_date).getTime() : Date.now(),
      }))
      .filter(i => i.end > i.start)
      .sort((a, b) => a.start - b.start);
    if (intervals.length === 0) return 0;
    let totalMs = 0;
    let mStart = intervals[0].start;
    let mEnd = intervals[0].end;
    for (let i = 1; i < intervals.length; i++) {
      const { start, end } = intervals[i];
      if (start <= mEnd) { mEnd = Math.max(mEnd, end); }
      else { totalMs += mEnd - mStart; mStart = start; mEnd = end; }
    }
    totalMs += mEnd - mStart;
    return Math.floor(totalMs / (1000 * 60 * 60 * 24 * 365));
  }, [isBuilder, projects]);

  if (loading) return <LoadingScreen message="Loading organization profile..." />;

  if (notFound) {
    return (
      <>
        <div className="hidden md:block"><Navbar /></div>
        <main className="min-h-screen bg-[#111111] md:bg-black theme-bg-page theme-aware flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="text-2xl font-black text-white mb-2">Profile Not Found</h1>
            <p className="text-slate-400 text-sm mb-6">This profile doesn't exist or has been removed.</p>
            <Link href="/" className="px-4 py-2 rounded-lg bg-white/[0.06] text-white/70 text-sm font-bold border border-white/10 hover:bg-white/[0.1] transition-colors">
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!org) return null;

  if (isBuilder) {
    return (
      <div className="min-h-screen flex flex-col bg-[#111111] md:bg-black theme-bg-page theme-aware text-white relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white">
        <div className="hidden md:block"><Navbar /></div>
        <main className="flex-1 w-full max-w-full md:max-w-3xl mx-auto px-4 md:px-0 pt-6 md:pt-32 pb-28">

          {/* MAIN CV CARD — premium style matching /cv/[wallet] */}
          <div className="relative flex flex-col justify-between mb-8 p-5 md:p-8 rounded-2xl md:rounded-3xl overflow-hidden group w-full shadow-[0_12px_24px_-8px_rgba(0,0,0,0.9)] border border-white/[0.08] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]">
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-r from-slate-400/20 via-white/30 to-slate-400/20 opacity-60 animate-pulse pointer-events-none" />
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl border border-white/[0.04] pointer-events-none" style={{ background: "#0a0a0c" }} />
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl md:rounded-3xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[120%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-lightning-shine" />
            </div>
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-2px_4px_rgba(0,0,0,0.8),inset_1.5px_0_2px_rgba(255,255,255,0.06),inset_-1.5px_0_2px_rgba(0,0,0,0.6)] pointer-events-none z-30" />
            <div className="absolute -inset-[2px] rounded-2xl md:rounded-3xl bg-gradient-to-br from-slate-400/20 via-white/10 to-slate-500/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none z-30" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none z-30" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none z-30" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.04)_0%,transparent_70%)] pointer-events-none z-30" />

            {/* Top-right: Builder badge (mobile) + Score + Builder badge (desktop) */}
            <div className="absolute top-5 right-5 md:top-6 md:right-6 z-50 flex flex-col items-end gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-indigo-500/10 border-indigo-500/30">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-indigo-400">Builder</span>
              </div>
              {scoreData && (
                <button
                  onClick={() => setIsScoreModalOpen(true)}
                  className="hidden md:flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 hover:scale-110 hover:bg-[#a855f7]/10 hover:brightness-110 border border-transparent hover:border-[#a855f7]/40 shadow-[0_0_0_rgba(168,85,247,0)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                >
                  <span className="text-3xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#a855f7] via-fuchsia-400 to-blue-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    {scoreData.score}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#a855f7]/80 mt-1">CV Score</span>
                </button>
              )}
            </div>

            <div className="relative flex flex-col md:flex-row items-start gap-3 md:gap-8 w-full z-40">

              {/* Mobile: score row + avatar + name row */}
              <div className="md:hidden w-full space-y-4 mb-1">
                <div className="flex items-start justify-between gap-3">
                  {org.looking_for ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/55 text-[13px]">
                      <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-medium leading-snug">{org.looking_for}</span>
                    </div>
                  ) : <div />}
                  {scoreData && (
                    <button onClick={() => setIsScoreModalOpen(true)} className="flex flex-col items-end cursor-pointer flex-shrink-0">
                      <span className="text-[28px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#a855f7] via-fuchsia-400 to-blue-500">
                        {scoreData.score}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#a855f7]/70 mt-0.5">CV Score</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {org.avatar_url ? (
                    <img src={org.avatar_url} alt={org.org_name ?? "Profile"} className="w-[88px] h-[88px] rounded-full object-cover border-4 border-slate-800 shadow-xl flex-shrink-0" />
                  ) : (
                    <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-3xl border-4 border-slate-800 shadow-xl flex-shrink-0">👤</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-white leading-tight truncate">{org.org_name ?? "Unnamed Builder"}</h1>
                    {org.country && <p className="text-xs text-slate-500 mt-1">📍 {org.country}</p>}
                  </div>
                </div>
              </div>

              {/* Desktop: avatar column */}
              <div className="hidden md:flex flex-shrink-0 flex-col items-start">
                <div className="relative pb-3 pr-3">
                  {org.avatar_url ? (
                    <img src={org.avatar_url} alt={org.org_name ?? "Profile"} className="w-32 h-32 rounded-full object-cover border-4 border-slate-800 shadow-xl" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-4xl border-4 border-slate-800 shadow-xl">👤</div>
                  )}
                </div>
                {org.country && (
                  <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">{org.country}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/5 w-full">
                  <div className="w-7 h-7 rounded-lg bg-black/60 border border-white/[0.06] flex items-center justify-center">
                    <img src="/logo.png" alt="ChainVolio" className="h-4 w-auto opacity-70" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">ChainVolio</span>
                </div>
              </div>

              {/* Info column */}
              <div className="flex-1 flex flex-col text-left space-y-4 w-full">
                <h1 className="hidden md:block text-2xl md:text-4xl font-bold text-white">{org.org_name ?? "Unnamed Builder"}</h1>

                {/* Looking For pill — desktop */}
                {org.looking_for && (
                  <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm w-fit">
                    <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-medium leading-snug">{org.looking_for}</span>
                  </div>
                )}

                {/* Badges row */}
                <div className="flex flex-wrap items-center justify-start gap-3">
                  <RoleBadge isVerified={org.is_verified} type={org.is_verified ? "Builder" : undefined} />
                  <ProfileCompleteBadge isComplete={isProfileComplete} />
                  <CommunityBadge cvId={org.org_id_number} />
                  <ExperienceBadge years={totalYearsExperience} />
                </div>

                {/* Skills pills */}
                {org.skills && (
                  <div className="flex flex-wrap items-center justify-start gap-1.5 mt-1">
                    {org.skills.split(",").map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-black/60 border border-white/[0.06] text-[10px] md:text-xs text-slate-300 hover:border-white/[0.12] transition-colors">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {org.bio && <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">{org.bio}</p>}

                {(org.website || org.twitter || org.linkedin || org.discord || org.telegram) && (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-white/5 relative z-50">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      {org.twitter && (
                        <a href={org.twitter.startsWith("http") ? org.twitter : `https://x.com/${org.twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all" title="Twitter / X">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                      )}
                      {org.linkedin && (
                        <a href={org.linkedin.startsWith("http") ? org.linkedin : `https://linkedin.com/in/${org.linkedin.replace(/^(www\.)?linkedin\.com\/in\//, "")}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/20 transition-all" title="LinkedIn">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>
                        </a>
                      )}
                      {org.website && (
                        <a href={org.website.startsWith("http") ? org.website : `https://${org.website}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all" title="Website">
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {org.discord && (
                        <button onClick={() => { navigator.clipboard.writeText(org.discord!); setToast(`Discord: ${org.discord}`); }} className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all cursor-pointer" title="Copy Discord Handle">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 11.721 11.721 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.862-1.295 1.192-1.996a.076.076 0 0 0-.041-.106 13.046 13.046 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                        </button>
                      )}
                      {org.telegram && (
                        <a href={org.telegram.startsWith("http") ? org.telegram : `https://t.me/${org.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-[#26A5E4] hover:bg-[#26A5E4]/10 hover:border-[#26A5E4]/20 transition-all" title="Telegram">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0C5.347 0 0 5.347 0 11.944c0 6.597 5.347 11.944 11.944 11.944 6.597 0 11.944-5.347 11.944-11.944C23.888 5.347 18.541 0 11.944 0zm5.204 8.525c-.179 1.884-.962 5.925-1.359 8.041-.168.9-.499 1.203-.82 1.232-.698.064-1.226-.462-1.902-.905-1.057-.695-1.655-1.127-2.682-1.803-1.187-.781-.417-1.21.258-1.912.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.071-.064-.175-.041-.249-.024-.106.024-1.793 1.141-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.098.154.228.163.319.009.091.011.201.009.324z" /></svg>
                        </a>
                      )}
                      {org.github && (
                        <a href={`https://github.com/${org.github}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all" title="GitHub">
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {org.instagram && (
                        <a href={`https://instagram.com/${org.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-black/60 border border-white/[0.06] text-slate-400 hover:text-[#E4405F] hover:bg-[#E4405F]/10 hover:border-[#E4405F]/20 transition-all" title="Instagram">
                          <Instagram className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center justify-center md:justify-end opacity-60 hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-tight text-slate-400">
                        <span className="text-[8px] uppercase font-bold text-slate-600">ID</span>
                        <span className="font-black text-slate-300">#{String(org.org_id_number || 1).padStart(5, "0")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Proof of Work */}
          <h2 className="text-xl font-semibold mt-6 mb-4">Proof of Work</h2>
          {projects.length === 0 ? (
            <div className="p-12 border border-dashed border-slate-700/50 rounded-2xl text-center bg-slate-900/20">
              <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-3 opacity-50" />
              <p className="text-slate-400 font-medium">No proof of work added yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map((p) => (
                <BuilderWorkCard key={p.id} project={p} />
              ))}
            </div>
          )}

        </main>
        <Footer className="bg-[#030303]/90 backdrop-blur-md" />
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#111111] md:bg-black theme-bg-page theme-aware text-white relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white">
      <div className="hidden md:block"><Navbar /></div>
      <main className="flex-1 w-full max-w-full md:max-w-3xl mx-auto px-4 md:px-0 pt-6 md:pt-32 pb-28 md:pb-12 space-y-6">

          {/* Hero card */}
          <div className="relative p-6 md:p-8 rounded-2xl overflow-hidden border border-white/5 bg-black">
            <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${accentHex}10 0%, transparent 60%)` }} />

            {/* Top-right: verified badge or org type badge */}
            <div className="absolute top-6 right-6 md:top-8 md:right-8 z-30 flex flex-col items-end gap-2">
              {isBuilder ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-indigo-500/10 border-indigo-500/30">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-indigo-400">Builder</span>
                </div>
              ) : org.is_verified ? (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${isCommunity ? "bg-teal-500/10 border-teal-500/30" : "bg-amber-500/10 border-amber-500/30"}`}>
                  <ShieldCheck className={`w-3.5 h-3.5 ${isCommunity ? "text-teal-400" : "text-amber-400"}`} />
                  <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${isCommunity ? "text-teal-400" : "text-amber-400"}`}>
                    {isCommunity ? "Community Verified" : "Company Verified"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-slate-800/80 border-slate-700/50">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                    {isCommunity ? "Community / DAO" : "Company / Org"}
                  </span>
                </div>
              )}
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start gap-6 md:gap-8">
              {/* Avatar */}
              <div className="flex flex-col items-center flex-shrink-0">
                {org.avatar_url ? (
                  <img src={org.avatar_url} alt={org.org_name ?? "Profile"} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2" style={{ borderColor: `${accentHex}40` }} />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center border-2" style={{ background: `${accentHex}10`, borderColor: `${accentHex}30` }}>
                    {isBuilder
                      ? <User className="w-8 h-8" style={{ color: accentHex, opacity: 0.7 }} />
                      : <Building2 className="w-8 h-8" style={{ color: accentHex, opacity: 0.7 }} />
                    }
                  </div>
                )}
                {org.country && (
                  <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-white/5 bg-white/[0.03] text-slate-500">
                    📍 {org.country}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-3">{org.org_name ?? (isBuilder ? "Unnamed Builder" : "Unnamed Organization")}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    {isBuilder ? "Builder" : org.is_verified ? (isCommunity ? "Verified Community" : "Verified Organization") : (isCommunity ? "Community" : "Organization")}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    {projects.length + collections.length} Activities
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    {org.effective_plan.toUpperCase()} PLAN
                  </span>
                </div>
                {org.bio && <p className="text-base text-slate-300 leading-relaxed max-w-2xl">{org.bio}</p>}

                {/* Social links */}
                <div className="flex flex-wrap items-center gap-6 mt-6">
                  {org.website && (
                    <a href={org.website.startsWith("http") ? org.website : `https://${org.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                      <Globe className="w-3.5 h-3.5" /> Website
                    </a>
                  )}
                  {org.twitter && (
                    <a href={org.twitter.startsWith("http") ? org.twitter : `https://x.com/${org.twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                      <XIcon className="w-3.5 h-3.5" /> Twitter
                    </a>
                  )}
                  {org.linkedin && (
                    <a href={org.linkedin.startsWith("http") ? org.linkedin : `https://linkedin.com/company/${org.linkedin.replace(/^(www\.)?linkedin\.com\/company\//, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                      <LinkedInIcon className="w-3.5 h-3.5" /> LinkedIn
                    </a>
                  )}
                  {org.discord && (
                    <a href={org.discord.startsWith("http") ? org.discord : `https://discord.gg/${org.discord}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                      <DiscordIcon className="w-3.5 h-3.5" /> Discord
                    </a>
                  )}
                  {org.telegram && (
                    <a href={org.telegram.startsWith("http") ? org.telegram : `https://t.me/${org.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                      <Send className="w-3.5 h-3.5" /> Telegram
                    </a>
                  )}
                  <div className="flex-1" />
                  <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-tight text-slate-400">
                    <span className="text-[8px] uppercase font-bold text-slate-600">ID</span>
                    <span className="font-black text-slate-300">#{String(org.org_id_number || 1).padStart(5, "0")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile — owner only, mobile */}
          {isOwner && (
            <Link
              href="/org/edit-profile"
              className="md:hidden flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-white/10 bg-white/[0.03] text-white/60 text-sm font-bold hover:bg-white/[0.06] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Profile
            </Link>
          )}

          {/* Stats pods */}
          {isBuilder ? (
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 rounded-2xl bg-black border border-white/5 space-y-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-500/10">
                  <FolderOpen className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[20px] font-black text-white">{projects.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Projects</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-black border border-white/5 space-y-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-500/10">
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[20px] font-black text-white">{collections.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Hiring</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-black border border-white/5 space-y-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-500/10">
                  <FolderOpen className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[20px] font-black text-white">{projects.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Projects</p>
                </div>
              </div>
              <button
                onClick={() => members.length > 0 && setShowMembersModal(true)}
                className={`p-4 rounded-2xl bg-black border space-y-2 text-left transition-all ${members.length > 0 ? "border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer" : "border-white/5 cursor-default"}`}
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-500/10">
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[20px] font-black text-white">{members.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Members</p>
                  {members.length > 0 && <p className="text-[9px] text-indigo-400/60 mt-0.5">Click to view</p>}
                </div>
              </button>
            </div>
          )}

          {/* Members Modal */}
          {showMembersModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <p className="text-sm font-bold text-white">Members ({members.length})</p>
                  </div>
                  <button onClick={() => setShowMembersModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4 text-white/40" />
                  </button>
                </div>
                <div className="p-3 max-h-[60vh] overflow-y-auto space-y-2">
                  {members.map((m) => {
                    const name = m.display_name ?? (m.wallet_address.slice(0, 6) + "…" + m.wallet_address.slice(-4));
                    const isAdmin = m.role === "admin";
                    return (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {m.avatar_url
                            ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                            : <span className="text-xs font-bold text-white/40">{name[0]?.toUpperCase()}</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{name}</p>
                          {m.card_number && <p className="text-[9px] text-white/20 font-bold">CV #{m.card_number}</p>}
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border flex-shrink-0 ${
                          isAdmin
                            ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                            : "text-white/30 bg-white/5 border-white/10"
                        }`}>
                          {isAdmin ? <Crown className="w-2.5 h-2.5" /> : <UserCheck className="w-2.5 h-2.5" />}
                          {m.role}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-slate-700/50">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <FolderOpen className="w-4 h-4 text-emerald-400" />
                </div>
                <h2 className="text-sm font-black text-white">Projects &amp; Programs</h2>
                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">{projects.length}</span>
              </div>
              <div className="p-4 grid gap-3">
                {projects.map(p => (
                  <div key={p.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-white">{p.title}</h3>
                      {p.project_type && (
                        <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-400 border border-slate-600/50">{p.project_type}</span>
                      )}
                      {(p.is_ongoing || p.status === "active") && (
                        <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                      )}
                      {p.status === "completed" && (
                        <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Completed</span>
                      )}
                    </div>
                    {p.description && <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-1.5">{p.description}</p>}
                    <div className="flex flex-wrap items-center gap-3">
                      {p.start_date && (
                        <span className="text-[10px] text-slate-600 font-mono">
                          {new Date(p.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          {p.is_ongoing ? " — Ongoing" : p.end_date ? ` — ${new Date(p.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : ""}
                        </span>
                      )}
                      {p.project_url && (
                        <a href={p.project_url.startsWith("http") ? p.project_url : `https://${p.project_url}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-teal-400 hover:underline flex items-center gap-1">
                          <ExternalLink className="w-2.5 h-2.5" /> View Project
                        </a>
                      )}
                    </div>
                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {p.tags.map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-600 border border-slate-700/50">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hiring Collections */}
          {collections.length > 0 && (
            <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-slate-700/50">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                </div>
                <h2 className="text-sm font-black text-white">Open Hiring Collections</h2>
                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">{collections.length}</span>
              </div>
              <div className="p-4 grid gap-3">
                {collections.map(col => (
                  <Link key={col.id} href={`/r/${col.slug}`} target="_blank"
                    className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{col.title}</h3>
                      <span className="text-[10px] text-slate-500">{new Date(col.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 group-hover:text-teal-400 transition-colors">
                      View <ExternalLink className="w-2.5 h-2.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {projects.length === 0 && collections.length === 0 && (
            <div className="py-10 text-center text-slate-500 text-sm">No public content yet.</div>
          )}

      </main>
      <Footer />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
