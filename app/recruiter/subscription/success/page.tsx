"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export default function SubscriptionSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { session, refetchOrgAccount } = useGoogleAuth();
    const [status, setStatus] = useState<"polling" | "active" | "timeout">("polling");
    const sessionId = searchParams.get("session_id");

    useEffect(() => {
        if (!session?.access_token) return;

        let attempts = 0;
        const maxAttempts = 10;

        const poll = async () => {
            attempts++;
            try {
                const res = await fetch("/api/recruiter/subscription", {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                const data = await res.json();
                if (data.ok && data.status === "active") {
                    await refetchOrgAccount();
                    setStatus("active");
                    return;
                }
            } catch {
                // continue polling
            }

            if (attempts >= maxAttempts) {
                setStatus("timeout");
                return;
            }
            setTimeout(poll, 1000);
        };

        // Start polling after a short delay to give webhook time to process
        setTimeout(poll, 1500);
    }, [session, refetchOrgAccount]);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
            <div className="max-w-md w-full text-center">
                {status === "polling" && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-black text-white">Activating your plan...</h1>
                        <p className="text-slate-400 text-sm">
                            Confirming your subscription with Stripe. This takes just a moment.
                        </p>
                    </div>
                )}

                {status === "active" && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white mb-2">You're all set!</h1>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Your subscription is now active. You can start using your upgraded features immediately.
                            </p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        >
                            Go to Dashboard <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {status === "timeout" && (
                    <div className="space-y-6">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white mb-2">Payment Received</h1>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Your payment was successful. Your plan will activate within a few minutes once our systems sync.
                            </p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition-colors border border-slate-600"
                        >
                            Go to Dashboard <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
