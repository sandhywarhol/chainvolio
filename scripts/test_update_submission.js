
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
    console.log("Starting update test...");

    // 1. Get a valid submission ID
    const { data: subs, error: fetchError } = await supabase
        .from('collection_submissions')
        .select('id, recruiter_status, recruiter_notes')
        .limit(1);

    if (fetchError || !subs || subs.length === 0) {
        console.error("Could not fetch any submission to test:", fetchError);
        return;
    }

    const target = subs[0];
    console.log("Target Submission:", target);

    // 2. define new values (toggle/randomize to ensure change)
    const newStatus = target.recruiter_status === 'shortlisted' ? 'rejected' : 'shortlisted';
    const newNote = `Test Note ${Date.now()}`;

    console.log(`Attempting to update ID ${target.id} to status='${newStatus}' and notes='${newNote}'...`);

    // 3. Perform Update
    const { data: updateData, error: updateError } = await supabase
        .from('collection_submissions')
        .update({
            recruiter_status: newStatus,
            recruiter_notes: newNote
        })
        .eq('id', target.id)
        .select();

    if (updateError) {
        console.error("Update failed via Supabase Client:", updateError);
    } else {
        console.log("Update call successful directly via client.");
        console.log("Returned Data:", updateData);
    }

    // 4. Verify persistence
    const { data: verifyData } = await supabase
        .from('collection_submissions')
        .select('id, recruiter_status, recruiter_notes')
        .eq('id', target.id)
        .single();

    console.log("Verification Fetch:", verifyData);

    if (verifyData.recruiter_status === newStatus && verifyData.recruiter_notes === newNote) {
        console.log("✅ SUCCESS: Data persisted correctly in DB.");
    } else {
        console.log("❌ FAILURE: Data did NOT persist.");
    }
}

testUpdate();
