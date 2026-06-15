"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { ChevronRight } from "lucide-react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function AuthRolePage() {
    const router = useRouter();
    const { session, orgAccount, loading } = useGoogleAuth();
    const [selectedRole, setSelectedRole] = useState<"builder" | "recruiter" | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    useEffect(() => {
        if (loading) return;
        if (!session) { router.replace("/"); return; }
        // Only skip role selection if account is fully set up
        if (orgAccount?.onboarding_complete) { router.replace(window.innerWidth < 768 ? "/" : "/dashboard"); return; }
    }, [loading, session, orgAccount, router]);

    const handleContinue = async () => {
        if (!selectedRole || !session) return;
        setSaving(true);
        setError(null);

        // Both builder and recruiter create their account immediately and go to dashboard.
        // Recruiter can fill in org name/type later in edit profile — no blocking onboarding step.
        const defaultOrgName =
            (session.user.user_metadata?.full_name as string | undefined) ||
            (session.user.user_metadata?.name as string | undefined) ||
            session.user.email?.split("@")[0] ||
            "My Organization";

        const res = await fetch("/api/org-accounts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                auth_uid: session.user.id,
                email: session.user.email ?? "",
                account_type: selectedRole,           // "builder" or "recruiter"
                onboarding_complete: true,
                // Recruiter defaults — user updates these in edit profile
                ...(selectedRole === "recruiter" && {
                    org_name: defaultOrgName,
                    org_type: "company",
                }),
            }),
        });

        if (!res.ok) {
            setError("Something went wrong. Please try again.");
            setSaving(false);
            return;
        }

        router.replace(window.innerWidth < 768 ? "/" : "/dashboard");
    };

    if (loading || !session) return <LoadingScreen message="Loading..." />;
    if (orgAccount?.onboarding_complete) return <LoadingScreen message="Loading your dashboard..." />;

    const avatarUrl = session.user.user_metadata?.avatar_url as string | undefined;

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#111111] md:bg-black text-white px-4 pb-24 md:pb-0">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <img src="/chainvolio%20logo.png" alt="chainvolio" className="h-6 w-auto object-contain" />
                    <span className="text-sm font-bold text-white/80">chainvolio</span>
                </div>

                <div className="bg-[#0d0d0f] border border-white/10 rounded-[28px] overflow-hidden">
                    {/* Header */}
                    <div className="p-6 sm:p-7 border-b border-white/5">
                        <h1 className="text-xl font-bold text-white">How will you use ChainVolio?</h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">Choose your role to continue</p>
                        <div className="mt-3 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center">
                                {avatarUrl
                                    ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                    : <span className="text-[9px] font-bold text-white/40">{session.user.email?.[0]?.toUpperCase()}</span>
                                }
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{session.user.email}</p>
                        </div>
                    </div>

                    {/* Role cards */}
                    <div className="p-5 sm:p-7 space-y-4">
                        <div className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
                            <div
                                onClick={() => setSelectedRole("builder")}
                                className={`p-5 rounded-[20px] border cursor-pointer transition-all flex flex-col items-center text-center gap-3 ${
                                    selectedRole === "builder"
                                        ? "border-indigo-500/50 bg-indigo-500/10"
                                        : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5"
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${selectedRole === "builder" ? "bg-indigo-500/20" : "bg-white/5"}`}>
                                    🏗
                                </div>
                                <div>
                                    <p className={`font-black text-sm ${selectedRole === "builder" ? "text-white" : "text-slate-300"}`}>Builder</p>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">Talent, dev, designer, creator</p>
                                </div>
                                {selectedRole === "builder" && (
                                    <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                )}
                            </div>

                            {!isMobile && (
                                <div
                                    onClick={() => setSelectedRole("recruiter")}
                                    className={`p-5 rounded-[20px] border cursor-pointer transition-all flex flex-col items-center text-center gap-3 ${
                                        selectedRole === "recruiter"
                                            ? "border-amber-500/50 bg-amber-500/10"
                                            : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5"
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${selectedRole === "recruiter" ? "bg-amber-500/20" : "bg-white/5"}`}>
                                        🔍
                                    </div>
                                    <div>
                                        <p className={`font-black text-sm ${selectedRole === "recruiter" ? "text-white" : "text-slate-300"}`}>Recruiter</p>
                                        <p className="text-[10px] text-slate-500 mt-1 leading-snug">Company, DAO, community</p>
                                    </div>
                                    {selectedRole === "recruiter" && (
                                        <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-black" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {isMobile && (
                            <p className="text-center text-[10px] text-slate-600">
                                Recruiter? Sign up on desktop at chainvolio.xyz
                            </p>
                        )}

                        {error && <p className="text-[11px] text-red-400 text-center">{error}</p>}

                        <button
                            onClick={handleContinue}
                            disabled={!selectedRole || saving}
                            className={`w-full py-3.5 rounded-[18px] disabled:opacity-40 disabled:cursor-not-allowed font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                selectedRole === "recruiter"
                                    ? "bg-amber-500 hover:bg-amber-400 text-black"
                                    : selectedRole === "builder"
                                        ? "bg-indigo-500 hover:bg-indigo-400 text-white"
                                        : "bg-white/10 text-white/30"
                            }`}
                        >
                            {saving
                                ? <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                : selectedRole
                                    ? <>Continue as {selectedRole === "builder" ? "Builder" : "Recruiter"} <ChevronRight className="w-3.5 h-3.5" /></>
                                    : "Select your role to continue"
                            }
                        </button>

                        <p className="text-center text-[10px] text-slate-600">Your role determines your dashboard experience</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
