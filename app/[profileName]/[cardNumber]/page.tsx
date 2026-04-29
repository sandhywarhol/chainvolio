import { supabaseServer as supabase } from "@/lib/supabase/server";
import CVPageClient from "../../cv/[wallet]/page";
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

    if (!data) return {};

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
        .select("wallet_address")
        .eq("card_number", Number(params.cardNumber))
        .single();

    if (error || !data?.wallet_address) {
        return notFound();
    }

    return <CVPageClient walletAddressOverride={data.wallet_address} />;
}
