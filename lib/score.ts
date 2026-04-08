import { supabaseServer } from "@/lib/supabase/server";

const DOMAIN_MAP: Record<string, string[]> = {
  development: ["solidity", "rust", "typescript", "javascript", "react", "node", "smart contract", "web3", "frontend", "backend", "developer", "engineering"],
  design: ["figma", "ui/ux", "graphic design", "product design", "illustration", "css", "tailwind", "designer"],
  marketing: ["content", "social media", "growth", "marketing", "seo", "writer"],
  ops: ["project management", "community", "operations", "product management", "strategy", "manager"]
};


export async function calculateScore(wallet_address: string) {
  if (!supabaseServer) throw new Error("Supabase internal error");

  const { data: profile } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("wallet_address", wallet_address)
    .single();

  const { data: receipts } = await supabaseServer
    .from("receipts")
    .select("*")
    .eq("wallet_address", wallet_address);

  let experience = 0;
  let verification = 0;
  let consistency = 0;
  let skill = 0;
  let activity = 0;

  if (receipts && receipts.length > 0) {
    // Experience max contribution limit per project
    let expScore = 0;
    receipts.forEach((r: any) => {
      const role = (r.role || "").toLowerCase();
      // cap weight per contribution
      if (role.includes("lead") || role.includes("senior") || role.includes("founder") || role.includes("head") || role.includes("chief")) {
        expScore += 30;
      } else {
        expScore += 15;
      }
    });
    experience = Math.min(100, expScore);

    // Verification - verify against unverified vs total
    // ignore unverified contributions in weight scoring if there's manipulation, but here we just do %
    const verified = receipts.filter((r: any) => 
      r.status === "Attested" || 
      r.status === "Verified" || 
      r.status === "verified" || 
      r.attestation_type === "Hiring Proof" || 
      r.tx_signature
    ).length;
    verification = Math.round((verified / receipts.length) * 100);

    // Consistency
    let totalMonths = 0;
    receipts.forEach((r: any) => {
      if (r.start_date) {
         const start = new Date(r.start_date);
         const end = r.end_date ? new Date(r.end_date) : new Date();
         if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const m = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
            totalMonths += Math.max(1, m); 
         }
      }
    });
    consistency = Math.min(100, Math.floor(totalMonths * 4)); 

    // Activity
    const txCount = receipts.filter((r: any) => r.tx_signature).length;
    activity = Math.min(100, txCount * 25);
  }

  // Skill
  if (profile && profile.skills) {
    const skillList = profile.skills.split(",");
    skill = Math.min(100, skillList.length * 20); 
  }

  let final_score = Math.round(
    0.30 * experience +
    0.25 * verification +
    0.15 * consistency +
    0.15 * skill +
    0.15 * activity
  );

  let level = "Beginner";
  if (final_score >= 80) level = "Elite";
  else if (final_score >= 60) level = "Advanced";
  else if (final_score >= 40) level = "Intermediate";

  // --- Domain Scoring ---
  let domain_scores: Record<string, number> = {};
  if (profile && profile.skills) {
    const userSkills = profile.skills.split(",").map((s: string) => s.trim().toLowerCase());
    
    for (const [domain, keywords] of Object.entries(DOMAIN_MAP)) {
      const matchedSkills = userSkills.filter((s: string) => keywords.some(k => s.includes(k)));
      
      if (matchedSkills.length > 0) {
        let domainReceipts: any[] = [];
        if (receipts) {
          domainReceipts = receipts.filter((r: any) => {
            const roleText = (r.role || "").toLowerCase();
            const descText = (r.description || "").toLowerCase();
            return keywords.some(k => roleText.includes(k) || descText.includes(k));
          });
        }

        // Domain Experience
        let domainExpScore = 0;
        domainReceipts.forEach((r: any) => {
          const role = (r.role || "").toLowerCase();
          if (role.includes("lead") || role.includes("senior") || role.includes("founder") || role.includes("head") || role.includes("chief")) {
            domainExpScore += 30;
          } else {
            domainExpScore += 15;
          }
        });
        const domainExperience = Math.min(100, domainExpScore);

        // Domain Skill Level
        const domainSkillLevel = Math.min(100, matchedSkills.length * 25);

        // Domain Verification
        let domainVerification = verification; // fallback to general verification if no specific receipts
        if (domainReceipts.length > 0) {
          const verifiedDomain = domainReceipts.filter((r: any) => r.status === "Attested" || r.attestation_type === "Hiring Proof" || r.tx_signature).length;
          domainVerification = Math.round((verifiedDomain / domainReceipts.length) * 100);
        }

        // Domain Score Calculation
        domain_scores[domain] = Math.round(
          0.40 * domainExperience +
          0.35 * domainSkillLevel +
          0.25 * domainVerification
        );
      }
    }
  }

  // --- Verification Multiplier (Anti-Spam) ---
  const total_contributions = receipts ? receipts.length : 0;
  let verified_contributions = 0;
  let verification_ratio = 0;

  if (total_contributions > 0 && receipts) {
    // Debug: log filter criteria
    verified_contributions = receipts.filter((r: any) => 
      r.status === "Attested" || 
      r.status === "Verified" || 
      r.status === "verified" || 
      r.attestation_type === "Hiring Proof" || 
      r.tx_signature
    ).length;
    
    verification_ratio = verified_contributions / total_contributions;
  } else if (total_contributions === 0) {
    console.warn(`[scoring-debug] Wallet ${wallet_address} has 0 receipts. Confidence defaulted to 0.`);
  }

  const verification_multiplier = total_contributions === 0 ? 0.5 : 0.5 + (verification_ratio * 0.5);
  
  // Volume-weighted confidence (requires at least 5 contributions for 100% confidence potential)
  const data_factor = Math.min(total_contributions / 5, 1);
  const confidence = total_contributions === 0 ? 0 : Math.round((verification_ratio * data_factor) * 100) / 100;
  
  // Detailed debug log for troubleshooting Confidence = 0
  console.log(`[scoring-debug] Calculation for ${wallet_address}:`, {
    total_contributions,
    verified_contributions,
    verification_ratio: verification_ratio.toFixed(2),
    data_factor: data_factor.toFixed(2),
    confidence
  });

  let confidence_label = "Low";
  if (confidence >= 0.7) confidence_label = "High";
  else if (confidence >= 0.4) confidence_label = "Medium";

  const trust_score = Math.round(final_score * confidence * 10) / 10;

  final_score = Math.round(final_score * verification_multiplier);
  for (const domain in domain_scores) {
    domain_scores[domain] = Math.round(domain_scores[domain] * verification_multiplier);
  }

  // --- Calculate Last Activity & Decay ---
  let lastActivity = profile?.updated_at || profile?.created_at || new Date().toISOString();
  let latestTime = new Date(lastActivity).getTime();

  if (receipts && receipts.length > 0) {
    receipts.forEach((r: any) => {
      const rTime = new Date(r.updated_at || r.created_at).getTime();
      if (!isNaN(rTime) && rTime > latestTime) {
        latestTime = rTime;
      }
    });
  }

  const daysInactive = Math.floor((new Date().getTime() - latestTime) / (1000 * 60 * 60 * 24));
  let activity_status = "active";
  let decayFactor = 1.0;

  if (daysInactive > 180) {
    decayFactor = 0.8;
    activity_status = "dormant";
  } else if (daysInactive > 90) {
    decayFactor = 0.9;
    activity_status = "inactive";
  }

  // Apply decay
  if (decayFactor < 1.0) {
    final_score = Math.round(final_score * decayFactor);
    for (const domain in domain_scores) {
      domain_scores[domain] = Math.round(domain_scores[domain] * decayFactor);
    }
  }

  // --- Final Output & Top Domain ---
  const entries = Object.entries(domain_scores);
  const top_domain = entries.length > 0 
    ? entries.sort((a, b) => b[1] - a[1])[0][0] 
    : "general";

  // Re-calculate level (including post-decay adjustments)
  if (final_score >= 80) level = "Elite";
  else if (final_score >= 60) level = "Advanced";
  else if (final_score >= 40) level = "Intermediate";
  else level = "Beginner";

  // --- Score Reason Logic (Explainability) ---
  const reasons = [];
  if (verification >= 70) reasons.push("high verified contributions");
  if (consistency >= 70) reasons.push("consistent activity");
  if (experience >= 70) reasons.push("strong industry experience");
  if (skill >= 70) reasons.push("diverse validated skills");
  
  const reason = reasons.length > 0 
    ? "Based on " + reasons.slice(0, -1).join(", ") + (reasons.length > 1 ? " and " : "") + reasons.slice(-1)
    : "Building profile reputation";

  // Try to upsert score
  const { error } = await supabaseServer
    .from("scores")
    .upsert({
      wallet_address,
      total_score: final_score,
      experience_score: experience,
      verification_score: verification,
      consistency_score: consistency,
      skill_score: skill,
      activity_score: activity,
      level: level,
      domain_scores: domain_scores,
      top_domain: top_domain,
      activity_status: activity_status,
      confidence: confidence,
      confidence_label: confidence_label,
      trust_score: trust_score,
      reason: reason,
    }, { onConflict: "wallet_address" });
    
  if (error) {
     console.error("Score upsert failed (ignore if table missing):", error.message);
  }

  return {
    wallet: wallet_address,
    score: final_score,
    domains: domain_scores,
    top_domain,
    level,
    activity_status,
    confidence,
    confidence_label,
    trust_score,
    reason,
    breakdown: {
      experience,
      verification,
      consistency,
      skill,
      activity
    }
  };
}
