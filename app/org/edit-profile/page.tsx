"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, Check, Eye, PenLine, LogOut } from "lucide-react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const PAGE_BG = "#111111";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT_PRIMARY = "#f9fafb";
const TEXT_MUTED = "rgba(255,255,255,0.4)";
const ORANGE = "rgba(253,230,138,0.6)";

const inputStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.05)",
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 16,
    padding: 16,
    color: TEXT_PRIMARY,
    fontSize: 14,
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
    color: TEXT_MUTED,
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: "uppercase",
    display: "block",
};

const groupLabelStyle: React.CSSProperties = {
    color: "rgba(255,255,255,0.2)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 2,
    marginBottom: 25,
    textTransform: "uppercase",
};

const COUNTRIES = [
    "Global / Remote", "Indonesia", "United States", "Singapore", "United Kingdom",
    "Germany", "France", "Japan", "South Korea", "India", "Australia", "Canada",
    "Brazil", "Nigeria", "UAE", "Other",
];

const ORG_TYPES = [
    { value: "community", label: "Community / DAO" },
    { value: "company", label: "Company / Agency" },
];

const WORK_PREFS = ["Full-time", "Contract", "Freelance", "Project-based"];

export default function OrgEditProfilePage() {
    const router = useRouter();
    const { session, orgAccount, loading, refetchOrgAccount, signOut } = useGoogleAuth();
    const [isMobile, setIsMobile] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [cropModal, setCropModal] = useState<{ isOpen: boolean; image: string | null }>({ isOpen: false, image: null });

    const isBuilder = orgAccount?.account_type === "builder";

    const [form, setForm] = useState({
        org_name: "",
        org_type: "",
        bio: "",
        website: "",
        avatar_url: "",
        twitter: "",
        linkedin: "",
        discord: "",
        telegram: "",
        country: "",
        // builder-only fields
        github: "",
        instagram: "",
        whatsapp: "",
        skills: "",
        role: "",
        timezone: "",
        looking_for: "",
        work_preference: [] as string[],
    });

    useEffect(() => { setIsMobile(window.innerWidth < 768); }, []);
    useEffect(() => { if (!loading && !session) router.replace("/"); }, [loading, session, router]);
    useEffect(() => {
        if (orgAccount) {
            const a = orgAccount as any;
            setForm({
                org_name: a.org_name ?? "",
                org_type: a.org_type ?? "",
                bio: a.bio ?? "",
                website: a.website ?? "",
                avatar_url: a.avatar_url ?? "",
                twitter: a.twitter ?? "",
                linkedin: a.linkedin ?? "",
                discord: a.discord ?? "",
                telegram: a.telegram ?? "",
                country: a.country ?? "",
                github: a.github ?? "",
                instagram: a.instagram ?? "",
                whatsapp: a.whatsapp ?? "",
                skills: a.skills ?? "",
                role: a.role ?? "",
                timezone: a.timezone ?? "",
                looking_for: a.looking_for ?? "",
                work_preference: Array.isArray(a.work_preference) ? a.work_preference : [],
            });
        }
    }, [orgAccount]);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [k]: e.target.value }));

    const togglePref = (t: string) => {
        setForm(prev => ({
            ...prev,
            work_preference: prev.work_preference.includes(t)
                ? prev.work_preference.filter(x => x !== t)
                : [...prev.work_preference, t],
        }));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.addEventListener("load", () => setCropModal({ isOpen: true, image: reader.result as string }));
            reader.readAsDataURL(e.target.files[0]);
        }
        e.target.value = "";
    };

    const handleCroppedImage = async (croppedBlob: Blob) => {
        if (!orgAccount) return;
        setUploading(true);
        setCropModal({ isOpen: false, image: null });
        try {
            const { default: imageCompression } = await import("browser-image-compression");
            const compressed = await imageCompression(croppedBlob as File, { maxSizeMB: 0.5, maxWidthOrHeight: 400, useWebWorker: true, fileType: "image/webp" });
            const fileName = `org-${orgAccount.auth_uid}-${Date.now()}.webp`;
            const fd = new FormData();
            fd.append("file", compressed, fileName);
            fd.append("bucket", "avatars");
            fd.append("path", fileName);
            const res = await fetch("/api/storage/upload", { method: "POST", body: fd });
            if (!res.ok) throw new Error("Upload failed");
            const { url } = await res.json();
            setForm(prev => ({ ...prev, avatar_url: url }));
        } catch {
            // silent fail
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!session || !orgAccount) return;
        setSaving(true);
        const res = await fetch("/api/org-accounts", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
            body: JSON.stringify({
                auth_uid: orgAccount.auth_uid,
                org_name: form.org_name.trim() || null,
                org_type: isBuilder ? null : (form.org_type || null),
                bio: form.bio.trim() || null,
                website: form.website.trim() || null,
                avatar_url: form.avatar_url || null,
                twitter: form.twitter.trim() || null,
                linkedin: form.linkedin.trim() || null,
                discord: form.discord.trim() || null,
                telegram: form.telegram.trim() || null,
                country: form.country || null,
                ...(isBuilder && {
                    github: form.github.trim() || null,
                    instagram: form.instagram.trim() || null,
                    whatsapp: form.whatsapp.trim() || null,
                    skills: form.skills.trim() || null,
                    role: form.role.trim() || null,
                    timezone: form.timezone.trim() || null,
                    looking_for: form.looking_for.trim() || null,
                    work_preference: form.work_preference.length > 0 ? form.work_preference : null,
                }),
                onboarding_complete: true,
            }),
        });
        setSaving(false);
        if (res.ok) {
            await refetchOrgAccount();
            setSaved(true);
            setIsEditing(false);
            setTimeout(() => {
                setSaved(false);
                const dest = isMobile && session?.user?.id ? `/org/${session.user.id}` : "/dashboard";
                router.push(dest);
            }, 1200);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    if (loading) return <LoadingScreen />;

    const backHref = isMobile && session?.user?.id ? `/org/${session.user.id}` : "/dashboard";
    const emailDisplay = session?.user?.email ?? "";
    const nameInitial = form.org_name?.[0]?.toUpperCase() || emailDisplay[0]?.toUpperCase() || "?";

    const readOnly = !isEditing;
    const readInputStyle: React.CSSProperties = readOnly
        ? { ...inputStyle, color: "rgba(255,255,255,0.5)", cursor: "default" }
        : inputStyle;

    return (
        <div style={{ minHeight: "100dvh", backgroundColor: PAGE_BG, paddingTop: 52, paddingBottom: 120 }}>

            {/* Header */}
            <div style={{
                height: 100, display: "flex", flexDirection: "row",
                alignItems: "center", justifyContent: "space-between",
                paddingTop: 20, paddingLeft: 25, paddingRight: 25,
            }}>
                <div>
                    <p style={{ color: TEXT_PRIMARY, fontSize: 22, fontWeight: 600 }}>
                        {isEditing
                            ? (isBuilder ? "Identity Editor" : "Organization Editor")
                            : (isBuilder ? "Professional Identity" : "Organization Profile")
                        }
                    </p>
                    <p style={{ color: TEXT_MUTED, fontSize: 11, marginTop: 2 }}>
                        {isEditing ? "Syncing changes to trust layer" : "Your verifiable persona"}
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={() => router.push(backHref)}
                        style={{
                            width: 44, height: 44, borderRadius: 22,
                            backgroundColor: "rgba(255,255,255,0.06)",
                            border: `1px solid ${CARD_BORDER}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                        }}
                    >
                        <ArrowLeft size={20} color={TEXT_PRIMARY} />
                    </button>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        style={{
                            width: 44, height: 44, borderRadius: 22,
                            backgroundColor: "rgba(255,255,255,0.06)",
                            border: `1px solid ${CARD_BORDER}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                        }}
                    >
                        {isEditing
                            ? <Eye size={20} color={TEXT_PRIMARY} />
                            : <PenLine size={20} color={TEXT_PRIMARY} />
                        }
                    </button>
                </div>
            </div>

            <div style={{ paddingLeft: 25, paddingRight: 25 }}>

                {/* Avatar */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 10, marginBottom: 30 }}>
                    <div style={{ position: "relative" }}>
                        <div style={{
                            width: 90, height: 90, borderRadius: 45,
                            backgroundColor: "rgba(255,255,255,0.08)",
                            border: `1.5px solid ${CARD_BORDER}`,
                            overflow: "hidden",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            {form.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={form.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <span style={{ color: TEXT_PRIMARY, fontSize: 32, fontWeight: 600 }}>{nameInitial}</span>
                            )}
                        </div>
                        {uploading && (
                            <div style={{ position: "absolute", inset: 0, borderRadius: 45, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Loader2 size={20} color="white" className="animate-spin" />
                            </div>
                        )}
                        {isEditing && (
                            <label style={{
                                position: "absolute", bottom: 0, right: 0,
                                width: 28, height: 28, borderRadius: 14,
                                backgroundColor: "rgba(255,255,255,0.12)",
                                border: `1px solid ${CARD_BORDER}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer",
                            }}>
                                <Camera size={13} color={TEXT_PRIMARY} />
                                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={uploading} />
                            </label>
                        )}
                    </div>
                    <p style={{ color: TEXT_MUTED, fontSize: 10, letterSpacing: 1, marginTop: 12 }}>
                        {emailDisplay}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 8, letterSpacing: 2, marginTop: 4, textTransform: "uppercase" }}>
                        IDENTITY MANAGEMENT
                    </p>
                </div>

                {saved && (
                    <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <Check size={14} color="#34d399" />
                        <p style={{ color: "#34d399", fontSize: 13, fontWeight: 600 }}>Profile updated successfully</p>
                    </div>
                )}

                {/* Personal Information */}
                <div style={{ marginBottom: 40 }}>
                    <p style={groupLabelStyle}>PERSONAL INFORMATION</p>
                    <div style={{ marginBottom: 20 }}>
                        <label style={labelStyle}>{isBuilder ? "DISPLAY NAME" : "ORGANIZATION NAME"}</label>
                        <input style={readInputStyle} value={form.org_name} onChange={set("org_name")} placeholder={isBuilder ? "Your name or pseudonym" : "Organization name"} readOnly={readOnly} />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={labelStyle}>{isBuilder ? "PROFESSIONAL BIO" : "BIO / DESCRIPTION"}</label>
                        <textarea
                            style={{ ...readInputStyle, height: 100, resize: "none" } as React.CSSProperties}
                            value={form.bio}
                            onChange={set("bio")}
                            placeholder={isBuilder ? "Career highlights..." : "Briefly describe your organization..."}
                            readOnly={readOnly}
                        />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={labelStyle}>COUNTRY / REGION</label>
                        <select value={form.country} onChange={set("country")} disabled={readOnly} style={{ ...readInputStyle, appearance: "none" } as React.CSSProperties}>
                            <option value="" style={{ backgroundColor: "#1a1a1a" }}>Select region...</option>
                            {COUNTRIES.map(c => <option key={c} value={c} style={{ backgroundColor: "#1a1a1a" }}>{c}</option>)}
                        </select>
                    </div>

                    {!isBuilder && (
                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>ORGANIZATION TYPE</label>
                            <div style={{ display: "flex", gap: 12 }}>
                                {ORG_TYPES.map(t => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => isEditing && setForm(prev => ({ ...prev, org_type: t.value }))}
                                        style={{
                                            flex: 1, padding: "12px 16px", borderRadius: 16,
                                            border: `1px solid ${form.org_type === t.value ? "rgba(255,255,255,0.25)" : CARD_BORDER}`,
                                            backgroundColor: form.org_type === t.value ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                                            color: TEXT_PRIMARY, fontSize: 13, fontWeight: 600,
                                            cursor: isEditing ? "pointer" : "default",
                                        }}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Professional Information — builder only */}
                {isBuilder && (
                    <div style={{ marginBottom: 40 }}>
                        <p style={groupLabelStyle}>PROFESSIONAL INFORMATION</p>
                        {[
                            { key: "role", label: "CURRENT ROLE", placeholder: "Lead Dev, Designer, etc." },
                            { key: "skills", label: "CORE SKILLS", placeholder: "Rust, Next.js, Figma..." },
                            { key: "timezone", label: "TIMEZONE", placeholder: "UTC+7" },
                        ].map(f => (
                            <div key={f.key} style={{ marginBottom: 20 }}>
                                <label style={labelStyle}>{f.label}</label>
                                <input
                                    style={readInputStyle}
                                    value={(form as any)[f.key]}
                                    onChange={set(f.key as keyof typeof form)}
                                    placeholder={f.placeholder}
                                    readOnly={readOnly}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Contact & Social */}
                <div style={{ marginBottom: 40 }}>
                    <p style={groupLabelStyle}>CONTACT &amp; SOCIAL</p>
                    {[
                        { key: "website", label: "WEBSITE", placeholder: "https://..." },
                        { key: "twitter", label: "X / TWITTER", placeholder: "@handle" },
                        { key: "linkedin", label: "LINKEDIN", placeholder: "username" },
                        { key: "discord", label: "DISCORD", placeholder: "@handle" },
                        { key: "telegram", label: "TELEGRAM", placeholder: "@username" },
                        ...(isBuilder ? [
                            { key: "github", label: "GITHUB", placeholder: "username" },
                            { key: "instagram", label: "INSTAGRAM", placeholder: "@username" },
                            { key: "whatsapp", label: "WHATSAPP", placeholder: "+62..." },
                        ] : []),
                    ].map(f => (
                        <div key={f.key} style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>{f.label}</label>
                            <input
                                style={readInputStyle}
                                value={(form as any)[f.key]}
                                onChange={set(f.key as keyof typeof form)}
                                placeholder={f.placeholder}
                                readOnly={readOnly}
                            />
                        </div>
                    ))}
                    <div style={{ marginBottom: 20 }}>
                        <label style={labelStyle}>EMAIL</label>
                        <input
                            style={{ ...inputStyle, color: "rgba(255,255,255,0.3)", cursor: "not-allowed" } as React.CSSProperties}
                            value={emailDisplay}
                            readOnly
                        />
                        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, marginTop: 6 }}>Linked to your Google account — cannot be changed here.</p>
                    </div>
                </div>

                {/* Career Goals — builder only */}
                {isBuilder && (
                    <div style={{ marginBottom: 40 }}>
                        <p style={groupLabelStyle}>CAREER GOALS</p>
                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>LOOKING FOR</label>
                            <input
                                style={readInputStyle}
                                value={form.looking_for}
                                onChange={e => setForm(p => ({ ...p, looking_for: e.target.value.slice(0, 160) }))}
                                placeholder="Open to roles..."
                                readOnly={readOnly}
                            />
                            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 8, textAlign: "right", marginTop: 4 }}>{form.looking_for.length}/160</p>
                        </div>
                        <div>
                            <label style={labelStyle}>AVAILABILITY</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                {WORK_PREFS.map(t => {
                                    const active = form.work_preference.includes(t);
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => isEditing && togglePref(t)}
                                            style={{
                                                paddingLeft: 14, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
                                                borderRadius: 10, border: "none", cursor: isEditing ? "pointer" : "default",
                                                backgroundColor: active ? "rgba(253,230,138,0.08)" : "rgba(255,255,255,0.04)",
                                                borderWidth: 1, borderStyle: "solid",
                                                borderColor: active ? "rgba(253,230,138,0.3)" : CARD_BORDER,
                                                color: active ? ORANGE : TEXT_MUTED,
                                                fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const,
                                            }}
                                        >
                                            {t}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Save Button — only in edit mode */}
                {isEditing && (
                    <button
                        onClick={handleSave}
                        disabled={saving || uploading}
                        style={{
                            width: "100%", height: 60, borderRadius: 18,
                            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
                            color: TEXT_PRIMARY, fontSize: 16, fontWeight: 700, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            opacity: saving || uploading ? 0.5 : 1,
                            marginBottom: 12,
                        }}
                    >
                        {saving
                            ? <><Loader2 size={18} className="animate-spin" /> Saving...</>
                            : saved
                                ? <><Check size={18} color="#34d399" /> Saved</>
                                : "Save Changes"
                        }
                    </button>
                )}

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    style={{
                        width: "100%", height: 56, borderRadius: 16,
                        backgroundColor: "transparent",
                        border: `1px solid ${CARD_BORDER}`,
                        color: TEXT_MUTED, fontSize: 13, fontWeight: 600,
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 8, marginBottom: 20,
                    }}
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>

            {cropModal.isOpen && cropModal.image && (
                <ImageCropModal image={cropModal.image} onCropComplete={handleCroppedImage} onClose={() => setCropModal({ isOpen: false, image: null })} />
            )}
        </div>
    );
}
