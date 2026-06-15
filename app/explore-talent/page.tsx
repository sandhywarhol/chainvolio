import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ExploreTalentInner } from "@/components/explore/ExploreTalentInner";
import { fetchSiteStats } from "@/lib/siteStats";

export default async function ExploreTalentPage() {
    const initialStats = await fetchSiteStats();

    return (
        <div className="min-h-screen bg-[#111111] md:bg-[#050505] text-white">
            <div className="hidden md:block"><Navbar /></div>
            <ExploreTalentInner initialStats={initialStats} />
            <div className="hidden md:block"><Footer /></div>
        </div>
    );
}
