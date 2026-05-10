"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Plus,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Copy,
  CheckCircle2,
  Globe,
  Send,
  Mail,
  FolderOpen,
  Trash2,
  CreditCard,
  Zap,
  Link2,
  Unlink,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { Toast } from "@/components/ui/Toast";
import { XIcon, LinkedInIcon, DiscordIcon } from "@/components/ui/SocialIcons";
import { OrgProjectForm, type OrgProject } from "@/components/org/OrgProjectForm";
import { getBadgeStyles, getAttestationQuota, getHiringLimit, normalizeTier } from "@/lib/paymentConfig";
import { getEffectiveLimits, getPlanBadgeStyle } from "@/lib/plans";
import type { PlanName } from "@/lib/plans";
import { format } from "date-fns";
import type { OrgAccount } from "@/hooks/useGoogleAuth";

type OrgProfile = {
  displayName: string;
  bio?: string | null;
  skills?: string | null;
  avatarUrl?: string | null;
  twitter?: string | null;
  github?: string | null;
  linkedin?: string | null;
  website?: string | null;
  discord?: string | null;
  email?: string | null;
  telegram?: string | null;
  instagram?: string | null;
  country?: string | null;
  timezone?: string | null;
  cardNumber?: number | null;
  organization?: string | null;
  role?: string | null;
  isVerified?: boolean;
  isExpired?: boolean;
  isExpiringSoon?: boolean;
  expiresAt?: string | null;
  verifierTier?: number;
  verificationTier?: string | null;
  verificationStatus?: string | null;
  verificationType?: string | null;
  pendingVerificationType?: string | null;
  rejectionReason?: string | null;
  attestationQuota?: number;
  attestationUsed?: number;
  attestationResetDate?: string | null;
  completionPercentage?: number;
};

type HiringCollection = {
  id: string;
  title: string;
  slug: string;
  created_at: string;
};

type Props = {
  profile: OrgProfile;
  walletAddress?: string | null;
  collections: HiringCollection[];
  attestationCount: number;
  onRequestVerification: (isRenewal: boolean) => void;
  googleOrgAccount?: OrgAccount | null;
  accessToken?: string | null;
};

