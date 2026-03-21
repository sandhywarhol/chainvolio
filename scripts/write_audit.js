require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  try {
    const { data: wallets } = await supabase.from('wallets').select('*');
    const { data: profiles } = await supabase.from('profiles').select('*').order('card_number', { ascending: true });
    const { data: verifications } = await supabase.from('organization_verifications').select('*');

    const activeProfiles = [];
    const incompleteProfiles = [];
    const testUsers = [];
    
    const verifMap = new Map();
    for (let v of verifications) {
      verifMap.set(v.wallet_address, v);
    }
    
    const profileMap = new Map();
    for (let p of profiles) {
      profileMap.set(p.wallet_address, p);
    }
    
    const structuredUsers = wallets.map(wallet => {
      const p = profileMap.get(wallet.wallet_address);
      const v = verifMap.get(wallet.wallet_address);
      
      const isTest = p ? p.is_test : false;
      
      const userObj = {
        wallet_address: wallet.wallet_address,
        cv_id: p ? p.card_number : null,
        display_name: p ? p.display_name : null,
        current_role: p ? p.professional_role : null,
        verificationTier: v ? v.type : null,
        isVerified: (v && v.status === 'verified') ? true : false,
        profile_completed: p ? true : false,
        is_test: isTest,
        created_at: wallet.created_at
      };
      
      if (isTest) testUsers.push(userObj);
      else if (!p) incompleteProfiles.push(userObj);
      else activeProfiles.push(userObj);
      
      return userObj;
    });

    const cvIdMapping = structuredUsers.filter(u => u.cv_id !== null).sort((a,b) => a.cv_id - b.cv_id);

    // Markdown Generation
    let md = `# ChainVolio User & CV ID Audit Report\n\n`;
    md += `## 1. Summary Statistics\n`;
    md += `- **Total Connections (Wallets):** ${wallets.length}\n`;
    md += `- **Total CV IDs Assigned:** ${profiles.filter(p => p.card_number).length}\n`;
    md += `- **Total Active Profiles (Completed):** ${activeProfiles.length}\n`;
    md += `- **Total Incomplete Profiles (Wallet Only):** ${incompleteProfiles.length}\n`;
    md += `- **Total Test Users Flagged:** ${testUsers.length}\n\n`;

    md += `## 2. Categorization Breakdown\n`;
    md += `### A. Active Profiles (${activeProfiles.length})\n`;
    md += `Users who connected a wallet and successfully completed onboarding.\n\n`;
    md += `### B. Incomplete Profiles (${incompleteProfiles.length})\n`;
    md += `Users who connected a wallet but abandoned before finishing their profile.\n\n`;
    md += `### C. Test Users (${testUsers.length})\n`;
    md += `Users flagged as 'is_test' (Currently zero, as expected if you just executed the SAFE_DELETE).\n\n`;

    md += `## 3. CV ID Mapping & Full User Roster\n`;
    md += `| CV ID | Display Name | Wallet Address | Role | Verified | Tier | Profile Status |\n`;
    md += `|---|---|---|---|---|---|---|\n`;

    // Active profiles with CV IDs
    cvIdMapping.forEach(u => {
      md += `| #${u.cv_id} | ${u.display_name || 'N/A'} | \`${u.wallet_address}\` | ${u.current_role || 'None'} | ${u.isVerified ? '✅' : '❌'} | ${u.verificationTier || '-'} | Active |\n`;
    });

    // Incomplete Profiles
    incompleteProfiles.forEach(u => {
      md += `| - | *No Profile* | \`${u.wallet_address}\` | - | - | - | Incomplete |\n`;
    });
    
    md += `\n## 4. Gaps and Anomalies\n`;
    const missingProfiles = profiles.filter(p => !wallets.find(w => w.wallet_address === p.wallet_address));
    if (missingProfiles.length > 0) {
      md += `- **Orphaned Profiles found:** ${missingProfiles.length}\n`;
    } else {
      md += `- ✅ **No Orphaned Profiles**: Every profile is properly linked to a master wallet record.\n`;
    }
    
    // Check CV sequence gaps
    const cvs = profiles.map(p => p.card_number).sort((a,b) => a-b).filter(v => v);
    let gaps = [];
    if (cvs.length > 0) {
        for (let i = 1; i < cvs[cvs.length - 1]; i++) {
            if (!cvs.includes(i)) gaps.push(i);
        }
    }
    if (gaps.length > 0) {
      md += `- ⚠️ **CV ID Sequence Gaps Identified:** ${gaps.join(', ')} (This implies users with these IDs were either deleted or test accounts that we successfully purged.)\n`;
    } else {
      md += `- ✅ **Perfect Sequence Sequence**: No CV IDs are skipped.\n`;
    }

    console.log(md);

  } catch (err) {
    console.error("Audit script failed:", err);
  }
}
run();
