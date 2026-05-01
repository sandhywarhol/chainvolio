"use client";

import { useState, useEffect, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseAuth } from "@/lib/supabase/auth";

export interface OrgAccount {
    id: string;
    auth_uid: string;
    email: string;
    org_name: string | null;
    org_type: string | null;
    account_type: string;
    wallet_address: string | null;
    onboarding_complete: boolean;
    bio: string | null;
    avatar_url: string | null;
    website: string | null;
    twitter: string | null;
    linkedin: string | null;
    discord: string | null;
    telegram: string | null;
    country: string | null;
    // Stripe subscription fields
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    subscription_status: string;       // 'free' | 'active' | 'past_due' | 'canceled' | 'trialing'
    plan_name: string;                  // 'free' | 'starter' | 'pro' | 'enterprise'
    current_period_end: string | null;
    saved_candidates_count: number;
}

export function useGoogleAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [orgAccount, setOrgAccount] = useState<OrgAccount | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrgAccount = useCallback(async (authUid: string) => {
        const res = await fetch(`/api/org-accounts?auth_uid=${authUid}`);
        if (res.ok) {
            const data = await res.json();
            setOrgAccount(data.orgAccount ?? null);
        } else {
            setOrgAccount(null);
        }
    }, []);

    useEffect(() => {
        if (!supabaseAuth) {
            setLoading(false);
            return;
        }

        supabaseAuth.auth.getSession().then(({ data }) => {
            const s = data.session ?? null;
            setSession(s);
            if (s?.user?.id) {
                fetchOrgAccount(s.user.id).finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        const { data: listener } = supabaseAuth.auth.onAuthStateChange((_event, s) => {
            setSession(s);
            if (s?.user?.id) {
                fetchOrgAccount(s.user.id);
            } else {
                setOrgAccount(null);
            }
        });

        return () => listener.subscription.unsubscribe();
    }, [fetchOrgAccount]);

    const signInWithGoogle = useCallback(async () => {
        if (!supabaseAuth) return;
        await supabaseAuth.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: { access_type: "offline", prompt: "consent" },
            },
        });
    }, []);

    const signOut = useCallback(async () => {
        if (!supabaseAuth) return;
        await supabaseAuth.auth.signOut();
        setSession(null);
        setOrgAccount(null);
    }, []);

    return {
        session,
        orgAccount,
        loading,
        isGoogleSignedIn: !!session,
        signInWithGoogle,
        signOut,
        refetchOrgAccount: () => session?.user?.id ? fetchOrgAccount(session.user.id) : Promise.resolve(),
    };
}
