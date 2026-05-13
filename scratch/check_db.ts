import { supabaseServer as supabase } from "./lib/supabase/server";

async function checkProfiles() {
    if (!supabase) {
        console.log("Supabase client not initialized");
        return;
    }
    const { data, count, error } = await supabase
        .from("profiles")
        .select("*", { count: 'exact' });
    
    if (error) {
        console.error("Error fetching profiles:", error);
    } else {
        console.log("Total profiles:", count);
        console.log("Sample data:", data?.slice(0, 2));
        
        const nonTest = data?.filter(p => p.is_test === null || p.is_test === false);
        console.log("Non-test profiles:", nonTest?.length);
    }
}

checkProfiles();
