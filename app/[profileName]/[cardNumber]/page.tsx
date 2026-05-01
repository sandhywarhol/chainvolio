import { supabaseServer as supabase } from "@/lib/supabase/server";
import CVPageClient from "../../cv/[wallet]/page";
import PublicOrgPageClient from "../../org/[auth_uid]/page";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Always render fresh — prevents Full Route Cache from serving stale JS bundles
// (which would show an old CV version without recent features like score/updates).
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { profileName: string, cardNumber: string } }): Promise<Metadata> {
    if (!supabase) return {};

    const { data } = await supabase
        .from("profiles")
        .select("display_name, bio")
        .eq("card_number", Number(params.cardNumber))
        .single();

    if (!data) {
        // Try org_accounts
        const { data: orgs } = await supabase
            .from("org_accounts")
            .select("org_name, bio")
            .order("created_at", { ascending: true })
            .range(Number(params.cardNumber) - 1, Number(params.cardNumber) - 1);
        
        if (orgs && orgs.length > 0) {
            const org = orgs[0];
            const name = org.org_name || params.profileName;
            const title = `${name} | ChainVolio Professional Identity`;
            const description = org.bio || `View the cryptographically verified professional identity of ${name}.`;
            const ogImage = `https://www.chainvolio.xyz/homepage/og%20image%20for%20all.jpg?v=5`;
            return {
                title,
                description,
                openGraph: { title, description, type: "website", images: [{ url: ogImage, width: 1200, height: 630 }] },
                twitter: { card: "summary_large_image", title, description, images: [ogImage] },
            };
        }
        return {};
    }

    const name = data.display_name || params.profileName;
    const title = `${name} | ChainVolio Professional Identity`;
    const description = data.bio || `View the cryptographically verified professional identity of ${name}.`;
    const ogImage = `https://www.chainvolio.xyz/homepage/og%20image%20for%20all.jpg?v=5`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            images: [{ url: ogImage, width: 1200, height: 630, alt: `ChainVolio CV: ${name}` }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImage],
        },
    };
}

export default async function ProfileAliasPage({ params }: { params: { profileName: string, cardNumber: string } }) {
    if (!supabase) return notFound();

    const { data, error } = await supabase
        .from("profiles")
        .select("wallet_address, display_name")
        .eq("card_number", Number(params.cardNumber))
        .maybeSingle();

    let walletAddress = data?.wallet_address;

    // Resolve collision or missing entry
    if (walletAddress && data?.display_name) {
        const urlName = params.profileName.toLowerCase();
        const dbName = data.display_name.replace(/\s+/g, "-").toLowerCase();
        // If names don't match, maybe it's actually an org account with the same number
        if (dbName !== urlName) {
            const { data: orgs } = await supabase
                .from("org_accounts")
                .select("auth_uid, org_name")
                .order("created_at", { ascending: true })
                .range(Number(params.cardNumber) - 1, Number(params.cardNumber) - 1);
            if (orgs && orgs.length > 0 && orgs[0].org_name?.replace(/\s+/g, "-").toLowerCase() === urlName) {
                return <PublicOrgPageClient authUidOverride={orgs[0].auth_uid} />;
            }
        }
    }

    if (walletAddress) {
        return <CVPageClient walletAddressOverride={walletAddress} />;
    }

    // If not found in profiles, check org_accounts
    const { data: orgs } = await supabase
        .from("org_accounts")
        .select("auth_uid")
        .order("created_at", { ascending: true })
        .range(Number(params.cardNumber) - 1, Number(params.cardNumber) - 1);

    if (orgs && orgs.length > 0) {
        return <PublicOrgPageClient authUidOverride={orgs[0].auth_uid} />;
    }

    return notFound();
}
