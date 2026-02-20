"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { ReceiptForm } from "@/components/receipt/ReceiptForm";
import { ReceiptList } from "@/components/receipt/ReceiptList";
import { Toast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase/client";
import { Github, Globe, MessageSquare, Mail, MapPin, Briefcase, Clock, Twitter, LayoutDashboard, ExternalLink, Plus } from "lucide-react";

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

type HiringCollection = {
  id: string;
  title: string;
  slug: string;
  created_at: string;
};

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [collections, setCollections] = useState<HiringCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleShare = async () => {
    if (!profile || !publicKey) return;
    const url = `${window.location.origin}/cv/${publicKey.toBase58()}`;
    try {
      await navigator.clipboard.writeText(url);
      setToastMessage("CV link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    if (!connected || !publicKey) {
      setLoading(false);
      return;
    }

    const wallet = publicKey.toBase58();

    // 1. Fetch Profile
    fetch(`/api/profile?wallet=${wallet}`)
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // 2. Fetch Hiring Collections
    async function fetchCollections() {
      if (!supabase) return;
      const { data } = await supabase
        .from("hiring_collections")
        .select("id, title, slug, created_at")
        .eq("owner_wallet", wallet)
        .order("created_at", { ascending: false });

      if (data) setCollections(data);
    }
    fetchCollections();

  }, [publicKey, connected]);

  // ... (Login screen remains)

  if (!publicKey) {
    return (
      <main className="min-h-screen text-white bg-[#030303]">
        <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-1.5 group">
              <img src="/chainvolio%20logo.png" alt="ChainVolio Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold">ChainVolio</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/why" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors normal-case">Why ChainVolio</Link>
            </div>
          </div>
          <WalletMultiButton />
        </nav>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Connect your wallet</h1>
            <p className="text-slate-400">Please connect your wallet to view your dashboard</p>
          </div>
          <WalletMultiButton />
        </div>
      </main >
    );
  }

  const walletAddress = publicKey.toBase58();

  return (
    <main className="min-h-screen text-white">
      {/* ... (Nav remains) */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto relative z-[100]">
        <Link href="/" className="flex items-center gap-1.5 group">
          <img src="/chainvolio%20logo.png" alt="ChainVolio Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold">ChainVolio</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/why" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors normal-case">Why ChainVolio</Link>
          <Link href="/hiring/create" className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70 hover:text-emerald-400 transition-colors">Hire Talent</Link>
          <WalletMultiButton />
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : !profile ? (
          <div className="mb-8 p-4 rounded-lg bg-slate-800 border border-slate-700">
            <p className="mb-4">No profile yet. Create one first.</p>
            <Link
              href="/create-profile"
              className="inline-block px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600"
            >
              Create Profile
            </Link>
          </div>
        ) : (
          <div className="mb-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="flex-shrink-0">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 shadow-xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-slate-500 text-4xl font-bold shadow-xl">
                    {profile.displayName?.[0] || '?'}
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
                <div className="flex items-center justify-center md:justify-between mb-4">
                  <h1 className="text-3xl font-bold">{profile.displayName}</h1>
                  <Link
                    href="/create-profile"
                    className="hidden md:block px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium transition-colors border border-slate-600"
                  >
                    Edit Profile
                  </Link>
                </div>

                {profile.lookingFor && (
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      {profile.lookingFor}
                    </span>
                  </div>
                )}

                {profile.bio && <p className="text-slate-400 mb-6 leading-relaxed">{profile.bio}</p>}

                {profile.skills && (
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
                    {profile.skills.split(',').map((skill: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {profile.twitter && <Twitter className="w-4 h-4 text-slate-500" />}
                  {profile.github && <Github className="w-4 h-4 text-slate-500" />}
                  {profile.website && <Globe className="w-4 h-4 text-slate-500" />}
                  {profile.email && <Mail className="w-4 h-4 text-slate-500" />}
                  {profile.discord && (
                    <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 11.721 11.721 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.862-1.295 1.192-1.996a.076.076 0 0 0-.041-.106 13.046 13.046 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  )}
                  {profile.telegram && (
                    <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0C5.347 0 0 5.347 0 11.944c0 6.597 5.347 11.944 11.944 11.944 6.597 0 11.944-5.347 11.944-11.944C23.888 5.347 18.541 0 11.944 0zm5.204 8.525c-.179 1.884-.962 5.925-1.359 8.041-.168.9-.499 1.203-.82 1.232-.698.064-1.226-.462-1.902-.905-1.057-.695-1.655-1.127-2.682-1.803-1.187-.781-.417-1.21.258-1.912.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.071-.064-.175-.041-.249-.024-.106.024-1.793 1.141-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.098.154.228.163.319.009.091.011.201.009.324z" />
                    </svg>
                  )}
                </div>

                <Link
                  href="/create-profile"
                  className="mt-6 md:hidden block w-full py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium transition-colors border border-slate-600"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Hiring Collections - For Recruiters */}
        {collections.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-emerald-500" />
              Hiring Collections
            </h2>
            <div className="grid gap-4">
              {collections.map(col => (
                <div key={col.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-between group hover:border-emerald-500/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{col.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Created {new Date(col.created_at).toLocaleDateString()}</span>
                      <Link href={`/r/${col.slug}`} target="_blank" className="hover:text-white flex items-center gap-1">
                        View Public Page <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                  <Link
                    href={`/hiring/${col.slug}/dashboard`}
                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-bold rounded-lg transition-colors border border-emerald-500/20"
                  >
                    Open Dashboard
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <Link href="/hiring/create" className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create another collection
              </Link>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Proof of Work</h2>
          <div className="flex gap-3">
            <Link
              href={`/cv/${walletAddress}`}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-medium transition-colors"
            >
              View CV
            </Link>
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-medium transition-colors"
            >
              Share CV
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-medium"
            >
              {showForm ? "Close" : "+ Add Receipt"}
            </button>
          </div>
        </div>

        {showForm && (
          <ReceiptForm
            walletAddress={walletAddress}
            onSuccess={() => setShowForm(false)}
          />
        )}

        <ReceiptList walletAddress={walletAddress} />
      </section>

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </main>
  );
}
