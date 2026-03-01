import { Metadata } from "next";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const { id } = params;

    const { data: attestation } = supabase ? await supabase
        .from('attestations')
        .select('attester_name, attester_org, receipt_id')
        .eq('id', id)
        .single() : { data: null };

    if (!attestation) return { title: "Verification Memo | ChainVolio" };

    const { data: receipt } = supabase ? await supabase
        .from('receipts')
        .select('role, org')
        .eq('id', attestation.receipt_id)
        .single() : { data: null };

    const title = `Verification Memo: ${receipt?.role || 'Professional'} @ ${receipt?.org || 'Organization'}`;
    const description = `This professional milestone has been verified on-chain by ${attestation.attester_name} from ${attestation.attester_org}. View the cryptographic proof.`;
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}

export default function MemoLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
