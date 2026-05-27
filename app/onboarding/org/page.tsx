"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

const ORG_TYPES = [
    { value: "community", label: "Community / DAO", description: "Open communities, DAOs, or non-profit organizations" },
    { value: "company", label: "Company / Agency", description: "Businesses, recruitment agencies, or commercial organizations" },
];

function OrgOnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEdit = searchParams.get("edit") === "1";
    const { session, orgAccount, loading, refetchOrgAccount } = useGoogleAuth();
    const [orgName, setOrgName] = useState("");
    const [orgType, setOrgType] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !session) {
            router.replace("/");
        }
    }, [loading, session, router]);

    useEffect(() => {
        if (orgAccount?.onboarding_complete && !isEdit) {
            router.replace("/dashboard");
        }
        if (orgAccount?.org_name) setOrgName(orgAccount.org_name);
        if (orgAccount?.org_type) setOrgType(orgAccount.org_type);
    }, [orgAccount, router, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgName.trim() || !orgType || !session) return;

        setSaving(true);
        setError(null);

        const res = await fetch("/api/org-accounts", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                auth_uid: session.user.id,
                email: session.user.email ?? "",
                org_name: orgName.trim(),
                org_type: orgType,
            }),
        });

        if (!res.ok) {
            const json = await res.json();
            setError(json.error ?? "Something went wrong. Please try again.");
            setSaving(false);
            return;
        }

        await refetchOrgAccount();
        router.replace("/dashboard");
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-black theme-bg-page theme-aware">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-black theme-bg-page theme-aware">
            <div className="w-full max-w-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {isEdit ? "Edit organization profile" : "Set up your organization"}
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {isEdit ? "Update your organization details." : "Tell us about your organization so we can tailor your experience."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Org name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-300">Organization name</label>
                        <input
                            type="text"
                            value={orgName}
                            onChange={e => setOrgName(e.target.value)}
                            placeholder="e.g. Solana Foundation"
                            required
                            className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    {/* Org type */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-300">Organization type</label>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {ORG_TYPES.map(t => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setOrgType(t.value)}
                                    className={`text-left px-4 py-4 rounded-lg border transition-colors ${
                                        orgType === t.value
                                            ? "border-emerald-500 bg-emerald-500/10 text-white"
                                            : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500"
                                    }`}
                                >
                                    <div className="font-medium text-sm">{t.label}</div>
                                    <div className="text-xs text-slate-400 mt-1">{t.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm px-1">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={!orgName.trim() || !orgType || saving}
                        className="mt-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
                    >
                        {saving ? "Saving..." : isEdit ? "Save changes" : "Continue to dashboard"}
                    </button>
                </form>
            </div>
        </main>
    );
}

export default function OrgOnboardingPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center bg-black theme-bg-page theme-aware">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </main>
        }>
            <OrgOnboardingContent />
        </Suspense>
    );
}
