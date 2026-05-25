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
import { Github, Globe, MessageSquare, Mail, MapPin, Briefcase, Clock, LayoutDashboard, ExternalLink, Plus, Instagram, ShieldCheck, Link as LinkIcon, Copy, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, User, FileCheck2, FolderOpen, Activity, Share2, FileText, Send, Inbox, Building2, PenLine } from "lucide-react";
import { getVerificationLabel, isRecruiterTier, getHiringLimit } from "@/lib/paymentConfig";
import { OrgDashboard } from "@/components/dashboard/OrgDashboard";
import { ShareProfileModal } from "@/components/dashboard/ShareProfileModal";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { format } from "date-fns";
import { WorkTimeline } from "@/components/profile/WorkTimeline";
import { CountrySelector } from "@/components/ui/CountrySelector";
import { SkillSelector } from "@/components/ui/SkillSelector";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { signChainVolioAction } from "@/lib/wallet-utils";
import { ReceiptDetailModal } from "@/components/receipt/ReceiptDetailModal";
import { InboxPanel } from "@/components/dashboard/InboxPanel";


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
  cvScore?: number | null;
  cvLevel?: string | null;
};

type HiringCollection = {
  id: string;
  title: string;
  slug: string;
  created_at: string;
};

export default function DashboardPage() {
  const { publicKey, connected, connecting, signMessage } = useWallet();
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
  const [activeTab, setActiveTab] = useState("profile");
  const [receipts, setReceipts] = useState<any[]>([]);
  const [showInlineEdit, setShowInlineEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "", bio: "", skills: "", role: "", organization: "",
    country: "", timezone: "", twitter: "", github: "", website: "",
    discord: "", whatsapp: "", email: "", telegram: "", linkedin: "",
    instagram: "", lookingFor: "", workPreference: [] as string[], avatarUrl: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editUploading, setEditUploading] = useState(false);
  const [editCropModal, setEditCropModal] = useState<{ isOpen: boolean; image: string | null }>({ isOpen: false, image: null });
  const [selectedReceiptForDetail, setSelectedReceiptForDetail] = useState<any>(null);

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

    Promise.all([
      fetch(`/api/dashboard/stats?wallet=${walletAddr}`, { signal: controller.signal }).then(r => r.json()),
      fetch(`/api/receipts?wallet=${walletAddr}`, { signal: controller.signal }).then(r => r.json()).catch(() => []),
    ])
      .then(([data, recs]) => {
        if (data.error) throw new Error(data.error);
        setProfile(data.profile);
        setCollections(data.collections || []);
        setAttestationCount(data.attestationCount || 0);
        if (Array.isArray(data.certificates)) {
          setCertificates(data.certificates);
        }
        const recsArr = Array.isArray(recs) ? recs : (recs.receipts || []);
        setReceipts(recsArr.filter((r: any) =>
          r.attestationType !== "Hiring Proof" && !r.description?.includes("Official Verified Hiring Proof")
        ));
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

  const openInlineEdit = () => {
    if (!profile) return;
    setEditForm({
      displayName: profile.displayName || "",
      bio: profile.bio || "",
      skills: profile.skills || "",
      role: profile.role || "",
      organization: profile.organization || "",
      country: profile.country || "",
      timezone: profile.timezone || "",
      twitter: profile.twitter || "",
      github: profile.github || "",
      website: profile.website || "",
      discord: profile.discord || "",
      whatsapp: profile.whatsapp || "",
      email: profile.email || "",
      telegram: profile.telegram || "",
      linkedin: profile.linkedin || "",
      instagram: profile.instagram || "",
      lookingFor: profile.lookingFor || "",
      workPreference: profile.workPreference || [],
      avatarUrl: profile.avatarUrl || "",
    });
    setShowInlineEdit(true);
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setEditCropModal({ isOpen: true, image: reader.result as string }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleEditCroppedImage = async (croppedBlob: Blob) => {
    try {
      setEditUploading(true);
      const { default: imageCompression } = await import("browser-image-compression");
      const compressed = await imageCompression(croppedBlob as File, { maxSizeMB: 0.5, maxWidthOrHeight: 400, useWebWorker: true, fileType: "image/webp" });
      const fileName = `${publicKey?.toBase58()}-${Date.now()}.webp`;
      const fd = new FormData();
      fd.append("file", compressed, fileName);
      fd.append("bucket", "avatars");
      fd.append("path", fileName);
      const res = await fetch("/api/storage/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setEditForm(prev => ({ ...prev, avatarUrl: url }));
      setEditCropModal({ isOpen: false, image: null });
    } catch (error: any) {
      setToastMessage("Error uploading avatar: " + error.message);
    } finally {
      setEditUploading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !signMessage) return;
    if (editForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      setToastMessage("Please enter a valid email address.");
      return;
    }
    setEditLoading(true);
    try {
      const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, "update_profile");
      if (!signedAction) {
        setToastMessage("Signing canceled. Please try again.");
        return;
      }
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: publicKey.toBase58(), ...editForm, ...signedAction }),
      });
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, ...editForm } : null);
        setToastMessage("Profile updated successfully!");
        setShowInlineEdit(false);
      } else {
        const data = await res.json();
        setToastMessage(data.error?.message || data.error || "Failed to update profile.");
      }
    } catch {
      setToastMessage("Error saving profile");
    } finally {
      setEditLoading(false);
    }
  };

  // Google auth resolving
  if (googleLoading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  if (session) {
    if (orgAccount?.account_type === "builder") {
      // Google builder: if wallet is connected, fall through to wallet builder dashboard.
      // Without a wallet, show a prompt to connect one.
      if (!connected || !publicKey) {
        return <GoogleBuilderNoWalletView session={session} />;
      }
      // fall through to wallet builder dashboard below
    } else {
      return <GoogleOrgDashboardWrapper session={session} orgAccount={orgAccount} />;
    }
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

  // True when the wallet holder registered as a Community/DAO or Company/Org
  const isWalletRecruiter = !!profile && (
    isRecruiterTier(profile?.verificationType) ||
    (profile?.verificationStatus === "pending" && isRecruiterTier(profile?.pendingVerificationType ?? ""))
  );

  return (
    <main className="flex flex-col h-screen overflow-hidden text-white relative selection:bg-teal-500/30 selection:text-white" style={{ background: "#000000" }}>
      <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <Navbar isVerified={!!profile?.isVerified} verifierTier={profile?.verifierTier} verificationTier={profile?.verificationTier} />
      <div className="flex-shrink-0" style={{ height: 96 }} />{/* navbar spacer */}

      {/* ── 3-PANEL BODY ── */}
      <div className="flex-1 overflow-hidden min-h-0 px-4 md:px-16 pt-3 pb-3 flex flex-col">
        <div className="flex flex-1 overflow-hidden min-h-0 w-full max-w-[1230px] mx-auto rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col overflow-y-auto custom-scrollbar" style={{ background: "#0d0d10", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Logo */}
          <div className="flex items-center px-4 h-[46px] flex-shrink-0 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="animate-lightning-shine absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
            </div>
            <img src="/chainvolio%20logo.png" alt="chainvolio" style={{ height: 18, width: "auto", objectFit: "contain" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)", marginLeft: 6, letterSpacing: "-0.01em" }}>chainvolio</span>
          </div>
          {/* Nav */}
          <nav className="flex-1 px-2 py-3 space-y-0.5">
            {(isWalletRecruiter ? [
              { Icon: Building2,     label: "Profile",             id: "profile",      href: undefined },
              { Icon: FolderOpen,    label: "Hiring Center",       id: "hiring",       href: undefined },
              { Icon: LayoutDashboard, label: "Projects & Programs", id: "projects",   href: undefined },
              { Icon: Inbox,         label: "Inbox",               id: "inbox",        href: undefined },
            ] : [
              { Icon: User,        label: "Profile",           id: "profile",       href: undefined },
              { Icon: ShieldCheck, label: "Credential",        id: "credential",    href: undefined },
              { Icon: FileCheck2,  label: "Proof of Work",     id: "proof-work",    href: undefined },
              { Icon: Activity,    label: "Attestation Usage", id: "attestation",   href: undefined },
              { Icon: Briefcase,   label: "Career Timeline",   id: "timeline",      href: undefined },
              { Icon: Send,        label: "My Applications",   id: "applications",  href: undefined },
              { Icon: Inbox,       label: "Inbox",             id: "inbox",         href: undefined },
            ] as Array<{ Icon: React.ElementType; label: string; id: string; href?: string }>).map(({ Icon, label, id, href }) => {
              const active = activeTab === id;
              const cls = "w-full flex items-center gap-2.5 px-3 py-[7px] rounded-md relative transition-colors text-left";
              const sty = active ? { background: "rgba(255,255,255,0.07)" } : {};
              const inner = (
                <>
                  {active && <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />}
                  <Icon style={{ width: 13, height: 13, color: active ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.42)" }}>{label}</span>
                </>
              );
              return href
                ? <Link key={id} href={href} className={cls} style={sty}>{inner}</Link>
                : <button key={id} onClick={() => setActiveTab(id)} className={cls} style={sty}>{inner}</button>;
            })}
          </nav>
          {/* Hiring Overview (recruiter only) */}
          {isWalletRecruiter && (
            <div className="px-3 pb-3 space-y-1.5">
              <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>Hiring Overview</p>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.32)" }}>Collections</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>{collections.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.32)" }}>Attestations</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>{attestationCount}</span>
              </div>
              {profile?.attestationQuota != null && (
                <>
                  <div className="mt-1 h-0.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, ((profile.attestationUsed ?? 0) / profile.attestationQuota) * 100)}%`, background: "rgba(255,255,255,0.3)" }} />
                  </div>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{profile.attestationUsed ?? 0} / {profile.attestationQuota} this month</p>
                </>
              )}
            </div>
          )}

          {/* User */}
          <div className="px-3 py-3 flex items-center gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              {profile?.avatarUrl
                ? <img src={profile.avatarUrl} alt={profile?.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold" style={{ background: "#2a2a2e", color: "rgba(255,255,255,0.5)" }}>{profile?.displayName?.[0] || '?'}</div>
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate" style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", lineHeight: 1 }}>{profile?.displayName || '—'}</p>
              {isWalletRecruiter
                ? <p style={{ fontSize: 9, color: profile?.isVerified ? "#4ade80" : "rgba(255,255,255,0.22)", fontWeight: 700, marginTop: 2, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {profile?.isVerified ? (profile.verificationTier ?? "Verified") : profile?.verificationStatus === "pending" ? "Pending" : "Unverified"}
                  </p>
                : profile?.isVerified
                  ? <p style={{ fontSize: 9, color: "#4ade80", fontWeight: 700, marginTop: 2, letterSpacing: "0.05em", textTransform: "uppercase" }}>{getVerificationLabel(profile.verificationTier) || "Verified"}</p>
                  : <p style={{ fontSize: 9, color: "rgba(255,255,255,0.22)", fontWeight: 500, marginTop: 2 }}>Unverified</p>
              }
            </div>
          </div>
        </aside>

        {/* ── CENTER PANEL ── */}
        <div className="flex-1 overflow-y-auto min-w-0 flex flex-col" style={{ background: "#0a0b0e" }}>
          {/* Top bar */}
          {(() => {
            const tabMeta: Record<string, { title: string; desc: string }> = isWalletRecruiter ? {
              profile:  { title: "Profile",              desc: "Manage your organization profile and activity." },
              hiring:   { title: "Hiring Center",        desc: "Manage your hiring collections and sourcing." },
              projects: { title: "Projects & Programs",  desc: "Showcase your initiatives, hackathons, and programs." },
              inbox:    { title: "Inbox",                desc: "Direct messages and candidate conversations." },
            } : {
              profile:     { title: "Profile",           desc: "Manage your professional identity and information." },
              credential:  { title: "Credential",        desc: "Your verified credentials and badges." },
              "proof-work":{ title: "Proof of Work",     desc: "Your work history and contributions." },
              attestation: { title: "Attestation Usage", desc: "Track your monthly attestation usage." },
              timeline:    { title: "Career Timeline",   desc: "Your verified professional career timeline." },
              applications:{ title: "My Applications",   desc: "Track your job applications and opportunities." },
              inbox:       { title: "Inbox",             desc: "Recruiter outreach & your conversations." },
            };
            const meta = tabMeta[activeTab] ?? tabMeta.profile;
            return (
              <div className="flex items-center justify-between px-5 h-[46px] flex-shrink-0 sticky top-0 z-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#0a0b0e" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.88)", lineHeight: 1 }}>{meta.title}</p>
                  <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>{meta.desc}</p>
                </div>
                {activeTab === "profile" && !isWalletRecruiter && (
                  <button
                    onClick={showInlineEdit ? () => setShowInlineEdit(false) : openInlineEdit}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all hover:bg-white/[0.05]"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", background: showInlineEdit ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)" }}
                  >
                    <ExternalLink style={{ width: 10, height: 10, color: "rgba(255,255,255,0.4)" }} />
                    <span style={{ fontSize: 11, color: showInlineEdit ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                      {showInlineEdit ? "Cancel" : "Edit Profile"}
                    </span>
                  </button>
                )}
                {isWalletRecruiter && activeTab === "profile" && (
                  <Link
                    href="/org/edit-profile-wallet"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all hover:bg-white/[0.05]"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
                  >
                    <ExternalLink style={{ width: 10, height: 10, color: "rgba(255,255,255,0.4)" }} />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Edit Profile</span>
                  </Link>
                )}
              </div>
            );
          })()}

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
      <section id="profile" className="flex-1">
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
        ) : isWalletRecruiter ? (
          // ── Org Dashboard (Community / Company wallet accounts) ───────────────
          activeTab === "inbox" ? (
            <InboxPanel />
          ) : (
            <OrgDashboard
              profile={profile}
              walletAddress={walletAddress}
              collections={collections}
              attestationCount={attestationCount}
              activeSection={activeTab === "hiring" ? "hiring" : activeTab === "projects" ? "projects" : undefined}
              hideActionBar={true}
              onRequestVerification={(renewal) => {
                setIsRenewal(renewal);
                setShowVerificationModal(true);
              }}
            />
          )
        ) : (
          <>
            {/* ── PROFILE tab ── */}
            {activeTab === "profile" && <>
            {/* ── PROFILE HEADER CARD ── */}
            <div className="rounded-xl p-4 mb-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="flex-shrink-0 flex flex-col items-center md:items-start w-full md:w-auto">
                {profile.avatarUrl ? (
                  <div className="w-[52px] h-[52px] rounded-full overflow-hidden flex-shrink-0" style={{ border: "2px solid rgba(255,255,255,0.1)" }}>
                    <img src={profile.avatarUrl} alt={profile.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0" style={{ background: "#1e1e22", color: "rgba(255,255,255,0.4)", border: "2px solid rgba(255,255,255,0.08)" }}>
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

                  {/* Achievement Badges — same style as public CV */}
                  {(profile.isProfileComplete || receipts.length > 0 || profile.isVerified) && (
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                      {profile.isProfileComplete && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded border text-[10px] font-black uppercase tracking-widest text-emerald-200/80 bg-emerald-500/[0.05] border-emerald-500/20">
                          <svg className="w-3.5 h-3.5 text-emerald-300" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                          Ready
                        </span>
                      )}
                      {receipts.length > 0 && (() => {
                        const totalMonths = receipts.reduce((acc, r) => {
                          const start = new Date(r.startDate || r.start_date || 0);
                          const end = (r.endDate || r.end_date) ? new Date(r.endDate || r.end_date) : new Date();
                          return acc + Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
                        }, 0);
                        const years = Math.floor(totalMonths / 12);
                        if (years < 1) return null;
                        return (
                          <span className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded border text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border-blue-500/30">
                            <Clock className="w-3 h-3" strokeWidth={3} />
                            {years}Y Exp
                          </span>
                        );
                      })()}
                      {receipts.filter(r => r.status === "Attested").length > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded border text-[10px] font-black uppercase tracking-widest text-emerald-200/80 bg-emerald-500/[0.05] border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3 text-emerald-300" strokeWidth={3} />
                          {receipts.filter(r => r.status === "Attested").length} Attested
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>{/* end profile header card */}

            {/* ── INLINE EDIT FORM ── */}
            {showInlineEdit && (
              <div className="mb-3 rounded-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Edit Profile</p>
                  <button onClick={() => setShowInlineEdit(false)} style={{ fontSize: 18, color: "rgba(255,255,255,0.3)", lineHeight: 1 }}>×</button>
                </div>
                <form onSubmit={handleEditSubmit} className="px-4 py-4 space-y-4">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0" style={{ border: "2px solid rgba(255,255,255,0.1)" }}>
                      {editForm.avatarUrl
                        ? <img src={editForm.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-lg font-bold" style={{ background: "#1e1e22", color: "rgba(255,255,255,0.3)" }}>{editForm.displayName?.[0] || "?"}</div>
                      }
                    </div>
                    <div>
                      <input type="file" accept="image/*" onChange={handleEditImageUpload} disabled={editUploading}
                        className="block text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/5 file:text-white/50 hover:file:bg-white/10 file:transition-colors" />
                      {editUploading && <p className="text-[10px] text-emerald-400 mt-1">Uploading...</p>}
                    </div>
                  </div>

                  {/* Display name */}
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>Display name *</label>
                    <input required value={editForm.displayName} onChange={e => setEditForm(p => ({ ...p, displayName: e.target.value }))} maxLength={60}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none transition-colors"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13 }}
                      placeholder="Name or pseudonym" />
                  </div>

                  {/* Role + Org */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>Current Role</label>
                      <input value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13 }}
                        placeholder="CEO, Developer..." />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>Organization</label>
                      <input value={editForm.organization} onChange={e => setEditForm(p => ({ ...p, organization: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13 }}
                        placeholder="Company / DAO" />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>Bio</label>
                    <textarea value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} rows={3}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none resize-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13 }}
                      placeholder="Brief intro about you" />
                  </div>

                  {/* Skills */}
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>Primary Skills</label>
                    <SkillSelector value={editForm.skills} onChange={val => setEditForm(p => ({ ...p, skills: val }))} maxSkills={8} />
                  </div>

                  {/* Country */}
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>Country</label>
                    <CountrySelector value={editForm.country} onChange={val => setEditForm(p => ({ ...p, country: val }))} />
                  </div>

                  {/* Timezone + Looking For */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>Timezone</label>
                      <select value={editForm.timezone} onChange={e => setEditForm(p => ({ ...p, timezone: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13 }}>
                        <option value="">Select</option>
                        {["GMT-12","GMT-11","GMT-10","GMT-9","GMT-8","GMT-7","GMT-6","GMT-5","GMT-4","GMT-3","GMT-2","GMT-1","GMT+0","GMT+1","GMT+2","GMT+3","GMT+4","GMT+5","GMT+6","GMT+7","GMT+8","GMT+9","GMT+10","GMT+11","GMT+12"].map(tz => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>Looking For</label>
                      <input value={editForm.lookingFor} onChange={e => setEditForm(p => ({ ...p, lookingFor: e.target.value.slice(0, 160) }))}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13 }}
                        placeholder="Open to remote roles..." />
                    </div>
                  </div>

                  {/* Work Preference */}
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Availability</label>
                    <div className="flex flex-wrap gap-2">
                      {["Full-time","Contract","Freelance","Project-based","Part-time"].map(type => (
                        <button key={type} type="button"
                          onClick={() => setEditForm(p => ({ ...p, workPreference: p.workPreference.includes(type) ? p.workPreference.filter(x => x !== type) : [...p.workPreference, type] }))}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors"
                          style={editForm.workPreference.includes(type)
                            ? { background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.4)", color: "#4ade80" }
                            : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
                          }>{type}</button>
                      ))}
                    </div>
                  </div>

                  {/* Social links */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Social Links</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "twitter", label: "Twitter / X", placeholder: "@username" },
                        { key: "github", label: "GitHub", placeholder: "username" },
                        { key: "linkedin", label: "LinkedIn", placeholder: "username" },
                        { key: "telegram", label: "Telegram", placeholder: "@username" },
                        { key: "discord", label: "Discord", placeholder: "user#1234" },
                        { key: "instagram", label: "Instagram", placeholder: "@username" },
                        { key: "website", label: "Website", placeholder: "https://..." },
                        { key: "email", label: "Email", placeholder: "hello@example.com" },
                        { key: "whatsapp", label: "WhatsApp", placeholder: "+628..." },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <label style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 3 }}>{label}</label>
                          <input
                            type={key === "email" ? "email" : "text"}
                            value={(editForm as any)[key]}
                            onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-lg text-white outline-none"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 12 }}
                            placeholder={placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex items-center gap-3 pt-2">
                    <button type="submit" disabled={editLoading}
                      className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                      style={{ background: "rgba(255,255,255,0.9)", color: "#0d0e11" }}>
                      {editLoading ? "Saving…" : "Save Changes"}
                    </button>
                    <button type="button" onClick={() => setShowInlineEdit(false)}
                      className="px-4 py-2.5 rounded-lg text-sm transition-all"
                      style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
                      Cancel
                    </button>
                  </div>
                </form>
                {editCropModal.isOpen && editCropModal.image && (
                  <ImageCropModal
                    image={editCropModal.image}
                    onCropComplete={handleEditCroppedImage}
                    onClose={() => setEditCropModal({ isOpen: false, image: null })}
                  />
                )}
              </div>
            )}{/* end inline edit form */}

        {/* Organization Impact - For Verified Orgs */}
        {profile?.isVerified && (
          <div id="attestation" className="mb-3 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
            <div
              onClick={() => setIsImpactExpanded(!isImpactExpanded)}
              className="flex items-center justify-between px-4 py-2.5 cursor-pointer transition-all hover:bg-white/[0.02]"
              style={{ background: "rgba(255,255,255,0.02)" }}
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

            </>}{/* end profile tab */}

            {/* ── ATTESTATION USAGE tab ── */}
            {activeTab === "attestation" && <>
        <div className="mb-3 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center justify-between px-4 py-2" style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <Activity style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} />
              </div>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Attestation Usage</p>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Resets monthly</span>
          </div>
          <div className="px-4 py-3">

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
        </div>
            </>}{/* end attestation tab */}


            {/* ── CREDENTIAL tab ── */}
            {activeTab === "credential" && <>
        <div id="credentials" className="mb-3 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="px-4 py-3" style={{ background: "rgba(255,255,255,0.02)" }}>
            <CertificateSection
              certs={certificates}
              isOwner={true}
              onDelete={handleDeleteCertificate}
              onAdd={() => setShowCertModal(true)}
            />
          </div>
        </div>

            </>}{/* end credential tab */}

            {/* ── PROOF OF WORK tab ── */}
            {activeTab === "proof-work" && <>
        <div id="proof-of-work" className="mb-3 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <FileCheck2 style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} />
              </div>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Proof of Work</p>
            </div>
            <div className="flex items-center gap-2">
            <button onClick={() => setShowForm(!showForm)} className="px-3 py-1.5 rounded-lg transition-all hover:bg-white/90" style={{ background: "rgba(255,255,255,0.9)", color: "#0d0e11", fontSize: 11, fontWeight: 700 }}>{showForm ? "Close" : "+ Add Proof"}</button>
            </div>
          </div>
          <div className="px-4 py-3">

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
          hideTimeline={true}
          onViewDetail={(r) => setSelectedReceiptForDetail(r)}
          onEdit={(r) => {
            setEditingReceipt(r);
            setShowForm(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
          </div>{/* end proof-of-work inner */}
        </div>{/* end proof-of-work card */}
            </>}{/* end proof-work tab */}

            {/* ── CAREER TIMELINE tab ── */}
            {activeTab === "timeline" && (
              receipts.filter(r => r.startDate || r.start_date).length > 0 ? (
                <div className="py-2">
                  <WorkTimeline
                    receipts={receipts.filter(r =>
                      r.attestationType !== "Hiring Proof" &&
                      !r.description?.includes("Official Verified Hiring Proof")
                    )}
                    onSelectReceipt={() => {}}
                    inline={true}
                  />
                </div>
              ) : (
                <div className="py-12 rounded-xl flex flex-col items-center justify-center text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <Briefcase style={{ width: 28, height: 28, color: "rgba(255,255,255,0.1)", marginBottom: 12 }} />
                  <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>No career timeline yet</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>Add proof of work entries with start and end dates to build your timeline.</p>
                </div>
              )
            )}
            {/* ── MY APPLICATIONS tab ── */}
            {activeTab === "applications" && (
              <div className="py-16 rounded-xl flex flex-col items-center justify-center text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Send style={{ width: 20, height: 20, color: "rgba(255,255,255,0.2)" }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>My Applications</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", lineHeight: 1.6, maxWidth: 280 }}>Track the companies and opportunities you've applied to. This feature is coming soon.</p>
                <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Coming Soon
                </span>
              </div>
            )}
            {/* ── INBOX tab ── */}
            {activeTab === "inbox" && <InboxPanel />}
          </>
        )}
      </section>
          </div>{/* end scrollable content */}
        </div>{/* end center panel */}

        {/* ── RIGHT PANEL ── */}
        <aside className="hidden lg:flex w-[260px] flex-shrink-0 flex-col overflow-y-auto custom-scrollbar" style={{ background: "#0a0b0e", borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="px-4 py-4 space-y-3">

          {isWalletRecruiter ? (
            /* ── RECRUITER RIGHT PANEL ── */
            <>
              {/* Share Page */}
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>Share Organization Page</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 8 }}>Copy your public organization link to share with candidates.</p>
                <button
                  onClick={async () => {
                    const name = encodeURIComponent((profile?.displayName ?? "Org").replace(/\s+/g, "-"));
                    const id = String(profile?.cardNumber ?? 1).padStart(5, "0");
                    const url = `${window.location.origin}/${name}/${id}`;
                    try { await navigator.clipboard.writeText(url); setToastMessage("Organization link copied!"); } catch { setToastMessage("Failed to copy link."); }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all hover:bg-white/[0.05]"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}
                >
                  <Copy style={{ width: 11, height: 11 }} /> Copy Link
                </button>
              </div>

              {/* View Public Page */}
              {profile?.cardNumber && (
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>View Public Page</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 8 }}>See how your organization appears to candidates and partners.</p>
                  <Link
                    href={`/${encodeURIComponent((profile.displayName ?? "Org").replace(/\s+/g, "-"))}/${String(profile.cardNumber).padStart(5, "0")}`}
                    target="_blank"
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all hover:bg-white/[0.05]"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600, display: "flex" }}
                  >
                    <ExternalLink style={{ width: 11, height: 11 }} /> View Page
                  </Link>
                </div>
              )}

              {/* Edit Profile */}
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>Edit Organization Profile</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 8 }}>Update your organization's bio, socials, and contact info.</p>
                <Link
                  href="/org/edit-profile-wallet"
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all hover:bg-white/[0.05]"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600, display: "flex" }}
                >
                  <PenLine style={{ width: 11, height: 11 }} /> Edit Profile
                </Link>
              </div>

              {/* Verify / Renew / Upgrade */}
              {!profile?.isVerified ? (
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(74,222,128,0.12)" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>Get Verified</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 8 }}>Verified organizations unlock attestation signing and trusted hiring.</p>
                  <button
                    onClick={() => { setIsRenewal(false); setShowVerificationModal(true); }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all"
                    style={{ border: "1px solid rgba(74,222,128,0.25)", background: "rgba(74,222,128,0.05)", fontSize: 11, color: "#4ade80", fontWeight: 600 }}
                  >
                    <ShieldCheck style={{ width: 11, height: 11 }} /> Apply for Verification
                  </button>
                </div>
              ) : profile?.isExpired ? (
                <div className="rounded-xl p-3" style={{ background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>Verification Expired</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 8 }}>Renew your organization verification to keep your trusted status.</p>
                  <button
                    onClick={() => { setIsRenewal(true); setShowVerificationModal(true); }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all"
                    style={{ border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.05)", fontSize: 11, color: "#f87171", fontWeight: 600 }}
                  >
                    <RefreshCw style={{ width: 11, height: 11 }} /> Renew Verification
                  </button>
                </div>
              ) : profile?.verifierTier && profile.verifierTier < 4 ? (
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>Upgrade Tier</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 8 }}>Unlock higher attestation quotas and more hiring collections.</p>
                  <button
                    onClick={() => { setIsRenewal(false); setShowVerificationModal(true); }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all"
                    style={{ border: "1px solid rgba(251,191,36,0.25)", background: "rgba(251,191,36,0.05)", fontSize: 11, color: "#fbbf24", fontWeight: 600 }}
                  >
                    <ShieldCheck style={{ width: 11, height: 11 }} /> Upgrade
                  </button>
                </div>
              ) : null}

            </>
          ) : (
            /* ── BUILDER RIGHT PANEL ── */
            <>
            {/* Share Your Profile */}
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>Share Your Profile</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 8 }}>Share your professional profile with employers and collaborators.</p>
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all hover:bg-white/[0.05]"
                style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}
              >
                <Share2 style={{ width: 11, height: 11 }} /> Share Profile
              </button>
            </div>

            {/* View Your CV */}
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>View Your CV</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 8 }}>Preview and download your professional CV.</p>
              <Link
                href={`/cv/${walletAddress}`}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all hover:bg-white/[0.05]"
                style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600, display: "flex" }}
              >
                <FileText style={{ width: 11, height: 11 }} /> View CV
              </Link>
            </div>

            {/* Upgrade / Verify / Renew */}
            {(!profile?.isVerified && !profile?.isExpired) ? (
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>Get Verified</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 8 }}>Unlock verified status and increase your attestation power.</p>
                <button
                  onClick={() => { setIsRenewal(false); setShowVerificationModal(true); }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all"
                  style={{ border: "1px solid rgba(74,222,128,0.25)", background: "rgba(74,222,128,0.05)", fontSize: 11, color: "#4ade80", fontWeight: 600 }}
                >
                  <ShieldCheck style={{ width: 11, height: 11 }} /> Verify Now
                </button>
              </div>
            ) : profile?.isExpired ? (
              <div className="rounded-xl p-3" style={{ background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>Verification Expired</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 8 }}>Renew your verification to restore your verified status.</p>
                <button
                  onClick={() => { setIsRenewal(true); setShowVerificationModal(true); }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all"
                  style={{ border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.05)", fontSize: 11, color: "#f87171", fontWeight: 600 }}
                >
                  <RefreshCw style={{ width: 11, height: 11 }} /> Renew Now
                </button>
              </div>
            ) : profile?.isVerified && profile?.verifierTier && profile.verifierTier < 4 ? (
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>Upgrade to Next Tier</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 8 }}>Unlock more features and increase your attestation limits.</p>
                <button
                  onClick={() => { setIsRenewal(false); setShowVerificationModal(true); }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all"
                  style={{ border: "1px solid rgba(251,191,36,0.25)", background: "rgba(251,191,36,0.05)", fontSize: 11, color: "#fbbf24", fontWeight: 600 }}
                >
                  <ShieldCheck style={{ width: 11, height: 11 }} /> Upgrade
                </button>
              </div>
            ) : null}

            {/* CV Score */}
            {profile && profile.cvScore != null && (
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>CV Score</p>
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.03em" }}>{profile.cvScore}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {profile.cvLevel && (
                      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", marginBottom: 3 }}>{profile.cvLevel}</p>
                    )}
                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(profile.cvScore, 100)}%`, background: "rgba(255,255,255,0.35)" }} />
                    </div>
                    <p style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 3 }}>Out of 100</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Completion */}
            {profile && (
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Profile Completion</p>
                  <span style={{ fontSize: 10, fontWeight: 700, color: profile.completionPercentage >= 100 ? "#4ade80" : "rgba(255,255,255,0.4)" }}>{profile.completionPercentage}%</span>
                </div>
                <div className="h-1 w-full rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${profile.completionPercentage}%`, background: profile.completionPercentage >= 100 ? "rgba(74,222,128,0.6)" : "rgba(255,255,255,0.35)" }} />
                </div>
                <div className="space-y-1.5">
                  {[
                    { done: !!profile.displayName, label: "Profile information" },
                    { done: !!profile.bio,          label: "Bio added" },
                    { done: !!profile.skills,       label: "Skills added" },
                    { done: receipts.length > 0,    label: `Proof of work (${receipts.length}/3)` },
                    { done: !!profile.isVerified,   label: "Identity verified" },
                  ].map(({ done, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: done ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)", border: done ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(255,255,255,0.1)" }}>
                        {done && (
                          <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: 9.5, color: done ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            </>
          )}

          </div>
        </aside>

        </div>{/* end inner rounded box */}
      </div>{/* end 3-panel body */}

      {/* Bottom vignette gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-[60]" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)" }} />

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

      {selectedReceiptForDetail && (
        <ReceiptDetailModal
          receipt={selectedReceiptForDetail}
          onClose={() => setSelectedReceiptForDetail(null)}
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

function GoogleBuilderNoWalletView({ session }: { session: Session }) {
  return (
    <main className="min-h-screen text-white relative bg-black theme-bg-page theme-aware">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div className="text-center space-y-3 max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl mx-auto">🏗</div>
          <h1 className="text-2xl font-bold">Connect your wallet</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            You are signed in as a Builder via Google. Link a Solana wallet to create your on-chain profile and access all builder features.
          </p>
          <p className="text-[11px] text-slate-600">Signed in as {session.user.email}</p>
        </div>
        <WalletMultiButton />
      </div>
    </main>
  );
}

function GoogleOrgDashboardWrapper({ session, orgAccount }: { session: Session; orgAccount: OrgAccount | null }) {
  const router = useRouter();
  const [googleCollections, setGoogleCollections] = useState<{ id: string; title: string; slug: string; created_at: string }[]>([]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isRenewalGoogle, setIsRenewalGoogle] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const needsOnboarding = !orgAccount || !orgAccount.onboarding_complete;
  useEffect(() => {
    if (needsOnboarding) router.replace("/onboarding/org");
  }, [needsOnboarding, router]);

  useEffect(() => {
    if (!orgAccount?.auth_uid || !session?.access_token) return;
    fetch(`/api/hiring/collections?auth_uid=${orgAccount.auth_uid}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.ok ? r.json() : { data: [] })
      .then(data => { if (Array.isArray(data.data)) setGoogleCollections(data.data); })
      .catch(() => {});
  }, [orgAccount, session]);

  if (needsOnboarding) return <LoadingScreen message="Setting up your organization..." />;

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

  const formattedName = encodeURIComponent((orgAccount?.org_name ?? "Org").replace(/\s+/g, "-"));
  const cleanId = String(orgAccount?.org_id_number ?? 1).padStart(5, "0");
  const publicPageUrl = `/${formattedName}/${cleanId}`;

  const googleNavTabs = [
    { Icon: Building2,      label: "Profile",             id: "profile"   },
    { Icon: FolderOpen,     label: "Hiring Center",       id: "hiring"    },
    { Icon: LayoutDashboard,label: "Projects & Programs", id: "projects"  },
    { Icon: Inbox,          label: "Inbox",               id: "inbox"     },
  ] as Array<{ Icon: React.ElementType; label: string; id: string }>;

  const tabMeta: Record<string, { title: string; desc: string }> = {
    profile:  { title: "Profile",             desc: "Manage your organization profile and activity." },
    hiring:   { title: "Hiring Center",       desc: "Manage your hiring collections and sourcing." },
    projects: { title: "Projects & Programs", desc: "Showcase your initiatives, hackathons, and programs." },
    inbox:    { title: "Inbox",               desc: "Direct messages and candidate conversations." },
  };
  const meta = tabMeta[activeTab] ?? tabMeta.profile;

  return (
    <main className="flex flex-col h-screen overflow-hidden text-white relative selection:bg-teal-500/30 selection:text-white" style={{ background: "#000000" }}>
      <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      <Navbar />
      <div className="flex-shrink-0" style={{ height: 96 }} />

      {/* ── 3-PANEL BODY ── */}
      <div className="flex-1 overflow-hidden min-h-0 px-4 md:px-16 pt-3 pb-3 flex flex-col">
        <div className="flex flex-1 overflow-hidden min-h-0 w-full max-w-[1230px] mx-auto rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>

          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col overflow-y-auto custom-scrollbar" style={{ background: "#0d0d10", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Logo */}
            <div className="flex items-center px-4 h-[46px] flex-shrink-0 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="animate-lightning-shine absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
              </div>
              <img src="/chainvolio%20logo.png" alt="chainvolio" style={{ height: 18, width: "auto", objectFit: "contain" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)", marginLeft: 6, letterSpacing: "-0.01em" }}>chainvolio</span>
            </div>
            {/* Nav */}
            <nav className="flex-1 px-2 py-3 space-y-0.5">
              {googleNavTabs.map(({ Icon, label, id }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className="w-full flex items-center gap-2.5 px-3 py-[7px] rounded-md relative transition-colors text-left"
                    style={active ? { background: "rgba(255,255,255,0.07)" } : {}}
                  >
                    {active && <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />}
                    <Icon style={{ width: 13, height: 13, color: active ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.42)" }}>{label}</span>
                  </button>
                );
              })}
            </nav>
            {/* Hiring Overview */}
            <div className="px-3 pb-3 space-y-1.5">
              <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>Hiring Overview</p>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.32)" }}>Collections</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>{googleCollections.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.32)" }}>Saved Candidates</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>{orgAccount?.saved_candidates_count ?? 0}</span>
              </div>
            </div>
            {/* User */}
            <div className="px-3 py-3 flex items-center gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                {googleProfile.avatarUrl
                  ? <img src={googleProfile.avatarUrl} alt={googleProfile.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold" style={{ background: "#2a2a2e", color: "rgba(255,255,255,0.5)" }}>{googleProfile.displayName?.[0] || "?"}</div>
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate" style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", lineHeight: 1 }}>{googleProfile.displayName}</p>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.22)", fontWeight: 500, marginTop: 2 }}>Google Account</p>
              </div>
            </div>
          </aside>

          {/* ── CENTER PANEL ── */}
          <div className="flex-1 overflow-y-auto min-w-0 flex flex-col" style={{ background: "#0a0b0e" }}>
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 h-[46px] flex-shrink-0 sticky top-0 z-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#0a0b0e" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.88)", lineHeight: 1 }}>{meta.title}</p>
                <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>{meta.desc}</p>
              </div>
              {activeTab === "profile" && (
                <Link
                  href="/org/edit-profile"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all hover:bg-white/[0.05]"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
                >
                  <ExternalLink style={{ width: 10, height: 10, color: "rgba(255,255,255,0.4)" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Edit Profile</span>
                </Link>
              )}
            </div>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
              {activeTab === "inbox" ? (
                <InboxPanel />
              ) : (
                <OrgDashboard
                  profile={googleProfile}
                  walletAddress={null}
                  collections={googleCollections}
                  attestationCount={0}
                  hideActionBar={true}
                  hideDetailSections={true}
                  activeSection={activeTab === "hiring" ? "hiring" : activeTab === "projects" ? "projects" : undefined}
                  onRequestVerification={(renewal) => {
                    setIsRenewalGoogle(renewal);
                    setShowVerifyModal(true);
                  }}
                  googleOrgAccount={orgAccount}
                  accessToken={session.access_token}
                />
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <aside className="hidden lg:flex w-[260px] flex-shrink-0 flex-col overflow-y-auto custom-scrollbar" style={{ background: "#0a0b0e", borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="px-4 py-4 space-y-3">
              {/* Share Page */}
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>Share Organization Page</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 8 }}>Copy your public organization link to share with candidates.</p>
                <button
                  onClick={async () => {
                    const url = `${window.location.origin}${publicPageUrl}`;
                    try { await navigator.clipboard.writeText(url); setToastMessage("Organization link copied!"); } catch { setToastMessage("Failed to copy link."); }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all hover:bg-white/[0.05]"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}
                >
                  <Copy style={{ width: 11, height: 11 }} /> Copy Link
                </button>
              </div>

              {/* View Public Page */}
              {orgAccount?.org_id_number && (
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>View Public Page</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 8 }}>See how your organization appears to candidates and partners.</p>
                  <Link
                    href={publicPageUrl} target="_blank"
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all hover:bg-white/[0.05]"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600, display: "flex" }}
                  >
                    <ExternalLink style={{ width: 11, height: 11 }} /> View Page
                  </Link>
                </div>
              )}

              {/* Edit Profile */}
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>Edit Organization Profile</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 8 }}>Update your organization's bio, socials, and contact info.</p>
                <Link
                  href="/org/edit-profile"
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all hover:bg-white/[0.05]"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600, display: "flex" }}
                >
                  <PenLine style={{ width: 11, height: 11 }} /> Edit Profile
                </Link>
              </div>

              {/* Upgrade Plan */}
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(74,222,128,0.12)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>Upgrade Plan</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 8 }}>Unlock verified status, more collections, and trusted hiring tools.</p>
                <Link
                  href="/recruiter/pricing"
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all"
                  style={{ border: "1px solid rgba(74,222,128,0.25)", background: "rgba(74,222,128,0.05)", fontSize: 11, color: "#4ade80", fontWeight: 600, display: "flex" }}
                >
                  <ShieldCheck style={{ width: 11, height: 11 }} /> View Plans
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-[60]" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)" }} />

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

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </main>
  );
}
