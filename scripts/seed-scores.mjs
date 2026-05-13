import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tlbxjzruyytontxwvwtl.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYnhqenJ1eXl0b250eHd2d3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE4MDc2NSwiZXhwIjoyMDg2NzU2NzY1fQ.hD84OgMGYcjKBz8PxrxgOdkTiKHaKa3CL_nZscFhpHs';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// ── Score computation (mirrors shared/logic/score.ts) ──────────────────────
function computeReputation(profile, receipts, attestationWeights) {
  if (!profile) return { score: 0, level: 'Beginner', activity_status: 'inactive' };

  const skills = (profile.skills || '').split(',').map(s => s.trim()).filter(Boolean);
  const attestedReceipts = receipts.filter(r => r.status === 'Attested');

  // Experience: based on total months worked (unique timeline)
  const intervals = receipts
    .map(r => ({ start: new Date(r.start_date || r.startDate).getTime(), end: new Date(r.end_date || r.endDate || Date.now()).getTime() }))
    .filter(i => !isNaN(i.start) && !isNaN(i.end))
    .sort((a, b) => a.start - b.start);

  let totalMs = 0;
  let merged = [];
  let cur = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i].start <= cur.end) cur.end = Math.max(cur.end, intervals[i].end);
    else { merged.push(cur); cur = intervals[i]; }
  }
  if (cur) merged.push(cur);
  merged.forEach(iv => totalMs += (iv.end - iv.start));
  const totalMonths = totalMs / (1000 * 60 * 60 * 24 * 30.44);

  // Sub-scores
  const expScore = Math.min(Math.round((totalMonths / 24) * 35), 35);

  // Verification (attestation weighted)
  let verifScore = 0;
  if (attestationWeights && attestationWeights.size > 0) {
    let totalWeight = 0;
    for (const [, w] of attestationWeights) totalWeight += w;
    verifScore = Math.min(Math.round((totalWeight / (attestationWeights.size * 30)) * 30), 30);
  } else {
    verifScore = Math.min(attestedReceipts.length * 5, 20);
  }

  // Skills
  const skillScore = Math.min(skills.length * 2, 15);

  // Consistency (profile completeness)
  let consistScore = 0;
  if (profile.bio) consistScore += 5;
  if (profile.avatar_url) consistScore += 5;
  if (skills.length > 0) consistScore += 5;
  const hasSocial = !!(profile.twitter || profile.github || profile.linkedin || profile.email || profile.website || profile.telegram);
  if (hasSocial) consistScore += 5;

  // Activity
  const activityScore = Math.min(receipts.length * 2, 10);

  const total = Math.min(expScore + verifScore + skillScore + consistScore + activityScore, 100);

  const level = total >= 85 ? 'Elite' : total >= 70 ? 'Expert' : total >= 55 ? 'Advanced' : total >= 35 ? 'Intermediate' : total >= 15 ? 'Novice' : 'Beginner';
  const activity_status = receipts.length > 0 ? 'active' : 'inactive';

  return { score: total, level, activity_status, breakdown: { experience: expScore, verification: verifScore, skill: skillScore, consistency: consistScore, activity: activityScore } };
}

async function run() {
  // 1. Get all wallets with receipts
  const { data: receipts } = await supabase.from('receipts').select('*');
  const wallets = [...new Set(receipts.map(r => r.wallet_address))];
  console.log(`Found ${wallets.length} wallets with receipts`);

  // 2. Get profiles
  const { data: profiles } = await supabase.from('profiles').select('*').in('wallet_address', wallets);
  const profileMap = new Map(profiles.map(p => [p.wallet_address, p]));

  // 3. Get attestations with verifier tiers
  const receiptIds = receipts.map(r => r.id);
  const { data: attestations } = await supabase.from('attestations').select('receipt_id, attester_wallet').in('receipt_id', receiptIds);
  const attesterWallets = [...new Set((attestations || []).map(a => a.attester_wallet))];

  let attesterTierMap = new Map();
  if (attesterWallets.length > 0) {
    const { data: verifs } = await supabase.from('organization_verifications').select('wallet_address, type, status, expires_at').in('wallet_address', attesterWallets);
    const now = Date.now();
    for (const v of (verifs || [])) {
      const active = v.status === 'verified' && (!v.expires_at || new Date(v.expires_at).getTime() > now);
      attesterTierMap.set(v.wallet_address, active ? v.type : 'unverified');
    }
  }

  // Group receipts and compute attestation weights per wallet
  const receiptMap = {};
  for (const r of receipts) {
    if (!receiptMap[r.wallet_address]) receiptMap[r.wallet_address] = [];
    receiptMap[r.wallet_address].push(r);
  }

  const attestByReceipt = new Map();
  for (const a of (attestations || [])) {
    if (!attestByReceipt.has(a.receipt_id)) attestByReceipt.set(a.receipt_id, []);
    attestByReceipt.get(a.receipt_id).push(a);
  }

  // 4. Compute and upsert
  for (const wallet of wallets) {
    const profile = profileMap.get(wallet);
    const wReceipts = receiptMap[wallet] || [];

    const attestationWeights = new Map();
    for (const r of wReceipts) {
      const rattests = attestByReceipt.get(r.id) || [];
      for (const a of rattests) {
        const tier = (attesterTierMap.get(a.attester_wallet) || 'unverified').toLowerCase();
        let weight = 12;
        if (tier.includes('company') || tier.includes('org')) weight = 30;
        else if (tier.includes('community') || tier.includes('dao')) weight = 25;
        else if (tier.includes('figure') || tier.includes('public')) weight = 22;
        else if (tier.includes('builder')) weight = 20;
        attestationWeights.set(a.receipt_id, weight);
      }
    }

    const result = computeReputation(profile, wReceipts, attestationWeights.size > 0 ? attestationWeights : undefined);

    const { error } = await supabase.from('scores').upsert({
      wallet_address: wallet,
      total_score: result.score,
      level: result.level,
      activity_status: result.activity_status,
      experience_score: result.breakdown.experience,
      verification_score: result.breakdown.verification,
      skill_score: result.breakdown.skill,
      consistency_score: result.breakdown.consistency,
      activity_score: result.breakdown.activity,
    }, { onConflict: 'wallet_address' });

    const name = profile?.display_name || wallet.slice(0, 8);
    console.log(`${name.padEnd(25)} → ${result.score} (${result.level}) | Error: ${error?.message || 'none'}`);
  }

  // 5. Verify
  const { data: final } = await supabase.from('scores').select('wallet_address, total_score, level').order('total_score', { ascending: false });
  console.log(`\n✓ Final DB state: ${final.length} scores`);
  for (const s of final) {
    const name = profileMap.get(s.wallet_address)?.display_name || s.wallet_address.slice(0, 8);
    console.log(`  ${name.padEnd(25)} ${s.total_score} (${s.level})`);
  }
}

run().catch(console.error);
