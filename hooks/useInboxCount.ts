"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export function useInboxCount(): number {
    const { publicKey } = useWallet();
    const { session, isGoogleSignedIn } = useGoogleAuth();
    const [count, setCount] = useState(0);

    const wallet = publicKey?.toBase58();

    const fetchCount = useCallback(async () => {
        if (!wallet && !isGoogleSignedIn) {
            setCount(0);
            return;
        }

        try {
            if (wallet) {
                const [candidateRes, recruiterRes] = await Promise.all([
                    fetch(`/api/messaging/conversations?role=candidate&wallet=${wallet}`),
                    fetch(`/api/messaging/conversations?role=recruiter&wallet=${wallet}`),
                ]);
                const [candidateData, recruiterData] = await Promise.all([
                    candidateRes.json(),
                    recruiterRes.json(),
                ]);

                const candidateConvs: any[] = candidateData.ok ? candidateData.data : [];
                const recruiterConvs: any[] = recruiterData.ok ? recruiterData.data : [];

                const pending = candidateConvs.filter((c) => c.status === "pending").length;
                const candidateUnread = candidateConvs.reduce((s, c) => s + (c.unreadCount || 0), 0);
                const recruiterUnread = recruiterConvs.reduce((s, c) => s + (c.unreadCount || 0), 0);

                setCount(pending + candidateUnread + recruiterUnread);
            } else if (isGoogleSignedIn && session?.access_token) {
                const res = await fetch(`/api/messaging/conversations?role=recruiter`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                const data = await res.json();
                const convs: any[] = data.ok ? data.data : [];
                const unread = convs.reduce((s: number, c: any) => s + (c.unreadCount || 0), 0);
                setCount(unread);
            }
        } catch {
            // silent — badge just stays at current value
        }
    }, [wallet, isGoogleSignedIn, session?.access_token]);

    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 30_000);
        return () => clearInterval(interval);
    }, [fetchCount]);

    return count;
}
