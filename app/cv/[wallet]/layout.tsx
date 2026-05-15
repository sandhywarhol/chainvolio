import { Metadata } from "next";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: { wallet: string } }): Promise<Metadata> {
    const { wallet } = params;

    const { data: profile } = supabase ? await supabase
        .from('profiles')
        .select('display_name, bio')
        .eq('wallet_address', wallet)
        .maybeSingle() : { data: null };

    const name = profile?.display_name || `${wallet.slice(0, 5)}...${wallet.slice(-4)}`;
    const title = `${name} | ChainVolio Professional Identity`;
    const description = profile?.bio || "View on-chain verified work history and professional proof of work.";
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "profile",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}

export default function CVLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
