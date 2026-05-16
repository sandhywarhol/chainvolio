"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ReceiptForm } from "@/components/receipt/ReceiptForm";
import { ReceiptList } from "@/components/receipt/ReceiptList";
import { Toast } from "@/components/ui/Toast";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { supabase } from "@/lib/supabase/client";
import { VerificationRequestModal } from "@/components/profile/VerificationRequestModal";
import { CommunityBadge } from "@/components/profile/CommunityBadge";
import { RoleBadge } from "@/components/profile/RoleBadge";
import { CertificateSection, type Certificate } from "@/components/profile/CertificateSection";
import { CertificateUploadModal } from "@/components/profile/CertificateUploadModal";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Github, Globe, MessageSquare, Mail, MapPin, Briefcase, Clock, LayoutDashboard, ExternalLink, Plus, Instagram, ShieldCheck, Link as LinkIcon, Copy, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { getVerificationLabel, isRecruiterTier, getHiringLimit } from "@/lib/paymentConfig";
import { OrgDashboard } from "@/components/dashboard/OrgDashboard";
import { ShareProfileModal } from "@/components/dashboard/ShareProfileModal";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { format } from "date-fns";


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
  telegram?: string;
  linkedin?: string;
  instagram?: string;
  cardNumber?: number;
  isVerified?: boolean;
  isExpired?: boolean;
  isExpiringSoon?: boolean;
  expiresAt?: string;
  verifierTier?: number;
  role?: string;
  verificationTier?: string;
  verificationStatus?: string;
  verificationType?: string;
  pendingVerificationType?: string;
  rejectionReason?: string;
  organization?: string;
  attestationQuota?: number;
  attestationUsed?: number;
  attestationResetDate?: string;
  canAttest?: boolean;
  completionPercentage: number;
  isProfileComplete: boolean;
};

type HiringCollection = {
  id: string;
  title: string;
  slug: string;
  created_at: string;
};

