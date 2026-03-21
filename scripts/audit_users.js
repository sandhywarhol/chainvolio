require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  try {
    const { data: wallets, error: e1 } = await supabase.from('wallets').select('*');
    if (e1) throw e1;

    const { data: profiles, error: e2 } = await supabase.from('profiles').select('*').order('card_number', { ascending: true });
    if (e2) throw e2;

    const { data: verifications, error: e3 } = await supabase.from('organization_verifications').select('*');
    if (e3) throw e3;

    // Build the analysis logically:
    
    // Categorize
    const activeProfiles = [];
    const incompleteProfiles = [];
    const testUsers = [];
    
    // Quick Lookup Map
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
      const display_name = p ? p.display_name : null;
      const cv_id = p ? p.card_number : null;
      const profile_completed = p ? true : false;
      const isVerified = (v && v.status === 'verified') ? true : false;
      
      const userObj = {
        wallet_address: wallet.wallet_address,
        cv_id,
        display_name,
        current_role: p ? p.professional_role : null,
        verificationTier: v ? v.type : null,
        isVerified,
        profile_completed,
        is_test: isTest,
        created_at: wallet.created_at
      };
      
      if (isTest) {
        testUsers.push(userObj);
      } else if (!p) {
        incompleteProfiles.push(userObj);
      } else {
        activeProfiles.push(userObj);
      }
      
      return userObj;
    });

    const cvIdMapping = structuredUsers
        .filter(u => u.cv_id !== null)
        .map(u => ({ cv_id: u.cv_id, wallet_address: u.wallet_address }));

    const gaps = cvIdMapping.filter(c => {
         const match = profileMap.get(c.wallet_address);
         return !match;
    });

    const summary = {
      total_users: wallets.length,
      total_cv_ids: profiles.filter(p => p.card_number).length,
      total_active_profiles: activeProfiles.length,
      total_incomplete_profiles: incompleteProfiles.length,
      total_test_users: testUsers.length
    };
    
    const finalReport = {
      "Summary Stats": summary,
      "Categorization": {
        "A. Active Profiles": activeProfiles.length,
        "B. Incomplete Profiles": incompleteProfiles.length,
        "C. Test Users": testUsers.length
      },
      "CV ID Handling (Gaps / Nulls)": gaps,
      "Users (Sorted by CV):": structuredUsers.filter(u => u.cv_id !== null).sort((a,b) => a.cv_id - b.cv_id).slice(0, 10).concat({ note: `... and ${structuredUsers.filter(u => u.cv_id).length - 10} more` })
    };

    console.log(JSON.stringify(finalReport, null, 2));

  } catch (err) {
    console.error("Audit script failed:", err);
  }
}
run();
