"use client";

import Link from "next/link";
import { ArrowLeft, XCircle } from "lucide-react";

export default function SubscriptionCancelPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
                    <XCircle className="w-8 h-8 text-slate-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white mb-2">No Changes Made</h1>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        You cancelled the checkout process. Your current plan has not been changed and you have not been charged.
                    </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                    <Link
                        href="/recruiter/pricing"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-bold border border-emerald-500/20 transition-colors"
                    >
                        View Plans
                    </Link>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
