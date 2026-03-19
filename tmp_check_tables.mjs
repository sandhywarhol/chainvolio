import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data, error } = await supabase.rpc('get_tables');
    // If rpc not defined, use a standard query
    const { data: tables, error: err } = await supabase.from('pg_catalog.pg_tables').select('tablename').eq('schemaname', 'public');
    if (err) {
        console.error("Error fetching tables:", err);
    } else {
        console.log("Tables:", tables.map(t => t.tablename));
    }
}

main();
