import { supabaseServer as supabase } from "@/lib/supabase/server";
import CVPageClient from "../../cv/[wallet]/page";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { profileName: string, cardNumber: string } }) {
    if (!supabase) return {};

    const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("card_number", params.cardNumber)
        .single();

    if (!data) return {};

    return {
        title: `${data.display_name} | ChainVolio Proof of Work`,
        description: `View the cryptographically verified professional identity of ${data.display_name}.`
    };
}

export default async function ProfileAliasPage({ params }: { params: { profileName: string, cardNumber: string } }) {
    if (!supabase) return notFound();

    const { data, error } = await supabase
        .from("profiles")
        .select("wallet_address")
        .eq("card_number", params.cardNumber)
        .single();

    if (error || !data) {
        return notFound();
    }

    // Notice we pass the raw string and CVPageClient will use it instead of the missing URL param!
    return <CVPageClient walletAddressOverride={data.wallet_address} />;
}
