import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ExploreTalentInner } from "@/components/explore/ExploreTalentInner";
import { fetchSiteStats } from "@/lib/siteStats";

export default async function ExploreTalentPage() {
    const initialStats = await fetchSiteStats();

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Navbar />
            <ExploreTalentInner initialStats={initialStats} />
            <Footer />
        </div>
    );
}