export default function DashboardPage() {
  const { publicKey, connected, connecting } = useWallet();
  const { session, orgAccount, loading: googleLoading } = useGoogleAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [collections, setCollections] = useState<HiringCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRenewal, setIsRenewal] = useState(false);
  const [attestationCount, setAttestationCount] = useState(0);
  const [isHiringExpanded, setIsHiringExpanded] = useState(false);
  const [isImpactExpanded, setIsImpactExpanded] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showCertModal, setShowCertModal] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const getProfileUrl = () => {
    if (!profile || !publicKey) return `${window.location.origin}/cv/${publicKey?.toBase58()}`;
    if (profile.displayName && profile.cardNumber) {
      const slug = profile.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return `${window.location.origin}/${slug}/${profile.cardNumber}`;
    }
    return `${window.location.origin}/cv/${publicKey.toBase58()}`;
  };

  useEffect(() => {
    if (!connected || !publicKey) {
      // Don't flip loading=false while autoConnect is still in flight — that
      // would expose an empty Sign-In screen for a frame before the wallet
      // connects and triggers this effect again with connected=true.
      if (!connecting) setLoading(false);
      return;
    }

    const walletAddr = publicKey.toBase58();
    setLoading(true);
    const controller = new AbortController();

    fetch(`/api/dashboard/stats?wallet=${walletAddr}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProfile(data.profile);
        setCollections(data.collections || []);
        setAttestationCount(data.attestationCount || 0);
        if (Array.isArray(data.certificates)) {
          setCertificates(data.certificates);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Dashboard fetch error:", err);
        setFetchError(err.message || "Failed to load dashboard");
        setLoading(false);
      });

    return () => controller.abort();
  }, [publicKey, connected, connecting]);

  const handleDeleteCertificate = async (id: string) => {
    if (!publicKey) return;
    try {
      const res = await fetch(`/api/certificates?id=${id}&wallet=${publicKey.toBase58()}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setCertificates(prev => prev.filter(c => c.id !== id));
    } catch {
      setToastMessage("Failed to delete certificate. Please try again.");
    }
  };

  const handleCertUploadSuccess = () => {
    if (!publicKey) return;
    fetch(`/api/certificates?wallet=${publicKey.toBase58()}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCertificates(data);
      })
      .catch(() => {
        setToastMessage("Certificate uploaded, but failed to refresh list. Please reload the page.");
      });
  };

  // Google auth resolving
  if (googleLoading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  // Google org users always get the Google dashboard — even if a wallet is also connected.
  // Wallet connection is irrelevant for the Google/Stripe payment path.
  if (session) {
    return <GoogleOrgDashboardWrapper session={session} orgAccount={orgAccount} />;
  }

  // autoConnect is still running — show loading so the Sign-In screen never
  // flashes for returning users whose wallet connects silently in the background.
  if (!publicKey && connecting) {
    return <LoadingScreen message="Connecting wallet..." />;
  }

  if (!publicKey) {
    // Definitely not signed in (autoConnect finished or never started)
    return (
      <main className="min-h-screen text-white relative bg-black theme-bg-page theme-aware">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Sign in to continue</h1>
            <p className="text-slate-400">Connect a wallet or sign in with Google to view your dashboard</p>
          </div>
          <WalletMultiButton />
        </div>
      </main>
    );
  }

  if (loading) {
    return <LoadingScreen message="Aggregating professional reputation..." />;
  }
  const walletAddress = publicKey.toBase58();

  return (
    <main className="min-h-screen flex flex-col text-white relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white bg-black theme-bg-page theme-aware">
      <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <Navbar isVerified={!!profile?.isVerified} verifierTier={profile?.verifierTier} verificationTier={profile?.verificationTier} />


      <section className="flex-1 max-w-3xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-8">
        {loading ? (
          <LoadingScreen message="Aggregating professional reputation..." />
        ) : fetchError ? (
          <div className="mb-8 p-6 rounded-xl bg-slate-800/60 border border-red-500/20 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">Failed to load your profile</p>
            </div>
            <p className="text-slate-400 text-sm">There was a problem connecting to the server. This is usually temporary.</p>
            <button
              onClick={() => {
                setFetchError(null);
                setLoading(true);
                fetch(`/api/dashboard/stats?wallet=${publicKey.toBase58()}`)
                  .then(r => r.json())
                  .then(data => {
                    if (data.error) throw new Error(data.error);
                    setProfile(data.profile);
                    setCollections(data.collections || []);
                    setAttestationCount(data.attestationCount || 0);
                    if (Array.isArray(data.certificates)) setCertificates(data.certificates);
                    setLoading(false);
                  })
                  .catch(err => {
                    setFetchError(err.message || "Failed to load dashboard");
                    setLoading(false);
                  });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm w-fit transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        ) : !profile?.displayName ? (
          <div className="mb-8 p-4 rounded-lg bg-slate-800 border border-slate-700">
            <p className="mb-4">No profile yet. Create one first.</p>
            <Link
              href="/create-profile"
              className="inline-block px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600"
            >
              Create Profile
            </Link>
          </div>
        ) : isRecruiterTier(profile?.verificationType) || (profile?.verificationStatus === "pending" && isRecruiterTier(profile?.pendingVerificationType ?? "")) ? (
          // ── Org Dashboard (Community / Company accounts) ──────────────────────
          <OrgDashboard
            profile={profile}
            walletAddress={walletAddress}
            collections={collections}
            attestationCount={attestationCount}
            onRequestVerification={(renewal) => {
              setIsRenewal(renewal);
              setShowVerificationModal(true);
            }}
          />
        ) : (
          <>
            <div className="mb-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
              <div className="flex-shrink-0 flex flex-col items-center md:items-start w-full md:w-auto">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-slate-700 shadow-xl"
                  />
                ) : (
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-slate-500 text-3xl md:text-4xl font-bold shadow-xl">
                    {profile.displayName?.[0] || '?'}
                  </div>
                )}

                {profile.cardNumber && (
                  <div className="mt-2 text-center md:text-left flex flex-col gap-2 items-center md:items-start">
                    <span className="font-mono text-[10px] tracking-widest text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">
                      CV ID #{String(profile.cardNumber).padStart(5, '0')}
                    </span>
                    <CommunityBadge cvId={profile.cardNumber || 0} />
                  </div>
                )}

                {(profile.country || profile.timezone) && (
                  <div className="mt-4 flex flex-col items-center md:items-start gap-2 text-slate-400">
                    {profile.country && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.country}</span>
                      </div>
                    )}
                    {profile.timezone && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{profile.timezone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <h1 className="text-2xl md:text-3xl font-bold">{profile?.displayName}</h1>
                      <RoleBadge 
                        type={profile?.verificationTier} 
                        isVerified={!!profile?.isVerified} 
                        className="scale-90 md:scale-100 origin-center"
                      />

                      {!profile?.isVerified && profile?.isExpired && (
                        <div className="px-2 py-1 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all">
                          < ShieldCheck className="w-3 md:w-3.5 h-3 md:h-3.5" />
                          <span>Expired</span>
                        </div>
                      )}

                      {!profile?.isVerified && !profile?.isExpired && (
                        <div className="px-2 py-1 rounded-lg border border-slate-500/20 bg-slate-500/10 text-slate-500 opacity-60 text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all">
                          < ShieldCheck className="w-3 md:w-3.5 h-3 md:h-3.5" />
                          <span>Unverified</span>
                        </div>
                      )}


                      {(profile?.isExpired || profile?.isExpiringSoon) && (
                        <button
                          onClick={() => {
                            setIsRenewal(true);
                            setShowVerificationModal(true);
                          }}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] md:text-xs font-bold uppercase tracking-widest transition-colors flex-shrink-0 ${
                            profile?.isExpired 
                              ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20" 
                              : "bg-amber-400/10 border-amber-400/20 text-amber-400 hover:bg-amber-400/20"
                          }`}
                        >
                           <RefreshCw className="w-2.5 h-2.5 md:w-3 md:h-3" />
                           <span>{profile?.isExpired ? "Expired - Renew" : "Renew"}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-row items-center gap-2 justify-center md:justify-end w-full md:w-auto">
                      {(!profile?.isVerified && !profile?.isExpired) ? (
                        <button
                          onClick={() => {
                            setIsRenewal(false);
                            setShowVerificationModal(true);
                          }}
                          className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300 text-[10px] md:text-sm font-medium transition-colors border border-emerald-500/20 flex items-center gap-1.5 md:gap-2"
                        >
                          <ShieldCheck className="w-3 md:w-4 h-3 md:h-4" /> Verify
                        </button>
                      ) : (profile?.isVerified && profile?.verifierTier && profile.verifierTier < 4) ? (
                        <button
                          onClick={() => {
                            setIsRenewal(false);
                            setShowVerificationModal(true);
                          }}
                          className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 text-[10px] md:text-sm font-medium transition-all border border-amber-500/20 flex items-center gap-1.5 md:gap-2 shadow-[0_0_15px_rgba(245,158,11,0.05)] active:scale-95"
                        >
                          <ShieldCheck className="w-3 md:w-4 h-3 md:h-4" /> Upgrade
                        </button>
                      ) : null}

                      <Link
                        href="/create-profile"
                        className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-[10px] md:text-sm font-medium transition-colors border border-slate-600"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>

                  {/* Profile Identity (Role/Organization) */}
                  {profile?.role ? (
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                      <span className="text-lg font-medium text-white/80">
                        {profile?.role}
                        {profile?.organization && <span className="text-slate-500 font-normal"> at {profile?.organization}</span>}
                      </span>
                    </div>
                  ) : profile?.organization ? (
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                      <span className="text-lg font-medium text-white/80">
                        {profile?.organization}
                      </span>
                    </div>
                  ) : null}

                  {/* Profile Completion Progress Indicator */}
                  {profile && profile.completionPercentage < 100 && (
                    <div className="mt-2 mb-8 p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 max-w-sm mx-auto md:mx-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Profile Completion</span>
                        </div>
                         <span className="text-[10px] font-black text-white/60">{profile.completionPercentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/50 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${profile.completionPercentage}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
                        Add a <span className="text-slate-400">bio</span>, <span className="text-slate-400">skills</span>, and <span className="text-white/60">contact info</span> to reach 100% visibility.
                      </p>
                    </div>
                  )}



                  {profile.lookingFor && (
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        {profile.lookingFor}
                      </span>
                    </div>
                  )}

                  {profile.bio && (
                    <ExpandableText
                      text={profile.bio}
                      maxLength={300}
                      className="text-slate-400 mb-6 leading-relaxed"
                    />
                  )}

                  {profile.skills && (
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
                      {profile.skills.split(',').map((skill: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                    {profile?.twitter && (
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

                    {profile?.github && (
                       <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all font-bold text-xs" title="GitHub">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                       </a>
                    )}

                    {profile?.linkedin && (
                      <a
                        href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin.replace(/^(www\.)?linkedin\.com\/in\//, '')}`}
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

                    {profile?.instagram && (
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


                    {profile?.website && (
                      <a
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all"
                        title="Website"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {profile?.discord && (
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

                    {profile?.telegram && (
                      <a
                        href={`https://t.me/${profile.telegram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-[#0088cc] hover:bg-[#0088cc]/10 hover:border-[#0088cc]/20 transition-all"
                        title="Telegram"
                      >
                         <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0C5.347 0 0 5.347 0 11.944c0 6.597 5.347 11.944 11.944 11.944 6.597 0 11.944-5.347 11.944-11.944C23.888 5.347 18.541 0 11.944 0zm5.204 8.525c-.179 1.884-.962 5.925-1.359 8.041-.168.9-.499 1.203-.82 1.232-.698.064-1.226-.462-1.902-.905-1.057-.695-1.655-1.127-2.682-1.803-1.187-.781-.417-1.21.258-1.912.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.071-.064-.175-.041-.249-.024-.106.024-1.793 1.141-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.098.154.228.163.319.009.091.011.201.009.324z" />
                        </svg>
                      </a>
                    )}

                    {profile?.email && (
                      <a
                        href={`mailto:${profile.email}`}
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                        title="Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Organization Impact - For Verified Orgs */}
        {profile?.isVerified && (
          <div className="mb-6 pb-6 border-b border-slate-800/60 overflow-hidden">
            <div 
              onClick={() => setIsImpactExpanded(!isImpactExpanded)}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:border-white/10 hover:bg-white/[0.03] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isImpactExpanded ? (
                  profile?.verifierTier === 4 ? "bg-amber-500/10"
                  : profile?.verifierTier === 3 ? "bg-blue-500/10"
                  : profile?.verifierTier === 2 ? "bg-pink-500/10"
                  : "bg-emerald-500/10"
                ) : 'bg-slate-500/10'} transition-colors`}>
                  <ShieldCheck className={`w-5 h-5 ${
                    isImpactExpanded ? (
                      profile?.verifierTier === 4 ? "text-amber-400"
                      : profile?.verifierTier === 3 ? "text-blue-400"
                      : profile?.verifierTier === 2 ? "text-pink-400"
                      : "text-emerald-400"
                    ) : "text-slate-500"
                  } transition-colors`} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-white">Verified Identity Impact</h2>
                    {!isImpactExpanded && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        profile?.verifierTier === 4 ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : profile?.verifierTier === 3 ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : profile?.verifierTier === 2 ? "bg-pink-500/10 text-pink-400 border-pink-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        Tier {profile?.verifierTier === 4 ? "IV" : profile?.verifierTier === 3 ? "III" : profile?.verifierTier === 2 ? "II" : "I"}
                      </span>
                    )}
                  </div>
                  {!isImpactExpanded && (
                    <p className="text-[10px] text-slate-500 mt-0.5">Trust signals and subscription performance metrics</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {isImpactExpanded ? <ChevronUp className="w-4 h-4 text-slate-500 group-hover:text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />}
              </div>
            </div>

            {isImpactExpanded && (
              <div className="mt-4 animate-in slide-in-from-top-2 fade-in duration-300">
                <div className={`p-4 rounded-xl border mb-4 ${
                  profile?.verifierTier === 4 ? "bg-amber-500/5 border-amber-500/10"
                  : profile?.verifierTier === 3 ? "bg-blue-500/5 border-blue-500/10"
                  : profile?.verifierTier === 2 ? "bg-pink-500/5 border-pink-500/10"
                  : "bg-emerald-500/5 border-emerald-500/10"
                }`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-medium ${
                      profile?.verifierTier === 4 ? "text-amber-400"
                      : profile?.verifierTier === 3 ? "text-blue-400"
                      : profile?.verifierTier === 2 ? "text-pink-400"
                      : "text-emerald-400"
                    }`}>
                      {getVerificationLabel(profile?.verificationTier)} - Active Verified Identity
                    </p>

                    {profile?.expiresAt && (
                      <span className="text-[10px] text-white/30 font-medium">
                        Valid until {format(new Date(profile.expiresAt), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                  
                  {profile?.isExpiringSoon && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Subscription expires soon - renew now to maintain your verified identity</span>
                    </div>
                  )}

                  <p className="text-[10px] text-emerald-400/50 mt-1">Your professional endorsements now carry the "Verified" shield 🛡️ across the network.</p>
                  
                  {!profile?.isExpiringSoon && profile?.expiresAt && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <button
                        onClick={() => {
                          setIsRenewal(true);
                          setShowVerificationModal(true);
                        }}
                        className="flex items-center gap-2 text-[10px] font-bold text-white/40 hover:text-white transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Extend Verification
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center relative group">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Monthly Benefits</span>
                    <span className="text-sm font-bold text-white leading-tight">
                      {profile?.attestationUsed ?? 0} <span className="text-slate-500">/</span> {profile?.attestationQuota ?? 0}
                    </span>
                    <span className="text-[9px] text-slate-600 mt-1 uppercase tracking-tight">Attestations used</span>
                    
                    {profile?.attestationResetDate && (
                      <div className="absolute -bottom-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <span className="text-[8px] text-slate-600 font-mono">Resets {format(new Date(profile.attestationResetDate), 'MMM d')}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Impact Tier</span>
                    <span className={`text-2xl font-bold ${
                      profile?.verifierTier === 4 ? "text-amber-400" :
                      profile?.verifierTier === 3 ? "text-blue-400" :
                      profile?.verifierTier === 2 ? "text-pink-400" :
                      "text-emerald-400"
                    }`}>
                      {profile?.verifierTier === 4 ? "IV" : 
                       profile?.verifierTier === 3 ? "III" : 
                       profile?.verifierTier === 2 ? "II" : 
                       "I"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ATTESTATION USAGE (All Users) ── */}
        <div className="mb-6 pb-6 border-b border-slate-800/60">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Attestation Usage</h2>
            <span className="text-[10px] text-slate-600 font-mono">Resets monthly</span>
          </div>

          {(() => {
            const used = profile?.attestationUsed ?? 0;
            const quota = profile?.attestationQuota ?? 2;
            const remaining = Math.max(0, quota - used);
            const pct = Math.min(100, (used / quota) * 100);
            const isLimitReached = used >= quota;
            const isNearLimit = !isLimitReached && pct >= 80;

            if (isLimitReached) return (
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-rose-400">You've reached your limit.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Attestation Usage: {used} / {quota} this month</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border bg-rose-500/10 border-rose-500/30 text-rose-400">Limit Reached</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full w-full" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">Upgrade for unlimited access and keep endorsing talent.</p>
                <button
                  onClick={() => { setIsRenewal(false); setShowVerificationModal(true); }}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Upgrade Now
                </button>
              </div>
            );

            return (
              <div className={`p-4 rounded-2xl border space-y-3 relative group ${
                isNearLimit ? "bg-amber-500/5 border-amber-500/20" : "bg-white/[0.02] border-white/5"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Attestation Usage</p>
                    <p className="text-sm font-bold text-white">
                      {used}
                      <span className="text-slate-500 font-normal"> / {quota}</span>
                      <span className="text-xs text-slate-500 font-normal ml-1.5">this month</span>
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                    isNearLimit
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      : profile?.isVerified
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : "text-slate-400 bg-slate-500/10 border-slate-500/20"
                  }`}>
                    {isNearLimit ? "Almost Full" : profile?.isVerified ? getVerificationLabel(profile?.verificationTier) : "Regular"}
                  </span>
                </div>

                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isNearLimit ? "bg-amber-500" :
                      profile?.isVerified ? "bg-gradient-to-r from-white/50 to-white/70" : "bg-slate-600"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {isNearLimit && (
                  <p className="text-[11px] text-amber-400/80 font-medium">⚠ You're almost at your limit - {remaining} left this month</p>
                )}

                {profile?.attestationResetDate && (
                  <p className="text-[9px] text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    Resets {format(new Date(profile.attestationResetDate), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            );
          })()}
        </div>

        <div className="mb-6 pb-6 border-b border-slate-800/60 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden">
          <div
            onClick={() => setIsHiringExpanded(!isHiringExpanded)}
            className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.03] hover:border-white/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isHiringExpanded ? 'bg-white/10' : 'bg-slate-500/10'} transition-colors`}>
                <LayoutDashboard className={`w-5 h-5 ${isHiringExpanded ? 'text-white' : 'text-slate-500'} transition-colors`} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-white">Hiring Center</h2>
                  {collections.length > 0 && !isHiringExpanded && (
                    <span className="text-[10px] font-bold bg-white/10 text-white/60 px-2 py-0.5 rounded-full border border-white/10">
                      {collections.length} {collections.length === 1 ? 'Collection' : 'Collections'}
                    </span>
                  )}
                </div>
                {!isHiringExpanded && (() => {
                  const hiringLimit = getHiringLimit(profile?.verificationTier);
                  if (hiringLimit === null) {
                    return <p className="text-[10px] text-slate-500 mt-0.5"><span className="text-white/60 font-bold">Unlimited hiring access enabled</span></p>;
                  }
                  // Capped tier: show usage
                  const used = collections.length;
                  const remaining = Math.max(0, hiringLimit - used);
                  const isAtLimit = used >= hiringLimit;
                  return (
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Hiring Usage:{" "}
                      <span className={`font-bold ${
                        isAtLimit ? "text-rose-400" : remaining <= 1 ? "text-amber-400" : "text-slate-400"
                      }`}>
                        {used} / {hiringLimit} used
                      </span>
                      {!isAtLimit && remaining <= 1 && (
                        <span className="text-amber-400/80 ml-1">- last slot</span>
                      )}
                    </p>
                  );
                })()}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {!isHiringExpanded && (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-[10px] font-bold text-slate-500">
                  {isHiringExpanded ? 'Hide' : 'Quick Access'}
                </div>
              )}
              {isHiringExpanded ? <ChevronUp className="w-4 h-4 text-white/30 group-hover:text-white/60" /> : <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />}
            </div>
          </div>

          {isHiringExpanded && (
            <div className="mt-4 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Talent Collections</p>
                <Link 
                  href="/hiring/create"
                  className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> New Collection
                </Link>
              </div>

            {collections.length > 0 ? (
              <div className="grid gap-3">
                {collections.map(col => (
                  <div key={col.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-white transition-colors">{col.title}</h3>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5">
                        <span>{new Date(col.created_at).toLocaleDateString()}</span>
                        <Link href={`/r/${col.slug}`} target="_blank" className="hover:text-white flex items-center gap-1 transition-colors" onClick={(e) => e.stopPropagation()}>
                          Public Page <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                    <Link
                      href={`/hiring/${col.slug}/dashboard`}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-bold rounded-lg transition-colors border border-white/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Dashboard
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
                <h3 className="text-base font-bold text-white mb-2">Ready to Source Talent?</h3>
                <p className="text-xs text-slate-500 mb-4 max-w-sm">
                  Create your first collection to start discovering and tracking talent.
                </p>
                <Link
                  href="/hiring/create"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold rounded-lg transition-all border border-white/10"
                >
                  Create Hiring Collection
                </Link>
              </div>
            )}
            </div>
          )}
        </div>

        {/* ── VERIFIED CREDENTIALS ── */}
        <div className="mb-6 pb-6 border-b border-slate-800/60">
          <CertificateSection
            certs={certificates}
            isOwner={true}
            onDelete={handleDeleteCertificate}
            onAdd={() => setShowCertModal(true)}
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">Proof of Work</h2>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link
              href={`/cv/${walletAddress}`}
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs md:text-sm font-medium transition-colors"
            >
              View CV
            </Link>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs md:text-sm font-medium transition-colors"
            >
              Share
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-white text-black hover:bg-white/90 text-xs md:text-sm font-bold shadow-lg"
            >
              {showForm ? "Close" : "+ Add Proof"}
            </button>
          </div>
        </div>

        {showForm || editingReceipt ? (
          <ReceiptForm
            walletAddress={walletAddress}
            initialData={editingReceipt}
            onSuccess={() => {
              setShowForm(false);
              setEditingReceipt(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingReceipt(null);
            }}
          />
        ) : null}

        <ReceiptList
          walletAddress={walletAddress}
          onEdit={(r) => {
            setEditingReceipt(r);
            setShowForm(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
          </>
        )}
      </section>

      {showVerificationModal && profile && (
        <VerificationRequestModal
          walletAddress={walletAddress}
          profileName={profile.displayName}
          website={profile.website}
          socials={`${profile.twitter || ''} ${profile.linkedin || ''}`.trim()}
          currentStatus={profile.verificationStatus || null}
          currentTier={profile.verificationTier || null}
          isRenewal={isRenewal}
          isOrg={isRecruiterTier(profile.verificationType ?? "")}
          onClose={() => {
            setShowVerificationModal(false);
            setIsRenewal(false);
          }}
          onSuccess={() => {
            setShowVerificationModal(false);
            setIsRenewal(false);
            setToastMessage(isRenewal ? "Renewal request submitted successfully." : "Verification request submitted successfully.");
            
            if (publicKey) {
              const wallet = publicKey.toBase58();
              fetch(`/api/user/me?wallet=${wallet}`)
                .then((r) => r.json())
                .then((data) => setProfile(data))
                .catch(err => console.error("Error refetching profile:", err));
            }
          }}
        />
      )}

      {showCertModal && publicKey && (
        <CertificateUploadModal
          walletAddress={publicKey.toBase58()}
          onClose={() => setShowCertModal(false)}
          onSuccess={handleCertUploadSuccess}
        />
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      <ShareProfileModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profileUrl={typeof window !== "undefined" ? getProfileUrl() : ""}
        displayName={profile?.displayName}
        role={profile?.role || profile?.organization}
        avatarUrl={profile?.avatarUrl}
        isVerified={!!profile?.isVerified}
        verificationTier={profile?.verificationTier}
      />
      <Footer />
    </main>
  );
}

// ── Wrapper for Google-only org users ───────────────────────────────────────
import type { Session } from "@supabase/supabase-js";
import type { OrgAccount } from "@/hooks/useGoogleAuth";

function GoogleOrgDashboardWrapper({ session, orgAccount }: { session: Session; orgAccount: OrgAccount | null }) {
  const router = useRouter();
  const [googleCollections, setGoogleCollections] = useState<{ id: string; title: string; slug: string; created_at: string }[]>([]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isRenewalGoogle, setIsRenewalGoogle] = useState(false);

  // New Google users who haven't completed onboarding → org setup
  const needsOnboarding = !orgAccount || !orgAccount.onboarding_complete;
  useEffect(() => {
    if (needsOnboarding) router.replace("/onboarding/org");
  }, [needsOnboarding, router]);

  // Collections fetch (runs regardless; skips if no orgAccount)
  useEffect(() => {
    if (!orgAccount?.auth_uid || !session?.access_token) return;
    fetch(`/api/hiring/collections?auth_uid=${orgAccount.auth_uid}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.ok ? r.json() : { data: [] })
      .then(data => { if (Array.isArray(data.data)) setGoogleCollections(data.data); })
      .catch(() => {});
  }, [orgAccount, session]);

  if (needsOnboarding) {
    return <LoadingScreen message="Setting up your organization..." />;
  }

  const googleProfile = {
    displayName: orgAccount?.org_name ?? session.user.email?.split("@")[0] ?? "My Organization",
    bio: orgAccount?.bio ?? null,
    avatarUrl: orgAccount?.avatar_url ?? null,
    website: orgAccount?.website ?? null,
    twitter: orgAccount?.twitter ?? null,
    linkedin: orgAccount?.linkedin ?? null,
    discord: orgAccount?.discord ?? null,
    telegram: orgAccount?.telegram ?? null,
    email: orgAccount?.email ?? session.user.email ?? null,
    country: orgAccount?.country ?? null,
    isVerified: false as const,
    verificationStatus: null,
    completionPercentage: 0,
    isProfileComplete: false,
  };

  return (
    <main className="min-h-screen flex flex-col text-white relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white bg-black theme-bg-page theme-aware">
      <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      <Navbar />
      <section className="flex-1 max-w-3xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-8">
        <OrgDashboard
          profile={googleProfile}
          walletAddress={null}
          collections={googleCollections}
          attestationCount={0}
          onRequestVerification={(renewal) => {
            setIsRenewalGoogle(renewal);
            setShowVerifyModal(true);
          }}
          googleOrgAccount={orgAccount}
          accessToken={session.access_token}
        />
      </section>
      <Footer />

      {showVerifyModal && (
        <VerificationRequestModal
          walletAddress=""
          profileName={googleProfile.displayName}
          website={orgAccount?.website ?? undefined}
          socials={[orgAccount?.twitter, orgAccount?.linkedin].filter(Boolean).join(" ")}
          currentStatus={null}
          currentTier={null}
          isRenewal={isRenewalGoogle}
          isOrg={true}
          onClose={() => { setShowVerifyModal(false); setIsRenewalGoogle(false); }}
          onSuccess={() => { setShowVerifyModal(false); setIsRenewalGoogle(false); }}
        />
      )}
    </main>
  );
}
