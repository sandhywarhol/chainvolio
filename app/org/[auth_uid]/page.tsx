"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Toast } from "@/components/ui/Toast";
import { XIcon, LinkedInIcon, DiscordIcon } from "@/components/ui/SocialIcons";

type PublicOrg = {
  auth_uid: string;
  org_name: string | null;
  org_type: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  discord: string | null;
  telegram: string | null;
  country: string | null;
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

export default function PublicOrgPage({ authUidOverride }: { authUidOverride?: string }) {
  const { auth_uid } = useParams<{ auth_uid: string }>();
  const [org, setOrg] = useState<PublicOrg | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [members, setMembers] = useState<PublicMember[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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
    }).finally(() => setLoading(false));
  }, [auth_uid, authUidOverride]);



  if (loading) return <LoadingScreen message="Loading organization profile..." />;

  if (notFound) {
    return (
      <>
        <div className="hidden md:block"><Navbar /></div>
        <main className="min-h-screen bg-black theme-bg-page theme-aware flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-black text-white mb-2">Organization Not Found</h1>
            <p className="text-slate-400 text-sm mb-6">This org page doesn't exist or has been removed.</p>
            <Link href="/" className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!org) return null;

  const isCommunity = org.org_type === "community";
  const accentHex = isCommunity ? "#14b8a6" : "#f59e0b";

  return (
    <div className="min-h-screen flex flex-col bg-black theme-bg-page theme-aware text-white relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white">
      <div className="hidden md:block"><Navbar /></div>
      <main className="flex-1 w-full max-w-full md:max-w-3xl mx-auto px-4 md:px-0 pt-6 md:pt-32 pb-28 md:pb-12 space-y-6">

          {/* Hero card */}
          <div className="relative p-6 md:p-8 rounded-2xl overflow-hidden border border-white/5 bg-black">
            <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${accentHex}10 0%, transparent 60%)` }} />

            {/* Top-right: verified badge or org type badge */}
            <div className="absolute top-6 right-6 md:top-8 md:right-8 z-30 flex flex-col items-end gap-2">
              {org.is_verified ? (
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
                  <img src={org.avatar_url} alt={org.org_name ?? "Org"} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2" style={{ borderColor: `${accentHex}40` }} />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center border-2" style={{ background: `${accentHex}10`, borderColor: `${accentHex}30` }}>
                    <Building2 className="w-8 h-8" style={{ color: accentHex, opacity: 0.7 }} />
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
                <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-3">{org.org_name ?? "Unnamed Organization"}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    {org.is_verified ? (isCommunity ? "Verified Community" : "Verified Organization") : (isCommunity ? "Community" : "Organization")}
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

          {/* Stats pods */}
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