export function OrgDashboard({ profile, walletAddress, collections, attestationCount, onRequestVerification, googleOrgAccount, accessToken }: Props) {
  const [hiringExpanded, setHiringExpanded] = useState(true);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Projects state
  const [projects, setProjects] = useState<OrgProject[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const [managingSubscription] = useState(false);

  // Wallet linking state (Google org users only)
  const { publicKey } = useWallet();
  const [linkingWallet, setLinkingWallet] = useState(false);
  const [unlinkingWallet, setUnlinkingWallet] = useState(false);
  const [linkedWallet, setLinkedWallet] = useState<string | null>(googleOrgAccount?.wallet_address ?? null);

  // Keep local linkedWallet in sync if orgAccount changes
  useEffect(() => {
    setLinkedWallet(googleOrgAccount?.wallet_address ?? null);
  }, [googleOrgAccount?.wallet_address]);

  const handleLinkWallet = async () => {
    if (!publicKey || !googleOrgAccount?.auth_uid || !accessToken) return;
    setLinkingWallet(true);
    try {
      const res = await fetch("/api/org-accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ auth_uid: googleOrgAccount.auth_uid, wallet_address: publicKey.toBase58() }),
      });
      if (res.ok) {
        setLinkedWallet(publicKey.toBase58());
        setToastMessage("Signing wallet linked successfully!");
      } else {
        setToastMessage("Failed to link wallet. Please try again.");
      }
    } finally {
      setLinkingWallet(false);
    }
  };

  const handleUnlinkWallet = async () => {
    if (!googleOrgAccount?.auth_uid || !accessToken) return;
    setUnlinkingWallet(true);
    try {
      const res = await fetch("/api/org-accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ auth_uid: googleOrgAccount.auth_uid, wallet_address: null }),
      });
      if (res.ok) {
        setLinkedWallet(null);
        setToastMessage("Signing wallet unlinked.");
      } else {
        setToastMessage("Failed to unlink wallet.");
      }
    } finally {
      setUnlinkingWallet(false);
    }
  };

  const badge = getBadgeStyles(profile.verificationType ?? undefined);
  const effectiveType = profile.verificationType ?? profile.pendingVerificationType ?? undefined;
  const isCommunity = normalizeTier(effectiveType).includes("community") ||
    normalizeTier(effectiveType).includes("dao") ||
    googleOrgAccount?.org_type === "community";
  const orgLabel = isCommunity ? "Community" : "Organization";

  // Subscription helpers (Google-only path)
  const planName = (googleOrgAccount?.plan_name ?? "free") as PlanName;
  const subStatus = googleOrgAccount?.subscription_status ?? "free";
  const isPastDue = subStatus === "past_due";
  const isExpired = googleOrgAccount?.current_period_end
    ? new Date(googleOrgAccount.current_period_end) < new Date()
    : false;
  const effectivePlan: PlanName = (subStatus === "canceled" || isExpired) ? "free" : planName;
  const planLimits = getEffectiveLimits(effectivePlan, false);
  const planBadge = getPlanBadgeStyle(effectivePlan);
  const isPaidPlan = effectivePlan !== "free";

  const handleManageSubscription = () => {
    setToastMessage("Payment management is coming soon. Contact us to upgrade your plan.");
  };

  // Fetch projects
  useEffect(() => {
    const wallet = walletAddress;
    const authUid = googleOrgAccount?.auth_uid;
    if (!wallet && !authUid) return;

    const url = wallet
      ? `/api/org/projects?wallet=${wallet}`
      : `/api/org/projects?auth_uid=${authUid}`;

    fetch(url)
      .then(r => r.ok ? r.json() : { data: [] })
      .then(data => { if (Array.isArray(data.data)) setProjects(data.data); })
      .catch(() => {});
  }, [walletAddress, googleOrgAccount]);

  const handleDeleteProject = async (id: string) => {
    const wallet = walletAddress;
    const authUid = googleOrgAccount?.auth_uid;

    const params = new URLSearchParams({ id });
    if (wallet) params.set("wallet", wallet);
    else if (authUid) params.set("auth_uid", authUid);

    const headers: Record<string, string> = {};
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    const res = await fetch(`/api/org/projects?${params}`, { method: "DELETE", headers });
    if (res.ok) setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleShare = async () => {
    const isGooglePath = !!googleOrgAccount && !walletAddress;
    const formattedName = encodeURIComponent((isGooglePath ? googleOrgAccount?.org_name : profile.displayName)?.replace(/\s+/g, "-") || "Org");
    const rawId = isGooglePath ? googleOrgAccount?.org_id_number : profile.cardNumber;
    const cleanId = String(rawId || 1).padStart(5, "0");
    const url = `${window.location.origin}/${formattedName}/${cleanId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setToastMessage(`${orgLabel} link copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToastMessage("Failed to copy link.");
    }
  };

  const hiringLimit = getHiringLimit(profile.verificationTier ?? undefined);
  const hiringUsed = collections.length;

  const attestationQuota = profile.attestationQuota ?? getAttestationQuota(profile.verificationTier ?? undefined);
  const attestationUsed = profile.attestationUsed ?? 0;
  const attestationPct = attestationQuota > 0 ? Math.min(100, Math.round((attestationUsed / attestationQuota) * 100)) : 0;
  const attestationNearLimit = attestationPct >= 80;

  // ── Projects section ─────────────────────────────────────────────────────────
  const ProjectsSection = (
    <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
      <div
        onClick={() => setProjectsExpanded(!projectsExpanded)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg transition-colors bg-white/5">
            <FolderOpen className="w-4 h-4 transition-colors text-slate-500" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              Projects &amp; Programs
              {projects.length > 0 && (
                <span className="text-[10px] font-bold bg-white/5 text-white/50 px-2 py-0.5 rounded-full border border-white/10">
                  {projects.length}
                </span>
              )}
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {projects.length === 0 ? "No projects added yet" : `${projects.length} project${projects.length !== 1 ? "s" : ""} published`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={e => { e.stopPropagation(); setShowProjectForm(true); }}
            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <Plus className="w-3 h-3" /> Add Project
          </button>
          {projectsExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {projectsExpanded && (
        <div className="px-4 pb-4 border-t border-slate-700/50 pt-4">
          {projects.length === 0 ? (
            <div className="py-8 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
                <FolderOpen className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">No projects yet</h3>
              <p className="text-xs text-slate-500 mb-4 max-w-xs">
                Showcase your programs, initiatives, hackathons, or products to attract talent and partners.
              </p>
              <button
                onClick={() => setShowProjectForm(true)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold rounded-lg transition-all border border-white/10"
              >
                Add First Project
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {projects.map(p => (
                <div key={p.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-start gap-3 group hover:bg-white/[0.04] transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-white">{p.title}</h3>
                      {p.project_type && (
                        <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-400 border border-slate-600/50">
                          {p.project_type}
                        </span>
                      )}
                      {p.status === "completed" && (
                        <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Completed
                        </span>
                      )}
                      {(p.is_ongoing || p.status === "active") && (
                        <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">
                          Active
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-1.5">{p.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                      {p.start_date && (
                        <span className="text-[10px] text-slate-600 font-mono">
                          {new Date(p.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          {p.is_ongoing ? " — Ongoing" : p.end_date
                            ? ` — ${new Date(p.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                            : ""}
                        </span>
                      )}
                      {p.project_url && (
                        <a
                          href={p.project_url.startsWith("http") ? p.project_url : `https://${p.project_url}`}
                          target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-[10px] text-white/50 hover:text-white hover:underline flex items-center gap-1 transition-colors"
                        >
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
                  <button
                    onClick={() => handleDeleteProject(p.id)}
                    className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0 mt-0.5"
                    title="Remove project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── Unified path helpers ──────────────────────────────────────────────────────
  const isGooglePath = !!googleOrgAccount && !walletAddress;
  const isActive = isGooglePath ? isPaidPlan : (profile.isVerified && !profile.isExpired);
  const accentHex = isCommunity ? "#14b8a6" : "#f59e0b";
  const orgId = isGooglePath && googleOrgAccount?.org_id_number
    ? `ORG #${String(googleOrgAccount.org_id_number).padStart(5, "0")}`
    : !isGooglePath && profile.cardNumber
      ? `ORG #${String(profile.cardNumber).padStart(5, "0")}`
      : "ORG #00001";
  const formattedName = encodeURIComponent((isGooglePath ? googleOrgAccount?.org_name : profile.displayName)?.replace(/\s+/g, "-") || "Org");
  const rawId = isGooglePath ? googleOrgAccount?.org_id_number : profile.cardNumber;
  const cleanId = String(rawId || 1).padStart(5, "0");
  const publicPageUrl = `/${formattedName}/${cleanId}`;
  const editUrl = isGooglePath ? "/org/edit-profile" : "/org/edit-profile-wallet";
  const effectiveHiringLimit = isGooglePath ? planLimits.collections : hiringLimit;
  const isAtEffectiveLimit = effectiveHiringLimit !== null && hiringUsed >= effectiveHiringLimit;
  const effectiveRemaining = effectiveHiringLimit !== null ? Math.max(0, effectiveHiringLimit - hiringUsed) : null;
  const actionBadgeText = isGooglePath
    ? planBadge.text
    : (profile.isVerified ? (profile.verificationTier ?? "Verified") : (profile.verificationStatus === "pending" ? "Pending" : "Unverified"));
  const actionBadgeClass = isGooglePath
    ? planBadge.className
    : (profile.isVerified ? badge.color : "bg-slate-700/50 text-slate-500 border-slate-600/50");

  // ── Unified Org Dashboard ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${actionBadgeClass}`}>
            {actionBadgeText}
          </span>
          {isPastDue && (
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border bg-red-500/10 text-red-400 border-red-500/20">
              Payment Failed
            </span>
          )}
          {!isGooglePath && profile.isExpired && (
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border bg-red-500/10 text-red-400 border-red-500/20">
              Expired
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isGooglePath ? (
            isPaidPlan ? (
              <button
                disabled={true}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-500 border border-slate-700 text-xs font-medium cursor-not-allowed opacity-50"
                title="Billing management is currently under maintenance"
              >
                Billing Unavailable
              </button>
            ) : null
          ) : profile.isVerified ? (
            (profile.isExpired || profile.isExpiringSoon) ? (
              <button
                onClick={() => onRequestVerification(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-widest transition-colors ${
                  profile.isExpired
                    ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                    : "bg-amber-400/10 border-amber-400/20 text-amber-400 hover:bg-amber-400/20"
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                {profile.isExpired ? "Expired — Renew" : "Renew"}
              </button>
            ) : (profile.verifierTier && profile.verifierTier < 4) ? (
              <button
                onClick={() => onRequestVerification(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/20 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Upgrade Tier
              </button>
            ) : null
          ) : null}
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-xs font-medium text-white transition-colors flex items-center gap-1.5"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Share"}
          </button>
          <Link
            href={publicPageUrl} target="_blank"
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-xs font-medium text-white transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Page
          </Link>
          <Link
            href={editUrl}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-xs font-medium text-white transition-colors"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Payment failed banner (Google only) */}
      {isPastDue && (
        <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-black text-red-400 mb-0.5">Payment Failed</p>
            <p className="text-xs text-slate-400">Your last payment could not be processed. Update your payment method to keep your features active.</p>
          </div>
          <button onClick={handleManageSubscription} disabled={managingSubscription} className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 transition-colors">
            Update Payment
          </button>
        </div>
      )}

      {/* Expiry warning (wallet only) */}
      {!isGooglePath && profile.isExpiringSoon && !profile.isExpired && (
        <div className="p-4 rounded-xl border border-amber-400/20 bg-amber-400/5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300/90">
            Your verification expires on <strong>{profile.expiresAt ? format(new Date(profile.expiresAt), "MMM d, yyyy") : "soon"}</strong>. Renew now to maintain your trust authority.
          </p>
        </div>
      )}

      {/* Hero card */}
      <div className="relative p-6 md:p-8 rounded-3xl overflow-hidden border border-white/5 bg-black">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${accentHex}10 0%, transparent 60%)` }} />

        {/* Status badge top-right */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 z-30">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${isCommunity ? "bg-teal-500/10 border-teal-500/30" : "bg-amber-500/10 border-amber-500/30"}`}>
            {isActive
              ? <ShieldCheck className={`w-3.5 h-3.5 ${isCommunity ? "text-teal-400" : "text-amber-400"}`} />
              : <Building2 className={`w-3.5 h-3.5 ${isCommunity ? "text-teal-400" : "text-amber-400"}`} />
            }
            <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${isCommunity ? "text-teal-400" : "text-amber-400"}`}>
              {isActive
                ? (isCommunity ? "Community Verified" : "Company Verified")
                : (profile.verificationStatus === "pending"
                    ? "Verification Pending"
                    : isCommunity ? "Community / DAO" : "Company / Org")
              }
            </span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start gap-6 md:gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center flex-shrink-0">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.displayName} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2" style={{ borderColor: `${accentHex}40` }} />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center border-2" style={{ background: `${accentHex}10`, borderColor: `${accentHex}30` }}>
                <Building2 className="w-8 h-8" style={{ color: accentHex, opacity: 0.7 }} />
              </div>
            )}
            {profile.country && (
              <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-white/5 bg-white/[0.03] text-slate-500">
                📍 {profile.country}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-1">{profile.displayName}</h1>
            {orgId && <p className="text-[10px] font-mono text-slate-600 mb-3">{orgId}</p>}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-black tracking-widest text-slate-400">
                {isGooglePath ? `${planBadge.text} Plan` : (profile.verificationTier ?? (profile.isVerified ? "Verified" : "Unverified"))}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-black tracking-widest text-slate-400">
                {collections.length} Collection{collections.length !== 1 ? "s" : ""}
              </span>
            </div>
            {profile.bio && <p className="text-base text-slate-300 leading-relaxed max-w-2xl">{profile.bio}</p>}

            {/* Social links */}
            <div className="flex flex-wrap items-center gap-6 mt-6">
              {profile.website && (
                <a href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
              {profile.twitter && (
                <a href={profile.twitter.startsWith("http") ? profile.twitter : `https://x.com/${profile.twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  <XIcon className="w-3.5 h-3.5" /> Twitter
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://linkedin.com/company/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  <LinkedInIcon className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {profile.discord && (
                <a href={profile.discord.startsWith("http") ? profile.discord : `https://discord.gg/${profile.discord}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  <DiscordIcon className="w-3.5 h-3.5" /> Discord
                </a>
              )}
              {profile.telegram && (
                <a href={profile.telegram.startsWith("http") ? profile.telegram : `https://t.me/${profile.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  <Send className="w-3.5 h-3.5" /> Telegram
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5" /> Email
                </a>
              )}
            </div>

            {!profile.bio && !profile.website && (
              <p className="text-xs text-slate-500 mt-5">
                <Link href={editUrl} className="text-white/50 hover:text-white hover:underline">Complete your profile</Link> to increase visibility.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4 impact pods */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: LayoutDashboard,
            label: "Hiring Collections",
            val: collections.length,
            col: "text-white/60",
            bg: "bg-white/5",
            warn: isAtEffectiveLimit,
          },
          isGooglePath
            ? { icon: CreditCard, label: "Saved Candidates", val: googleOrgAccount!.saved_candidates_count, col: "text-blue-400", bg: "bg-blue-500/10", warn: false }
            : { icon: ShieldCheck, label: "Attestations Issued", val: attestationCount, col: "text-blue-400", bg: "bg-blue-500/10", warn: false },
          {
            icon: ShieldCheck,
            label: "Status",
            val: isGooglePath ? planBadge.text : (profile.isVerified ? (profile.verificationTier ?? "Verified") : "Unverified"),
            col: isActive ? (isCommunity ? "text-teal-400" : "text-amber-400") : "text-slate-400",
            bg: isActive ? (isCommunity ? "bg-teal-500/10" : "bg-amber-500/10") : "bg-slate-700/50",
            warn: false,
          },
          { icon: FolderOpen, label: "Projects", val: projects.length, col: "text-indigo-400", bg: "bg-indigo-500/10", warn: false },
        ].map((pod, i) => (
          <div key={i} className={`p-4 rounded-2xl bg-black border space-y-2 hover:border-white/10 transition-all ${pod.warn ? "border-rose-500/30" : "border-white/5"}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl ${pod.bg}`}>
              <pod.icon className={`w-4 h-4 ${pod.warn ? "text-rose-400" : pod.col}`} />
            </div>
            <div>
              <p className={`text-[20px] font-black ${pod.warn ? "text-rose-400" : "text-white"}`}>{pod.val}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{pod.label}</p>
              {pod.warn && (
                isGooglePath
                  ? <p className="text-[9px] text-rose-400 mt-0.5"><Link href="/recruiter/pricing" className="hover:underline">Upgrade →</Link></p>
                  : <p className="text-[9px] text-rose-400 mt-0.5">Limit reached</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Subscribe / Verify CTA */}
      {!isActive ? (
        isGooglePath ? (
          <div className="p-5 rounded-2xl border border-teal-500/20 bg-teal-500/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10 flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-black text-white">Get {orgLabel} Verified</p>
                <p className="text-xs text-slate-400 mt-0.5">Subscribe to unlock unlimited collections, candidates, and your verified badge.</p>
              </div>
            </div>
            <Link href="/recruiter/pricing" className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-black border border-white/10 transition-colors">
              <Zap className="w-3.5 h-3.5" /> View Plans →
            </Link>
          </div>
        ) : profile.verificationStatus === "pending" ? (
          <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-black text-amber-400 mb-1">Verification Under Review</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Your organization verification request is being reviewed. Review typically takes 24–48 hours.</p>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-teal-500/20 bg-teal-500/5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-teal-500/10 flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-white mb-1">Get Verified to Unlock {orgLabel} Features</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Verified organizations can issue cryptographic work attestations, run hiring collections, and appear as a trusted authority on candidates' CVs.
                </p>
                <div className="flex flex-col gap-2 mb-5">
                  {[
                    `Fill in your ${orgLabel.toLowerCase()} profile (name, bio, website)`,
                    "Submit a verification request with your proof link",
                    "Wait for admin review (usually 24–48h)",
                    "Start endorsing talent and creating hiring collections",
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black flex items-center justify-center mt-0.5">{idx + 1}</span>
                      <span className="text-xs text-slate-300">{step}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onRequestVerification(false)}
                  className="px-4 py-2 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-black border border-teal-500/20 transition-colors"
                >
                  Apply for Verification →
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        isGooglePath && googleOrgAccount?.current_period_end ? (
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-between gap-4">
            <p className="text-xs text-white/60">
              {planBadge.text} plan active — renews <strong>{new Date(googleOrgAccount.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>
            </p>
            <button onClick={handleManageSubscription} disabled={managingSubscription} className="flex-shrink-0 text-xs text-white/50 hover:text-white hover:underline font-bold disabled:opacity-50">
              {managingSubscription ? "Loading..." : "Manage"}
            </button>
          </div>
        ) : null
      )}

      {/* Plan & Usage (active users) */}
      {isActive && (
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-700/50">
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Plan &amp; Usage</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${isGooglePath ? planBadge.className : badge.color}`}>
                    {isGooglePath ? planBadge.text : (profile.verificationTier ?? "Verified")}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isGooglePath
                    ? (isPaidPlan && googleOrgAccount!.current_period_end
                        ? `Renews ${new Date(googleOrgAccount!.current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                        : "Upgrade to unlock more collections and candidates")
                    : (profile.expiresAt
                        ? `Verification expires ${format(new Date(profile.expiresAt), "MMM d, yyyy")}`
                        : "Monthly attestation quota")
                  }
                </p>
              </div>
            </div>
            {isGooglePath ? (
              <button onClick={handleManageSubscription} disabled={managingSubscription} className="text-xs text-white/50 hover:text-white hover:underline font-medium disabled:opacity-50">
                {managingSubscription ? "Loading..." : "Manage Subscription"}
              </button>
            ) : (profile.verifierTier && profile.verifierTier < 4) ? (
              <button onClick={() => onRequestVerification(false)} className="text-xs text-amber-400 hover:underline font-medium">
                Upgrade Tier
              </button>
            ) : null}
          </div>

          <div className="space-y-3">
            {isGooglePath ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-400">Hiring Collections</span>
                    <span className="text-[11px] font-bold text-slate-400">{collections.length} / {planLimits.collections ?? "∞"}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${planLimits.collections !== null && collections.length >= planLimits.collections ? "bg-rose-500" : "bg-gradient-to-r from-white/40 to-white/60"}`}
                      style={{ width: planLimits.collections !== null ? `${Math.min(100, (collections.length / planLimits.collections) * 100)}%` : "0%" }}
                    />
                  </div>
                  {planLimits.collections !== null && collections.length >= planLimits.collections && (
                    <p className="text-[10px] text-rose-400 mt-1 font-medium">Limit reached — <Link href="/recruiter/pricing" className="underline">upgrade your plan</Link></p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-400">Saved Candidates</span>
                    <span className="text-[11px] font-bold text-slate-400">{googleOrgAccount!.saved_candidates_count} / {planLimits.candidates ?? "∞"}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${planLimits.candidates !== null && googleOrgAccount!.saved_candidates_count >= planLimits.candidates ? "bg-rose-500" : "bg-gradient-to-r from-blue-500/60 to-blue-400"}`}
                      style={{ width: planLimits.candidates !== null ? `${Math.min(100, (googleOrgAccount!.saved_candidates_count / planLimits.candidates) * 100)}%` : "0%" }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2.5 group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Monthly Attestation Usage</span>
                  <span className={`text-[11px] font-bold ${attestationNearLimit ? "text-amber-400" : "text-slate-400"}`}>
                    {attestationUsed} / {attestationQuota}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${attestationNearLimit ? "bg-amber-500" : "bg-gradient-to-r from-white/40 to-white/60"}`}
                    style={{ width: `${attestationPct}%` }}
                  />
                </div>
                {attestationNearLimit && (
                  <p className="text-[11px] text-amber-400/80 font-medium">⚠ Approaching monthly limit — {attestationQuota - attestationUsed} left this period</p>
                )}
                {profile.attestationResetDate && (
                  <p className="text-[9px] text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    Resets {format(new Date(profile.attestationResetDate), "MMM d, yyyy")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attestation Signing — wallet linking for Google org users (paid plan only) */}
      {isGooglePath && isPaidPlan && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-slate-700/50">
            <div className="p-2 rounded-lg bg-teal-500/10">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-black text-white">Attestation Signing</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Link a Solana wallet to issue on-chain attestations as {isCommunity ? "Community Verified" : "Company Verified"}
              </p>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${isCommunity ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
              {isCommunity ? `${getAttestationQuota("community")}/mo` : `${getAttestationQuota("company")}/mo`}
            </span>
          </div>
          <div className="p-4 space-y-4">
            {linkedWallet ? (
              <>
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-white/50 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white/70">Wallet Linked</p>
                      <p className="text-[10px] font-mono text-slate-500 truncate">{linkedWallet}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleUnlinkWallet}
                    disabled={unlinkingWallet}
                    className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/20 transition-colors disabled:opacity-50"
                  >
                    <Unlink className="w-3 h-3" />
                    {unlinkingWallet ? "Removing..." : "Unlink"}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  When you visit an attestation link, connect this wallet to sign on behalf of your organization. Your Google org session will remain active.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-400">
                  Connect a Solana wallet below and link it to your org account. Once linked, that wallet becomes your dedicated signing device for attestations — your Google session is never affected.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <WalletMultiButton />
                  {publicKey && publicKey.toBase58() !== linkedWallet && (
                    <button
                      onClick={handleLinkWallet}
                      disabled={linkingWallet}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold border border-white/10 transition-colors disabled:opacity-50"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      {linkingWallet ? "Linking..." : "Save as Signing Wallet"}
                    </button>
                  )}
                </div>
                {publicKey && (
                  <p className="text-[10px] text-slate-500 font-mono">{publicKey.toBase58().slice(0, 12)}…{publicKey.toBase58().slice(-8)}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Projects & Programs */}
      {ProjectsSection}

      {/* Hiring Center */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <div
          onClick={() => setHiringExpanded(!hiringExpanded)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg transition-colors bg-slate-700/50">
              <LayoutDashboard className="w-4 h-4 transition-colors text-slate-500" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                Hiring Center
                {collections.length > 0 && (
                  <span className="text-[10px] font-bold bg-white/5 text-white/50 px-2 py-0.5 rounded-full border border-white/10">{collections.length}</span>
                )}
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {effectiveHiringLimit === null
                  ? <span className="text-white/60 font-bold">Unlimited access</span>
                  : <span className={isAtEffectiveLimit ? "text-rose-400 font-bold" : ""}>{hiringUsed}/{effectiveHiringLimit} used{effectiveRemaining !== null && effectiveRemaining <= 1 ? " — last slot" : ""}</span>
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/hiring/create"
              onClick={e => e.stopPropagation()}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${
                isAtEffectiveLimit
                  ? "text-slate-500 cursor-not-allowed pointer-events-none"
                  : "text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
              }`}
            >
              <Plus className="w-3 h-3" /> New Collection
            </Link>
            {hiringExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </div>
        </div>

        {hiringExpanded && (
          <div className="px-4 pb-4 border-t border-slate-700/50 pt-4">
            {collections.length > 0 ? (
              <div className="grid gap-3">
                {collections.map(col => (
                  <div key={col.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-white/80 transition-colors">{col.title}</h3>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5">
                        <span>{new Date(col.created_at).toLocaleDateString()}</span>
                        <Link href={`/r/${col.slug}`} target="_blank" className="hover:text-white flex items-center gap-1 transition-colors" onClick={e => e.stopPropagation()}>
                          Public Page <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                    <Link
                      href={`/hiring/${col.slug}/dashboard`}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-bold rounded-lg transition-colors border border-white/10"
                      onClick={e => e.stopPropagation()}
                    >
                      Dashboard
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
                <h3 className="text-sm font-bold text-white mb-2">Source Talent for Your {orgLabel}</h3>
                <p className="text-xs text-slate-500 mb-4 max-w-sm">Create a hiring collection to discover and track verified talent.</p>
                <Link href="/hiring/create" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold rounded-lg transition-all border border-white/10">
                  Create First Collection
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {showProjectForm && (
        <OrgProjectForm
          ownerWallet={walletAddress}
          ownerAuthUid={googleOrgAccount?.auth_uid}
          accessToken={accessToken}
          onSuccess={(p) => { setProjects(prev => [p, ...prev]); setShowProjectForm(false); }}
          onClose={() => setShowProjectForm(false)}
        />
      )}
    </div>
  );
}
