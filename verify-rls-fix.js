
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyRLS() {
    console.log("Verifying RLS Policies for Anonymous Access...\n");

    // 1. Check hiring_collections
    console.log("1. Checking 'hiring_collections' (Read)...");
    const { data: cols, count: colCount, error: colError } = await supabase
        .from('hiring_collections')
        .select('*', { count: 'exact', head: false })
        .limit(1);

    if (colError) {
        console.error("   [FAIL] Error:", colError.message);
    } else {
        console.log(`   [PASS] Accessible. Count: ${colCount}. Sample: ${cols ? cols.length : 0} items.`);
        if (cols && cols.length > 0) console.log("   Sample ID:", cols[0].id);
    }

    // 2. Check collection_submissions
    console.log("\n2. Checking 'collection_submissions' (Read)...");
    const { data: subs, count: subCount, error: subError } = await supabase
        .from('collection_submissions')
        .select('*', { count: 'exact', head: false })
        .limit(1);

    if (subError) {
        console.error("   [FAIL] Error:", subError.message);
    } else {
        console.log(`   [PASS] Accessible. Count: ${subCount}. Sample: ${subs ? subs.length : 0} items.`);
        if (subs && subs.length > 0) console.log("   Sample ID:", subs[0].id);
    }

    // 3. Check profiles
    console.log("\n3. Checking 'profiles' (Read)...");
    const { data: profs, count: profCount, error: profError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: false })
        .limit(1);

    if (profError) {
        console.error("   [FAIL] Error:", profError.message);
    } else {
        console.log(`   [PASS] Accessible. Count: ${profCount}. Sample: ${profs ? profs.length : 0} items.`);
    }

    console.log("\n---------------------------------------------------");
    if (!colError && !subError && !profError) {
        console.log("SUCCESS: RLS Policies seem to be applied. You should be able to see data on the dashboard.");
    } else {
        console.log("FAILURE: RLS prevented access.");
    }
}

verifyRLS();
