"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe, Send, Mail, MapPin, Building2, Save, Camera, Loader2 } from "lucide-react";
import { XIcon, LinkedInIcon, DiscordIcon } from "@/components/ui/SocialIcons";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/wallet/WalletButton";
import { Toast } from "@/components/ui/Toast";
import { ImageCropModal } from "@/components/ui/ImageCropModal";

const ORG_TYPES = [
    { value: "community", label: "Community / DAO", description: "Open communities, DAOs, or non-profit orgs" },
    { value: "company", label: "Company / Agency", description: "Businesses, agencies, or commercial orgs" },
];

const COUNTRIES = [
    "Global / Remote", "Indonesia", "United States", "Singapore", "United Kingdom",
    "Germany", "France", "Japan", "South Korea", "India", "Australia", "Canada",
    "Brazil", "Nigeria", "UAE", "Other",
];

function OrgEditProfileWalletContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const presetOrgType = searchParams.get("type"); // "company" | "community" — set by recruiter modal flow
    const { publicKey, connected, signMessage } = useWallet();
    const [walletReady, setWalletReady] = useState(false);
    const [profileExists, setProfileExists] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [verificationType, setVerificationType] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type?: "success" | "error" } | null>(null);
    const [cropModal, setCropModal] = useState<{ isOpen: boolean; image: string | null }>({ isOpen: false, image: null });

    const [form, setForm] = useState({
        displayName: "",
        org_type: presetOrgType ?? "",
        bio: "",
        website: "",
        avatarUrl: "",
        twitter: "",
        linkedin: "",
        discord: "",
        telegram: "",
        country: "",
    });

    // Wallet adapter hydrates client-side — wait one tick before showing the gate
    useEffect(() => { setWalletReady(true); }, []);

    useEffect(() => {
        if (!publicKey) return;
        // Use dashboard/stats which aggregates org data from organization_verifications
        fetch(`/api/dashboard/stats?wallet=${publicKey.toBase58()}`)
            .then(r => r.json())
            .then(({ profile: data }) => {
                if (data?.displayName) {
                    setProfileExists(true);
                    const fetchedType = (data.verificationType && data.verificationType !== "unverified")
                        ? data.verificationType
                        : null;
                    setVerificationType(fetchedType);
                    setForm({
                        displayName: data.displayName ?? "",
                        org_type: fetchedType ?? presetOrgType ?? "",
                        bio: data.bio ?? "",
                        website: data.website ?? "",
                        avatarUrl: data.avatarUrl ?? "",
                        twitter: data.twitter ?? "",
                        linkedin: data.linkedin ?? "",
                        discord: data.discord ?? "",
                        telegram: data.telegram ?? "",
                        country: data.country ?? "",
                    });
                }
            })
            .catch(() => {});
    }, [publicKey]);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [k]: e.target.value }));

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setCropModal({ isOpen: true, image: reader.result as string });
            });
            reader.readAsDataURL(e.target.files[0]);
        }
        e.target.value = "";
    };

    const handleCroppedImage = async (croppedBlob: Blob) => {
        if (!publicKey) return;
        try {
            setUploading(true);
            setCropModal({ isOpen: false, image: null });

            const { default: imageCompression } = await import("browser-image-compression");
            const compressed = await imageCompression(croppedBlob as File, {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 400,
                useWebWorker: true,
                fileType: "image/webp",
            });

            const fileName = `${publicKey.toBase58()}-${Date.now()}.webp`;
            const fd = new FormData();
            fd.append("file", compressed, fileName);
            fd.append("bucket", "avatars");
            fd.append("path", fileName);

            const res = await fetch("/api/storage/upload", { method: "POST", body: fd });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Upload failed");
            }
            const { url } = await res.json();
            setForm(prev => ({ ...prev, avatarUrl: url }));
        } catch (err: any) {
            setToast({ message: "Avatar upload failed: " + err.message, type: "error" });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!publicKey || !signMessage) return;
        setSaving(true);
        try {
            const { signChainVolioAction } = await import("@/lib/wallet-utils");
            const actionType = profileExists ? "update_profile" : "update_profile_identity";
            const signedAction = await signChainVolioAction({ publicKey, signMessage } as any, actionType);
            if (!signedAction) { setSaving(false); return; }

            const method = profileExists ? "PATCH" : "POST";
            const res = await fetch("/api/profile", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    walletAddress: publicKey.toBase58(),
                    displayName: form.displayName,
                    bio: form.bio,
                    website: form.website,
                    avatarUrl: form.avatarUrl,
                    twitter: form.twitter,
                    linkedin: form.linkedin,
                    discord: form.discord,
                    telegram: form.telegram,
                    country: form.country,
                    ...signedAction,
                }),
            });

            if (!res.ok) {
                const json = await res.json();
                setToast({ message: json.error?.message ?? json.error ?? "Failed to save. Please try again.", type: "error" });
                return;
            }

            // For new recruiter users coming from the wallet modal, create a pending verification record
            if (!profileExists && presetOrgType && form.org_type) {
                try {
                    await fetch("/api/organizations/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: form.displayName,
                            type: form.org_type,
                            walletAddress: publicKey.toBase58(),
                        }),
                    });
                } catch { /* best-effort */ }
            }

            setToast({ message: "Profile saved!", type: "success" });
            setTimeout(() => router.push("/dashboard"), 1000);
        } catch (err: any) {
            setToast({ message: "Error saving profile: " + err.message, type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (!walletReady) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-black theme-bg-page theme-aware">
                <div className="w-6 h-6 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
            </main>
        );
    }

    if (!connected || !publicKey) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-black theme-bg-page theme-aware text-white px-4">
                <Building2 className="w-10 h-10 text-slate-600" />
                <h1 className="text-2xl font-bold">Connect your wallet</h1>
                <p className="text-slate-400 text-center max-w-sm text-sm">
                    Connect your Solana wallet to edit your organization profile.
                </p>
                <WalletMultiButton />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black theme-bg-page theme-aware text-white">
            {/* Sticky header */}
            <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Edit Organization Profile</span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-10">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Avatar upload */}
                    <section className="flex items-center gap-6 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                        <div className="relative flex-shrink-0">
                            <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center">
                                {form.avatarUrl ? (
                                    <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="w-8 h-8 text-slate-600" />
                                )}
                            </div>
                            {uploading && (
                                <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white mb-1">Organization Logo</p>
                            <p className="text-[11px] text-slate-500 mb-3">Square image recommended. Max 500 KB, auto-compressed.</p>
                            <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                                uploading
                                    ? "border-slate-700 text-slate-600 cursor-not-allowed"
                                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            }`}>
                                <Camera className="w-3.5 h-3.5" />
                                {uploading ? "Uploading..." : form.avatarUrl ? "Change Image" : "Upload Image"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    disabled={uploading}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </section>

                    {/* Identity */}
                    <section className="space-y-4">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Organization Identity</h2>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Organization Name <span className="text-red-400">*</span></label>
                            <input
                                type="text"
                                required
                                value={form.displayName}
                                onChange={set("displayName")}
                                placeholder="e.g. Solana Foundation"
                                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">Organization Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                {ORG_TYPES.map(t => {
                                    const canEdit = !verificationType;
                                    const isActive = canEdit ? form.org_type === t.value : verificationType === t.value;
                                    return (
                                        <div
                                            key={t.value}
                                            onClick={canEdit ? () => setForm(prev => ({ ...prev, org_type: t.value })) : undefined}
                                            className={`text-left px-4 py-3.5 rounded-xl border transition-colors ${
                                                isActive
                                                    ? "border-emerald-500 bg-emerald-500/10 text-white"
                                                    : canEdit
                                                        ? "border-slate-700/50 bg-slate-800/50 text-slate-300 hover:border-slate-600 cursor-pointer"
                                                        : "border-slate-700/50 bg-slate-800/50 text-slate-500 opacity-50"
                                            }`}
                                        >
                                            <div className="font-bold text-sm flex items-center gap-2">
                                                {t.label}
                                                {isActive && !canEdit && <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Verified</span>}
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-0.5">{t.description}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            {verificationType ? (
                                <p className="text-[10px] text-slate-600 mt-2 ml-1">Organization type is set by your verification — contact support to change it.</p>
                            ) : (
                                <p className="text-[10px] text-slate-600 mt-2 ml-1">Choose the type that best describes your organization.</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Bio / Description</label>
                            <textarea
                                value={form.bio}
                                onChange={set("bio")}
                                placeholder="Briefly describe your organization, mission, and what you do..."
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none text-sm leading-relaxed"
                            />
                        </div>
                    </section>

                    {/* Presence */}
                    <section className="space-y-4">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Presence</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5">Country / Region</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <select value={form.country} onChange={set("country")}
                                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm appearance-none">
                                        <option value="">Select region...</option>
                                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5">Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input type="text" value={form.website} onChange={set("website")} placeholder="https://yourorg.com"
                                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contacts & Socials */}
                    <section className="space-y-4">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Contact &amp; Socials</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5">X / Twitter</label>
                                <div className="relative">
                                    <XIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input type="text" value={form.twitter} onChange={set("twitter")} placeholder="@handle or URL"
                                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5">LinkedIn</label>
                                <div className="relative">
                                    <LinkedInIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input type="text" value={form.linkedin} onChange={set("linkedin")} placeholder="company-name"
                                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5">Discord</label>
                                <div className="relative">
                                    <DiscordIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input type="text" value={form.discord} onChange={set("discord")} placeholder="discord.gg/invite or @handle"
                                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5">Telegram</label>
                                <div className="relative">
                                    <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input type="text" value={form.telegram} onChange={set("telegram")} placeholder="t.me/group or @channel"
                                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm" />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-400 mb-1.5">Wallet Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input type="text" value={publicKey?.toBase58() ?? ""} readOnly
                                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700/50 text-slate-500 cursor-not-allowed text-sm font-mono" />
                                </div>
                                <p className="text-[10px] text-slate-600 mt-1 ml-1">Your identity anchor — cannot be changed.</p>
                            </div>
                        </div>
                    </section>

                    {/* Submit */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving || uploading || !form.displayName.trim()}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-sm transition-all"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Signing & Saving..." : "Save Profile"}
                        </button>
                        <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors border border-slate-700">
                            Cancel
                        </Link>
                    </div>

                    <p className="text-[10px] text-slate-600 text-center">
                        Saving requires a wallet signature to verify ownership. No transaction fees.
                    </p>
                </form>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {cropModal.isOpen && cropModal.image && (
                <ImageCropModal image={cropModal.image} onCropComplete={handleCroppedImage} onClose={() => setCropModal({ isOpen: false, image: null })} />
            )}
        </main>
    );
}

export default function OrgEditProfileWalletPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center bg-black theme-bg-page theme-aware">
                <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
            </main>
        }>
            <OrgEditProfileWalletContent />
        </Suspense>
    );
}
