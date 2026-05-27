import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ── Palette ────────────────────────────────────────────────────────────────────
const C = {
    indigo:   [79,  70,  229] as [number,number,number],
    emerald:  [16,  185, 129] as [number,number,number],
    amber:    [217, 119, 6]   as [number,number,number],
    red:      [220, 38,  38]  as [number,number,number],
    slate:    [51,  65,  85]  as [number,number,number],
    dark:     [15,  23,  42]  as [number,number,number],
    muted:    [71,  85,  105] as [number,number,number],
    light:    [226, 232, 240] as [number,number,number],
    white:    [255, 255, 255] as [number,number,number],
    black:    [8,   8,   12]  as [number,number,number],
    surface:  [245, 247, 250] as [number,number,number],
    coverBg:  [10,  10,  16]  as [number,number,number],
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function rgb(doc: jsPDF, color: [number,number,number], target: "fill"|"draw"|"text") {
    if (target === "fill")  doc.setFillColor(...color);
    if (target === "draw")  doc.setDrawColor(...color);
    if (target === "text")  doc.setTextColor(...color);
}

function needsPage(doc: jsPDF, y: number, needed = 50): number {
    if (y + needed > 272) { doc.addPage(); return 22; }
    return y;
}

function sectionHeader(doc: jsPDF, title: string, y: number): number {
    // Left accent bar
    rgb(doc, C.indigo, "fill");
    doc.rect(15, y - 3.5, 3, 10, "F");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    rgb(doc, C.dark, "text");
    doc.text(title, 21, y + 3.5);

    rgb(doc, C.light, "draw");
    doc.setLineWidth(0.3);
    doc.line(15, y + 8, 195, y + 8);
    return y + 16;
}

function scoreColor(score: number): [number,number,number] {
    if (score >= 70) return C.emerald;
    if (score >= 30) return C.amber;
    return C.red;
}

// ── Logo loader ────────────────────────────────────────────────────────────────
async function loadLogoBase64(): Promise<string | null> {
    try {
        const res = await fetch("/chainvolio%20logo.png");
        if (!res.ok) return null;
        const blob = await res.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

// ── Main export ────────────────────────────────────────────────────────────────
export const generateHiringReport = async (data: { collection: any; candidates: any[] }) => {
    const { collection, candidates } = data;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const logo = await loadLogoBase64();

    const sorted = [...candidates].sort((a, b) => (b.signalScore || 0) - (a.signalScore || 0));

    // ─────────────────────────────────────────────────────────────────────────
    // COVER
    // ─────────────────────────────────────────────────────────────────────────
    const COVER_H = 78;
    rgb(doc, C.coverBg, "fill");
    doc.rect(0, 0, 210, COVER_H, "F");

    // Top rule: thin indigo stripe
    rgb(doc, C.indigo, "fill");
    doc.rect(0, 0, 210, 1.5, "F");

    // Logo + brand (top-left)
    let brandX = 16;
    if (logo) {
        doc.addImage(logo, "PNG", 16, 12, 9, 9);
        brandX = 28;
    }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    rgb(doc, C.white, "text");
    doc.text("CHAINVOLIO", brandX, 18.5);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    rgb(doc, C.indigo, "text");
    doc.text("SECURE", brandX + 37, 18.5);

    // Main title
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    rgb(doc, C.white, "text");
    doc.text("HIRING INTELLIGENCE", 105, 38, { align: "center" });
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 185, 210);
    doc.text("REPORT", 105, 49, { align: "center" });

    // Thin divider
    rgb(doc, C.indigo, "draw");
    doc.setLineWidth(0.8);
    doc.line(82, 54, 128, 54);

    // Collection + date block
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    rgb(doc, C.white, "text");
    doc.text(collection.title, 105, 63, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(140, 148, 175);
    const roleLine = [
        collection.metadata?.roleType,
        dateStr,
    ].filter(Boolean).join("  ·  ");
    doc.text(roleLine, 105, 71, { align: "center" });

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 1: EXECUTIVE SUMMARY
    // ─────────────────────────────────────────────────────────────────────────
    let y = COVER_H + 14;
    y = sectionHeader(doc, "1. EXECUTIVE SUMMARY", y);

    // Stats
    const verifiedCount   = candidates.filter(c => c.isVerified).length;
    const avgScoreValue   = candidates.reduce((a,c) => a + (c.signalScore||0), 0) / (candidates.length||1);
    const avgYoe          = (candidates.reduce((a,c) => a + (c.yearsOfExperience||0), 0) / (candidates.length||1)).toFixed(1);
    const signalDensity   = (candidates.reduce((a,c) => a + (c.powCount||0), 0) / (candidates.length||1)).toFixed(1);
    const networkBreadth  = new Set(candidates.flatMap(c => c.attestedOrgs)).size;
    const authorityRatePct = candidates.length ? ((candidates.filter(c => c.attestedCount > 0).length / candidates.length) * 100) : 0;
    const totalAttested   = candidates.reduce((a,c) => a + (c.attestedCount||0), 0);
    const totalProofs     = candidates.reduce((a,c) => a + (c.powCount||0), 0);
    const shortlistReady  = candidates.filter(c => (c.signalScore||0) >= 70 && c.isVerified).length;

    autoTable(doc, {
        startY: y,
        body: [
            ["Total Applicants",   String(candidates.length),      "Avg. Signal Score",    `${avgScoreValue.toFixed(1)} / 100`],
            ["Verified Candidates",`${verifiedCount}`,             "Avg. Years Experience",`${avgYoe} yrs`],
            ["Authority Rate",     `${authorityRatePct.toFixed(0)}%`, "Total Proof Records",`${totalProofs}`],
            ["Total Attestations", String(totalAttested),          "Network Breadth",      `${networkBreadth} partner orgs`],
            ["Signal Density",     `${signalDensity} avg. proofs`, "Shortlist Ready",      `${shortlistReady} candidates`],
        ],
        theme: "grid",
        styles: { fontSize: 8.5, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: "bold", cellWidth: 52, fillColor: C.surface, textColor: C.slate },
            1: { cellWidth: 32, textColor: C.dark },
            2: { fontStyle: "bold", cellWidth: 52, fillColor: C.surface, textColor: C.slate },
            3: { cellWidth: 32, textColor: C.dark },
        },
        margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // Insights
    const insights: string[] = [];
    if (verifiedCount === candidates.length && candidates.length > 0)
        insights.push("All candidates are verified — this is an exceptionally strong applicant pool.");
    else if (verifiedCount > 0)
        insights.push(`${verifiedCount} of ${candidates.length} candidates hold verified status, providing a solid trust baseline.`);
    if (avgScoreValue > 60)
        insights.push("Signal strength is above average with strong on-chain proof density.");
    if (authorityRatePct > 50)
        insights.push(`${authorityRatePct.toFixed(0)}% of candidates have at least one third-party attested proof record.`);
    if (parseFloat(avgYoe) >= 3)
        insights.push(`Candidates average ${avgYoe} years of professional experience — a senior-leaning pool.`);

    if (insights.length > 0) {
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "italic");
        rgb(doc, C.muted, "text");
        insights.forEach(ins => {
            y = needsPage(doc, y, 8);
            doc.text(`•  ${ins}`, 18, y);
            y += 6;
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 2: SHORTLIST
    // ─────────────────────────────────────────────────────────────────────────
    y = needsPage(doc, y, 70);
    y += 4;
    y = sectionHeader(doc, "2. SHORTLIST — TOP CANDIDATES", y);

    const top5 = sorted.slice(0, 5);
    autoTable(doc, {
        startY: y,
        head: [["#", "Candidate", "YOE", "Tier", "Score", "Att./Total", "Action"]],
        body: top5.map((c, i) => {
            let action = "Screening";
            if (c.signalScore >= 75 && c.isVerified)  action = "Interview";
            else if (c.signalScore < 30)               action = "Monitor";
            else if (c.isVerified)                     action = "Interview";
            else if (c.powCount > 8)                   action = "Screening";
            return [
                String(i + 1),
                c.displayName || (c.wallet.slice(0,10) + "..."),
                c.yearsOfExperience > 0 ? `${c.yearsOfExperience} yrs` : "—",
                c.verificationTier !== "unverified" ? c.verificationTier : "None",
                `${c.signalScore}/100`,
                `${c.attestedCount}/${c.powCount}`,
                action,
            ];
        }),
        theme: "striped",
        headStyles: { fillColor: C.emerald, fontSize: 8, textColor: C.white, fontStyle: "bold" },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 9 },
            1: { cellWidth: 48, fontStyle: "bold" },
            2: { cellWidth: 18 },
            3: { cellWidth: 32 },
            4: { cellWidth: 20 },
            5: { cellWidth: 22 },
            6: { cellWidth: 28, fontStyle: "bold" },
        },
        didParseCell: (data) => {
            if (data.section === "body" && data.column.index === 4) {
                const sc = parseInt((data.cell.raw as string).split("/")[0]);
                data.cell.styles.textColor = scoreColor(sc);
            }
            if (data.section === "body" && data.column.index === 6) {
                const v = data.cell.raw as string;
                data.cell.styles.textColor =
                    v === "Interview" ? C.emerald :
                    v === "Monitor"   ? C.muted   : C.amber;
            }
        },
        margin: { left: 15, right: 15 },
    });

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 3: FULL CANDIDATE BREAKDOWN
    // ─────────────────────────────────────────────────────────────────────────
    y = (doc as any).lastAutoTable.finalY + 16;
    y = needsPage(doc, y, 70);
    y = sectionHeader(doc, "3. FULL CANDIDATE BREAKDOWN", y);

    autoTable(doc, {
        startY: y,
        head: [["Name", "YOE", "Score", "Tier", "Proofs", "Att.", "Ratio", "Status"]],
        body: sorted.map(c => {
            const ratio = c.powCount > 0 ? `${((c.attestedCount/c.powCount)*100).toFixed(0)}%` : "0%";
            return [
                c.displayName || "Anonymous",
                c.yearsOfExperience > 0 ? `${c.yearsOfExperience}` : "—",
                `${c.signalScore}/100`,
                c.verificationTier !== "unverified" ? c.verificationTier : "—",
                String(c.powCount),
                String(c.attestedCount),
                ratio,
                c.recruiterStatus || "Applied",
            ];
        }),
        theme: "grid",
        headStyles: { fillColor: C.slate, fontSize: 8, textColor: C.white },
        styles: { fontSize: 8, cellPadding: 2.5 },
        columnStyles: {
            0: { cellWidth: 44, fontStyle: "bold" },
            1: { cellWidth: 14 },
            2: { cellWidth: 22 },
            3: { cellWidth: 34 },
            4: { cellWidth: 14 },
            5: { cellWidth: 12 },
            6: { cellWidth: 16 },
            7: { cellWidth: 24 },
        },
        didParseCell: (data) => {
            if (data.section === "body" && data.column.index === 2) {
                const sc = parseInt((data.cell.raw as string).split("/")[0]);
                data.cell.styles.textColor = scoreColor(sc);
                data.cell.styles.fontStyle = "bold";
            }
        },
        margin: { left: 15, right: 15 },
    });

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 4: SIGNAL ANALYSIS
    // ─────────────────────────────────────────────────────────────────────────
    y = (doc as any).lastAutoTable.finalY + 16;
    y = needsPage(doc, y, 55);
    y = sectionHeader(doc, "4. SIGNAL ANALYSIS", y);

    const highConfCount = candidates.filter(c => (c.signalScore||0) >= 70).length;
    const avgAttRatio   = candidates.length
        ? (candidates.reduce((a,c) => a + (c.powCount > 0 ? c.attestedCount/c.powCount : 0), 0) / candidates.length * 100).toFixed(1)
        : "0.0";
    const topPerformer     = sorted[0];
    const mostExperienced  = [...candidates].sort((a,b) => (b.yearsOfExperience||0) - (a.yearsOfExperience||0))[0];
    const mostAttested     = [...candidates].sort((a,b) => (b.attestedCount||0) - (a.attestedCount||0))[0];

    autoTable(doc, {
        startY: y,
        body: [
            ["High Confidence Candidates (score 70+)",
                highConfCount.toString()],
            ["Average Attestation Ratio",
                `${avgAttRatio}%`],
            ["Top Signal Scorer",
                `${topPerformer?.displayName || topPerformer?.wallet?.slice(0,10) || "None"} — ${topPerformer?.signalScore || 0}/100`],
            ["Most Experienced Candidate",
                `${mostExperienced?.displayName || mostExperienced?.wallet?.slice(0,10) || "None"} — ${mostExperienced?.yearsOfExperience || 0} yrs`],
            ["Most Attested Proof Records",
                `${mostAttested?.displayName || "None"} — ${mostAttested?.attestedCount || 0} records`],
        ],
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: "bold", cellWidth: 95, textColor: C.slate },
            1: { textColor: C.dark },
        },
        margin: { left: 18, right: 15 },
    });

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 5: INTERNAL PROCESS LOG
    // ─────────────────────────────────────────────────────────────────────────
    y = (doc as any).lastAutoTable.finalY + 16;
    y = needsPage(doc, y, 55);
    y = sectionHeader(doc, "5. INTERNAL PROCESS LOG", y);

    autoTable(doc, {
        startY: y,
        head: [["Wallet Ref", "Status", "Recruiter Notes", "Submitted"]],
        body: sorted.map(c => [
            c.wallet.slice(0, 8) + "...",
            c.recruiterStatus || "Applied",
            c.recruiterNotes  || "—",
            new Date(c.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        ]),
        theme: "striped",
        headStyles: { fillColor: C.dark, fontSize: 8, textColor: C.white },
        styles: { fontSize: 8, cellPadding: 2.5 },
        columnStyles: {
            0: { cellWidth: 28 },
            1: { cellWidth: 24 },
            2: { cellWidth: 100 },
            3: { cellWidth: 28 },
        },
        margin: { left: 15, right: 15 },
    });

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 6: DETAILED CANDIDATE PROFILES
    // ─────────────────────────────────────────────────────────────────────────
    doc.addPage();
    y = 22;
    y = sectionHeader(doc, "6. DETAILED CANDIDATE PROFILES", y);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "italic");
    rgb(doc, C.muted, "text");
    doc.text("Proof-of-work records captured at application time, with live attestation status and years of experience.", 15, y);
    y += 12;

    sorted.forEach((c, idx) => {
        // Estimate space needed for this candidate's profile
        const expList: any[] = c.workHistory || [];
        const hasBio    = !!c.snapshotBio;
        const hasSkills = !!c.snapshotSkills;
        const estHeight = 30 + (hasBio ? 16 : 0) + (hasSkills ? 12 : 0) + (expList.length > 0 ? expList.length * 8 + 16 : 12);
        y = needsPage(doc, y, Math.min(estHeight, 80));

        // ── Candidate header card ──
        const cardTop = y;
        rgb(doc, C.surface, "fill");
        doc.roundedRect(15, cardTop, 180, 13, 2, 2, "F");

        // Left accent bar inside card
        rgb(doc, C.indigo, "fill");
        doc.roundedRect(15, cardTop, 3, 13, 1, 1, "F");

        // Candidate number + name
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        rgb(doc, C.dark, "text");
        const nameStr = `${idx + 1}.  ${c.displayName || c.wallet.slice(0, 14) + "..."}`;
        doc.text(nameStr, 22, cardTop + 9);

        // Score badge (right side of card)
        const sc: number = c.signalScore || 0;
        const scColor = scoreColor(sc);
        rgb(doc, scColor, "fill");
        doc.roundedRect(167, cardTop + 2, 26, 9, 2, 2, "F");
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        rgb(doc, C.white, "text");
        doc.text(`${sc} / 100`, 180, cardTop + 8, { align: "center" });

        y = cardTop + 18;

        // ── 4-column meta row ──
        const yoeStr  = c.yearsOfExperience > 0 ? `${c.yearsOfExperience} yrs experience` : "Experience unknown";
        const tierStr = c.verificationTier !== "unverified" ? `Tier: ${c.verificationTier}` : "Tier: —";
        const verStr  = c.isVerified ? "Verified" : "Unverified";
        const prfStr  = `${c.powCount} proofs  (${c.attestedCount} attested)`;

        autoTable(doc, {
            startY: y,
            body: [[yoeStr, tierStr, verStr, prfStr]],
            theme: "plain",
            styles: { fontSize: 8.5, cellPadding: [1, 4, 1, 0], textColor: C.muted },
            columnStyles: {
                0: { cellWidth: 48, fontStyle: "bold", textColor: C.slate },
                1: { cellWidth: 46 },
                2: { cellWidth: 36, textColor: c.isVerified ? C.emerald : C.muted, fontStyle: c.isVerified ? "bold" : "normal" },
                3: { cellWidth: 50 },
            },
            margin: { left: 18, right: 15 },
        });
        y = (doc as any).lastAutoTable.finalY + 2;

        // Wallet address (small, muted)
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(160, 165, 180);
        doc.text(`Wallet: ${c.wallet}`, 18, y);
        y += 5;

        // Primary signal / role
        if (c.primarySignal || c.role) {
            doc.setFontSize(8);
            rgb(doc, C.muted, "text");
            const sig = [c.role, c.primarySignal].filter(Boolean).join("  ·  ");
            doc.text(sig.length > 100 ? sig.slice(0, 97) + "..." : sig, 18, y);
            y += 5;
        }

        // ── Bio ──
        if (c.snapshotBio) {
            y = needsPage(doc, y, 20);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            rgb(doc, C.slate, "text");
            doc.text("Bio", 18, y);
            y += 4;
            doc.setFont("helvetica", "normal");
            rgb(doc, C.muted, "text");
            const lines = doc.splitTextToSize(c.snapshotBio, 172);
            const shown = lines.slice(0, 4);
            doc.text(shown, 18, y);
            y += shown.length * 4.5 + 5;
        }

        // ── Skills ──
        if (c.snapshotSkills) {
            y = needsPage(doc, y, 14);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            rgb(doc, C.slate, "text");
            doc.text("Skills", 18, y);
            y += 4;
            doc.setFont("helvetica", "normal");
            rgb(doc, C.muted, "text");
            const sk = c.snapshotSkills.length > 190 ? c.snapshotSkills.slice(0, 187) + "..." : c.snapshotSkills;
            doc.text(doc.splitTextToSize(sk, 172).slice(0, 2), 18, y);
            y += 10;
        }

        // ── Work History ──
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        rgb(doc, C.slate, "text");
        doc.text(`Work History  (${expList.length} record${expList.length !== 1 ? "s" : ""})`, 18, y);
        y += 3;

        if (expList.length > 0) {
            y = needsPage(doc, y, 20);
            const expRows = expList.map((e: any) => {
                const start = e.start_date
                    ? new Date(e.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : "—";
                const end = e.end_date
                    ? new Date(e.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : "Present";
                const durMs  = (e.end_date ? new Date(e.end_date).getTime() : Date.now())
                             - (e.start_date ? new Date(e.start_date).getTime() : Date.now());
                const durYr  = durMs > 0 ? `${(durMs / (1000 * 60 * 60 * 24 * 365)).toFixed(1)} yr` : "—";
                const status = e.isAttested ? "Attested" : "Self-declared";
                return [e.role || "—", e.org || "—", `${start} - ${end}`, durYr, status];
            });

            autoTable(doc, {
                startY: y,
                head: [["Role", "Organization", "Period", "Duration", "Status"]],
                body: expRows,
                theme: "striped",
                headStyles: { fillColor: C.slate, fontSize: 7.5, textColor: C.white },
                styles: { fontSize: 7.5, cellPadding: 2.5 },
                columnStyles: {
                    0: { cellWidth: 52 },
                    1: { cellWidth: 50 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 16 },
                    4: { cellWidth: 22 },
                },
                didParseCell: (data) => {
                    if (data.section === "body" && data.column.index === 4) {
                        const v = data.cell.raw as string;
                        data.cell.styles.textColor  = v === "Attested" ? C.emerald : C.muted;
                        data.cell.styles.fontStyle  = v === "Attested" ? "bold" : "normal";
                    }
                },
                margin: { left: 18, right: 15 },
            });
            y = (doc as any).lastAutoTable.finalY + 6;
        } else {
            doc.setFontSize(8);
            doc.setFont("helvetica", "italic");
            rgb(doc, C.muted, "text");
            doc.text("No work history recorded at application time.", 18, y + 4);
            y += 12;
        }

        // ── Attested orgs ──
        if (c.attestedOrgs && c.attestedOrgs.length > 0) {
            y = needsPage(doc, y, 12);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            rgb(doc, C.slate, "text");
            doc.text("Attested by:", 18, y);
            doc.setFont("helvetica", "normal");
            rgb(doc, C.emerald, "text");
            const orgStr = c.attestedOrgs.join("  ·  ");
            doc.text(orgStr.length > 165 ? orgStr.slice(0, 162) + "..." : orgStr, 18, y + 5);
            y += 13;
        }

        // ── Recruiter notes ──
        if (c.recruiterNotes) {
            y = needsPage(doc, y, 14);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            rgb(doc, C.slate, "text");
            doc.text("Recruiter notes:", 18, y);
            y += 4;
            doc.setFont("helvetica", "italic");
            rgb(doc, C.muted, "text");
            const nl = doc.splitTextToSize(c.recruiterNotes, 172);
            doc.text(nl.slice(0, 3), 18, y);
            y += Math.min(nl.length, 3) * 4.5 + 4;
        }

        // Divider
        y = needsPage(doc, y, 10);
        rgb(doc, C.light, "draw");
        doc.setLineWidth(0.25);
        doc.line(15, y, 195, y);
        y += 10;
    });

    // ─────────────────────────────────────────────────────────────────────────
    // FOOTER — every page
    // ─────────────────────────────────────────────────────────────────────────
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Rule
        rgb(doc, C.light, "draw");
        doc.setLineWidth(0.25);
        doc.line(15, 281, 195, 281);

        // Left — logo mark + brand
        if (logo) doc.addImage(logo, "PNG", 15, 284, 5, 5);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        rgb(doc, C.muted, "text");
        doc.text("ChainVolio", logo ? 22 : 15, 288);

        // Center — short disclaimer
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(175, 178, 190);
        doc.text(
            "Cryptographically verified on-chain data · All proof records are independently attestable",
            105, 288,
            { align: "center" }
        );

        // Right — page number
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        rgb(doc, C.muted, "text");
        doc.text(`${i} / ${pageCount}`, 195, 288, { align: "right" });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SAVE
    // ─────────────────────────────────────────────────────────────────────────
    const fileName = `ChainVolio_Report_${collection.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
};
