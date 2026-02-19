"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { supabase } from "@/lib/supabase/client";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { CountrySelector } from "@/components/ui/CountrySelector";
import { SkillSelector } from "@/components/ui/SkillSelector";

export default function CreateProfilePage() {
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<{
    displayName: string;
    bio: string;
    skills: string;
    twitter: string;
    github: string;
    website: string;
    discord: string;
    whatsapp: string;
    email: string;
    country: string;
    avatarUrl: string;
    lookingFor: string;
    timezone: string;
    workPreference: string[];
    lens: string;
    farcaster: string;
    tags: string[];
    telegram: string;
  }>({
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
    workPreference: [],
    lens: "",
    farcaster: "",
    tags: [],
    telegram: "",
  });

  const [cropModal, setCropModal] = useState<{ isOpen: boolean; image: string | null }>({
    isOpen: false,
    image: null,
  });

  // Fetch existing profile if editing
  useEffect(() => {
    if (!publicKey) return;
    setLoading(true);
    fetch(`/api/profile?wallet=${publicKey.toBase58()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
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
            lens: data.lens || "",
            farcaster: data.farcaster || "",
            tags: data.tags || [],
            telegram: data.telegram || "",
          });
        }
      })
      .catch((err) => console.error("Error fetching profile:", err))
      .finally(() => setLoading(false));
  }, [publicKey]);

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
      if (!supabase) throw new Error("Supabase client not initialized");

      setUploading(true);
      setCropModal({ isOpen: false, image: null });

      const fileExt = "jpg";
      const fileName = `${publicKey?.toBase58()}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, croppedBlob);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, avatarUrl: data.publicUrl }));
    } catch (error: any) {
      alert("Error uploading avatar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          ...form,
        }),
      });
      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  if (!connected || !publicKey) {
    return (
      <main className="min-h-screen text-white flex flex-col items-center justify-center gap-6 px-6">
        <h1 className="text-2xl font-bold">Connect your wallet</h1>
        <p className="text-slate-400 text-center max-w-sm">
          You need to connect your Solana wallet (e.g. Phantom) to create or edit your profile.
        </p>
        <WalletMultiButton />
        <Link href="/" className="text-slate-400 hover:text-white">
          ← Back
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto relative z-[100]">
        <Link href="/" className="flex items-center gap-1.5 group">
          <img src="/chainvolio logo.png" alt="ChainVolio Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold">chainvolio</span>
        </Link>
        <WalletMultiButton />
      </nav>

      <section className="max-w-xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-8">{form.displayName ? "Edit Profile" : "Create Profile"}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Profile Picture</label>
            <div className="flex items-center gap-4">
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border border-slate-700"
                />
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
                  className="block w-full text-sm text-slate-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-emerald-500/10 file:text-emerald-400
                    hover:file:bg-emerald-500/20
                  "
                />
                {uploading && <p className="text-xs text-emerald-400 mt-1">Uploading...</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Display name</label>
            <input
              type="text"
              required
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
              placeholder="Name or pseudonym"
            />
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
            <SkillSelector
              value={form.skills}
              onChange={(val) => setForm({ ...form, skills: val })}
              maxSkills={8}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Country (Select from list)</label>
            <CountrySelector
              value={form.country}
              onChange={(val) => setForm({ ...form, country: val })}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Twitter (optional)</label>
            <input
              type="text"
              value={form.twitter}
              onChange={(e) => setForm({ ...form, twitter: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">GitHub (optional)</label>
            <input
              type="text"
              value={form.github}
              onChange={(e) => setForm({ ...form, github: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
              placeholder="username"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Discord (optional)</label>
            <input
              type="text"
              value={form.discord}
              onChange={(e) => setForm({ ...form, discord: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
              placeholder="user#1234"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Telegram (optional)</label>
            <input
              type="text"
              value={form.telegram}
              onChange={(e) => setForm({ ...form, telegram: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Lens Handle (optional)</label>
            <input
              type="text"
              value={form.lens}
              onChange={(e) => setForm({ ...form, lens: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
              placeholder="@handle.lens"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Farcaster Handle (optional)</label>
            <input
              type="text"
              value={form.farcaster}
              onChange={(e) => setForm({ ...form, farcaster: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
              placeholder="@username"
            />
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
                <option value="GMT-12">GMT-12</option>
                <option value="GMT-11">GMT-11</option>
                <option value="GMT-10">GMT-10</option>
                <option value="GMT-9">GMT-9</option>
                <option value="GMT-8">GMT-8 (PST)</option>
                <option value="GMT-7">GMT-7 (MST)</option>
                <option value="GMT-6">GMT-6 (CST)</option>
                <option value="GMT-5">GMT-5 (EST)</option>
                <option value="GMT-4">GMT-4</option>
                <option value="GMT-3">GMT-3</option>
                <option value="GMT-2">GMT-2</option>
                <option value="GMT-1">GMT-1</option>
                <option value="GMT+0">GMT+0 (UTC)</option>
                <option value="GMT+1">GMT+1 (CET)</option>
                <option value="GMT+2">GMT+2</option>
                <option value="GMT+3">GMT+3</option>
                <option value="GMT+4">GMT+4</option>
                <option value="GMT+5">GMT+5</option>
                <option value="GMT+6">GMT+6</option>
                <option value="GMT+7">GMT+7 (WIB)</option>
                <option value="GMT+8">GMT+8 (SGT)</option>
                <option value="GMT+9">GMT+9 (JST)</option>
                <option value="GMT+10">GMT+10</option>
                <option value="GMT+11">GMT+11</option>
                <option value="GMT+12">GMT+12</option>
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
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${form.workPreference.includes(type)
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Recruiter Tags (max 5)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-700 text-xs text-slate-200">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val && !form.tags.includes(val) && form.tags.length < 5) {
                      setForm({ ...form, tags: [...form.tags, val] });
                      e.currentTarget.value = "";
                    }
                  }
                }}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
                placeholder="Type and press Enter (e.g. DeFi, Design, Remote)"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {["Creative", "Brand", "Web3", "DeFi", "NFT", "Marketing", "Design", "Dev", "Community", "Remote"].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      if (!form.tags.includes(suggestion) && form.tags.length < 5) {
                        setForm({ ...form, tags: [...form.tags, suggestion] });
                      }
                    }}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Website (optional)</label>
            <input
              type="text"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
              placeholder="https://yourportfolio.com"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">WhatsApp (optional)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Email (optional)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 font-medium"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      {cropModal.isOpen && cropModal.image && (
        <ImageCropModal
          image={cropModal.image}
          onCropComplete={handleCroppedImage}
          onClose={() => setCropModal({ isOpen: false, image: null })}
        />
      )}
    </main>
  );
}
