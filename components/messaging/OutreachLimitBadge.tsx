"use client";

interface OutreachLimitBadgeProps {
    used: number;
    limit: number | null;
    isPremium: boolean;
    resetDate?: string;
    loading?: boolean;
}

export function OutreachLimitBadge({ used, limit, isPremium, resetDate, loading }: OutreachLimitBadgeProps) {
    if (loading) {
        return <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />;
    }

    if (isPremium) {
        return (
            <span className="text-[11px] text-emerald-400/70 font-bold uppercase tracking-widest">
                Unlimited outreach · Premium
            </span>
        );
    }

    const remaining = limit !== null ? limit - used : 0;
    const atLimit = remaining <= 0;

    if (atLimit) {
        return (
            <span className="text-[11px] text-red-400/80 font-bold uppercase tracking-widest">
                Limit reached · Upgrade for unlimited
            </span>
        );
    }

    return (
        <span className="text-[11px] text-white/30 font-bold uppercase tracking-widest">
            {remaining}/{limit} outreach remaining this month
            {resetDate && <span className="text-white/20"> · Resets {new Date(resetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
        </span>
    );
}
