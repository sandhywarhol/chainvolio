
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tlbxjzruyytontxwvwtl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYnhqenJ1eXl0b250eHd2d3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODA3NjUsImV4cCI6MjA4Njc1Njc2NX0.MqFR-Iivn9IevHNY7yvEEVQ1boqwbDb3-NniOXgn3aI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
    const walletAddress = "TestWalletDirectDebug";
    const now = new Date().toISOString();

    console.log("1. Testing Wallet Upsert...");
    const { data: walletData, error: walletError } = await supabase.from("wallets").upsert(
        {
            wallet_address: walletAddress,
            last_connected_at: now,
        },
        { onConflict: "wallet_address" }
    ).select();

    if (walletError) {
        console.error("Wallet Upsert Failed:", walletError);
        return;
    }
    console.log("Wallet Upsert Success:", walletData);

    console.log("2. Testing Profile Upsert...");
    const { data: profileData, error: profileError } = await supabase.from("profiles").upsert(
        {
            wallet_address: walletAddress,
            display_name: "Direct Debug User",
            bio: "Debug Bio",
            skills: "Debug Skills",
            twitter: "@debugdirect",
            updated_at: now,
        },
        { onConflict: "wallet_address" }
    ).select();

    if (profileError) {
        console.error("Profile Upsert Failed:", profileError);
        return;
    }
    console.log("Profile Upsert Success:", profileData);
}

testSupabase();
