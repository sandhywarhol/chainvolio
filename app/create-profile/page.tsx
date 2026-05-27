"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { Navbar } from "@/components/layout/Navbar";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { CountrySelector } from "@/components/ui/CountrySelector";
import { SkillSelector } from "@/components/ui/SkillSelector";
import { Instagram, Github, Globe, Send, Phone, Mail } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function CreateProfilePage() {
  const router = useRouter();
  const { publicKey, connected, signMessage } = useWallet();
  const { session } = useGoogleAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    skills: "",
    twitter: "",
    github: "",
    website: "",
    discord: "",
    whatsapp: "",
    email: "",
    country: "",
    avatarUrl: "",
    lookingFor: "",
    timezone: "",
    workPreference: [] as string[],
    telegram: "",
    linkedin: "",
    instagram: "",
    role: "",
    organization: "",
  });

  const [profileExists, setProfileExists] = useState(false);
  const [cropModal, setCropModal] = useState<{ isOpen: boolean; image: string | null }>({
    isOpen: false,
    image: null,
  });
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "warning" } | null>(null);

  // Fetch existing profile if editing
  useEffect(() => {
    if (!publicKey) return;
    setLoading(true);
    fetch(`/api/profile?wallet=${publicKey.toBase58()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.error) {
          // If no profile yet, but we have a Google session, pre-fill some data
          if (session?.user) {
            setForm((prev) => ({
              ...prev,
              displayName: prev.displayName || session.user.user_metadata?.full_name || "",
              email: prev.email || session.user.email || "",
              avatarUrl: prev.avatarUrl || session.user.user_metadata?.avatar_url || "",
            }));
          }
          return;
        }
        setProfileExists(true);
        setForm({
          displayName: data.displayName || "",
          bio: data.bio || "",
          skills: data.skills || "",
          twitter: data.twitter || "",
          github: data.github || "",
          website: data.website || "",
          discord: data.discord || "",
          whatsapp: data.whatsapp || "",
          email: data.email || "",
          country: data.country || "",
          avatarUrl: data.avatarUrl || "",
          lookingFor: data.lookingFor || "",
          timezone: data.timezone || "",
          workPreference: data.workPreference || [],
          telegram: data.telegram || "",
          linkedin: data.linkedin || "",
          instagram: data.instagram || "",
          role: data.role || "",
          organization: data.organization || "",
        });
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setToast({ message: "Failed to load profile data. Please refresh.", type: "error" });
      })
      .finally(() => setLoading(false));
  }, [publicKey, session]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCropModal({ isOpen: true, image: reader.result as string });
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCroppedImage = async (croppedBlob: Blob) => {
    try {
      setUploading(true);

      const { default: imageCompression } = await import("browser-image-compression");
      const compressedFile = await imageCompression(croppedBlob as File, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 400,
        useWebWorker: true,
        fileType: "image/webp"
      });

      const fileExt = "webp";
      const fileName = `${publicKey?.toBase58()}-${Date.now()}.${fileExt}`;

      const formData = new FormData();
      formData.append("file", compressedFile, fileName);
      formData.append("bucket", "avatars");
      formData.append("path", fileName);

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      const { url } = await res.json();
      setForm((prev) => ({ ...prev, avatarUrl: url }));
      setCropModal({ isOpen: false, image: null });
    } catch (error: any) {
      setToast({ message: "Error uploading avatar: " + error.message, type: "error" });
    } finally {
      setUploading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !signMessage) return;

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setToast({ message: "Please enter a valid email address.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const { signChainVolioAction } = await import("@/lib/wallet-utils");

      const actionType = profileExists ? "update_profile" : "update_profile_identity";
      const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, actionType);

      if (!signedAction) {
        setToast({ message: "Signing canceled. Please try again.", type: "error" });
        setLoading(false);
        return;
      }

      const method = profileExists ? "PATCH" : "POST";
      const res = await fetch("/api/profile", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          ...form,
          ...signedAction
        }),
      });

      if (res.ok) {
        setToast({ message: "Profile saved successfully!", type: "success" });
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        const data = await res.json();
        setToast({ message: data.error?.message || data.error || "Failed to save profile.", type: "error" });
      }
    } catch (error) {
      setToast({ message: "Error saving profile", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !form.displayName) {
    return (
      <div className="min-h-screen bg-black theme-bg-page theme-aware flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingScreen fullScreen={false} />
        </div>
      </div>
    );
  }

  if (!connected || !publicKey) {
    return (
      <main className="min-h-screen text-white flex flex-col bg-black theme-bg-page theme-aware">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          <h1 className="text-2xl font-bold">Connect your wallet</h1>
          <p className="text-slate-400 text-center max-w-sm">
            Connect your Solana wallet or sign in with Google to create or edit your profile.
          </p>
          <WalletMultiButton />
          <Link href="/" className="text-slate-400 hover:text-white">
            ← Back
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white relative overflow-x-hidden selection:bg-teal-500/30 selection:text-white bg-black theme-bg-page theme-aware">
      {/* Very subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.012] pointer-events-none z-[50]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <Navbar />

      <section className="max-w-xl mx-auto px-6 pt-32 pb-12">
        <h1 className="text-2xl font-bold mb-8">{form.displayName ? "Edit Profile" : "Create Profile"}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Profile Picture</label>
            <div className="flex items-center gap-4">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-slate-700" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                  <span className="text-2xl">?</span>
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20"
                />
                {uploading && <p className="text-xs text-emerald-400 mt-1">Uploading...</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Display name *</label>
            <input
              type="text"
              required
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
              placeholder="Name or pseudonym"
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Current Role (optional)</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
                placeholder="CEO, Lead Developer, etc."
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Current Organization (optional)</label>
              <input
                type="text"
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
                placeholder="Google, Solana Foundation, DAO, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none resize-none h-24"
              placeholder="Brief intro about you"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Primary Skills</label>
            <SkillSelector value={form.skills} onChange={(val) => setForm({ ...form, skills: val })} maxSkills={8} />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Country (Select from list)</label>
            <CountrySelector value={form.country} onChange={(val) => setForm({ ...form, country: val })} />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              Twitter / X (optional)
            </label>
            <input
              type="text"
              value={form.twitter}
              onChange={(e) => setForm({ ...form, twitter: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
              GitHub (optional)
            </label>
            <input
              type="text"
              value={form.github}
              onChange={(e) => setForm({ ...form, github: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
              placeholder="username"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 11.721 11.721 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.862-1.295 1.192-1.996a.076.076 0 0 0-.041-.106 13.046 13.046 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
              Discord (optional)
            </label>
            <input
              type="text"
              value={form.discord}
              onChange={(e) => setForm({ ...form, discord: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
              placeholder="user#1234"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0C5.347 0 0 5.347 0 11.944c0 6.597 5.347 11.944 11.944 11.944 6.597 0 11.944-5.347 11.944-11.944C23.888 5.347 18.541 0 11.944 0zm5.204 8.525c-.179 1.884-.962 5.925-1.359 8.041-.168.9-.499 1.203-.82 1.232-.698.064-1.226-.462-1.902-.905-1.057-.695-1.655-1.127-2.682-1.803-1.187-.781-.417-1.21.258-1.912.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.071-.064-.175-.041-.249-.024-.106.024-1.793 1.141-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.098.154.228.163.319.009.091.011.201.009.324z" /></svg>
              Telegram (optional)
            </label>
            <input
              type="text"
              value={form.telegram}
              onChange={(e) => setForm({ ...form, telegram: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
              placeholder="@username"
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>
                LinkedIn (optional)
              </label>
              <input
                type="text"
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
                placeholder="username"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.166.054 1.8.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.427.359 1.061.413 2.227.057 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.166-.249 1.8-.415 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.427.164-1.061.359-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.166-.054-1.8-.249-2.227-.415-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.427-.359-1.061-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.166.249-1.8.415-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.427-.164 1.061-.359 2.227-.413 1.266-.057 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.057-2.149.261-2.911.558-.788.306-1.457.715-2.122 1.381-.666.665-1.075 1.334-1.381 2.122-.297.762-.501 1.634-.558 2.911-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.057 1.277.261 2.149.558 2.911.306.788.715 1.457 1.381 2.122.665.666 1.334 1.075 2.122 1.381.762.297 1.634.501 2.911.558 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.057 2.149-.261 2.911-.558.788-.306 1.457-.715 2.122-1.381.666-.665 1.334-1.075 2.122-1.381.297-.762.501-1.634.558-2.911.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.057-1.277-.261-2.149-.558-2.911-.306-.788-.715-1.457-1.381-2.122-.665-.666-1.334-1.075-2.122-1.381-.762-.297-1.634-.501-2.911-.558-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                Instagram (optional)
              </label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
                placeholder="@username"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <Globe size={14} className="text-emerald-400" /> Website (optional)
            </label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
              placeholder="https://yourportfolio.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                WhatsApp (optional)
              </label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
                placeholder="+628123..."
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <Mail size={14} className="text-amber-400" /> Email Address (optional)
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
                placeholder="hello@example.com"
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 mt-6">
            <h3 className="text-lg font-medium text-white mb-4">Work Preferences</h3>
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Looking For (max 160 chars)</label>
              <input
                type="text"
                value={form.lookingFor}
                onChange={(e) => setForm({ ...form, lookingFor: e.target.value.slice(0, 160) })}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
                placeholder="Open to remote brand & visual roles..."
              />
              <p className="text-right text-xs text-slate-500 mt-1">{form.lookingFor.length}/160</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Timezone</label>
              <select
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none text-slate-200"
              >
                <option value="">Select Timezone</option>
                {["GMT-12", "GMT-11", "GMT-10", "GMT-9", "GMT-8", "GMT-7", "GMT-6", "GMT-5", "GMT-4", "GMT-3", "GMT-2", "GMT-1", "GMT+0", "GMT+1", "GMT+2", "GMT+3", "GMT+4", "GMT+5", "GMT+6", "GMT+7", "GMT+8", "GMT+9", "GMT+10", "GMT+11", "GMT+12"].map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Availability Type</label>
              <div className="flex flex-wrap gap-2">
                {["Full-time", "Contract", "Freelance", "Project-based", "Part-time"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      const newPrefs = form.workPreference.includes(type)
                        ? form.workPreference.filter((p) => p !== type)
                        : [...form.workPreference, type];
                      setForm({ ...form, workPreference: newPrefs });
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${form.workPreference.includes(type) ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <button type="submit" disabled={loading || uploading} className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 font-medium">
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      {cropModal.isOpen && cropModal.image && (
        <ImageCropModal image={cropModal.image} onCropComplete={handleCroppedImage} onClose={() => setCropModal({ isOpen: false, image: null })} />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
