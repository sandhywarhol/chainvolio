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
    org_id_number?: number;
}

const CACHE_KEY_PREFIX = "cv_orgAccount_";

function readCachedOrgAccount(uid: string): OrgAccount | null {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + uid);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function writeCachedOrgAccount(uid: string, account: OrgAccount | null) {
    try {
        if (account) sessionStorage.setItem(CACHE_KEY_PREFIX + uid, JSON.stringify(account));
        else sessionStorage.removeItem(CACHE_KEY_PREFIX + uid);
    } catch {}
}

export function useGoogleAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [orgAccount, setOrgAccount] = useState<OrgAccount | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrgAccount = useCallback(async (authUid: string, accessToken?: string) => {
        const doFetch = async (token?: string) => {
            const headers: HeadersInit = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;
            const res = await fetch(`/api/org-accounts?auth_uid=${authUid}`, { headers });
            return res;
        };

        try {
            let res = await doFetch(accessToken);

            // If token expired, refresh once and retry
            if (res.status === 401 && supabaseAuth) {
                const { data: refreshed } = await supabaseAuth.auth.refreshSession();
                if (refreshed.session) {
                    setSession(refreshed.session);
                    res = await doFetch(refreshed.session.access_token);
                }
            }

            if (res.ok) {
                const data = await res.json();
                const account = data.orgAccount ?? null;
                setOrgAccount(account);
                writeCachedOrgAccount(authUid, account);
            }
            // On any non-ok response KEEP the existing orgAccount — a transient API
            // error must not silently log the user out. Only explicit signOut clears it.
        } catch {
            // Network error — keep existing state
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
                // Restore from cache immediately so dashboard renders without waiting
                const cached = readCachedOrgAccount(s.user.id);
                if (cached) {
                    setOrgAccount(cached);
                    setLoading(false);
                    // Still refresh in background to pick up any plan/subscription changes
                    fetchOrgAccount(s.user.id, s.access_token);
                } else {
                    fetchOrgAccount(s.user.id, s.access_token).finally(() => setLoading(false));
                }
            } else {
                setLoading(false);
            }
        });

        const { data: listener } = supabaseAuth.auth.onAuthStateChange((event, s) => {
            setSession(s);
            if (s?.user?.id) {
                fetchOrgAccount(s.user.id, s.access_token);
            } else if (event === "SIGNED_OUT") {
                // Only clear orgAccount on explicit user-initiated sign out.
                // TOKEN_REFRESHED failures, USER_DELETED, etc. must not silently
                // redirect users away from what they were doing.
                setOrgAccount(null);
            }
        });

        return () => listener.subscription.unsubscribe();
    }, [fetchOrgAccount]);

    const signOut = useCallback(async () => {
        if (!supabaseAuth) return;
        const uid = session?.user?.id;
        await supabaseAuth.auth.signOut();
        setSession(null);
        setOrgAccount(null);
        if (uid) writeCachedOrgAccount(uid, null);
    }, [session]);

    const refetchOrgAccount = useCallback(async () => {
        if (!supabaseAuth) return;
        // Always get the freshest session token before refetching
        const { data: { session: fresh } } = await supabaseAuth.auth.getSession();
        const s = fresh ?? session;
        if (!s?.user?.id) return;
        if (fresh && fresh.access_token !== session?.access_token) setSession(fresh);
        return fetchOrgAccount(s.user.id, s.access_token);
    }, [session, fetchOrgAccount]);

    return {
        session,
        orgAccount,
        loading,
        isGoogleSignedIn: session?.user?.app_metadata?.provider === 'google',
        signInWithGoogle: useCallback(async () => {
            if (!supabaseAuth) return;
            const { error } = await supabaseAuth.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: { access_type: "offline", prompt: "consent" },
                },
            });
            if (error) throw error;
        }, []),
        signOut,
        refetchOrgAccount,
    };
}
