
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'profiles' });
  
  if (error) {
    // If RPC doesn't exist, try a simple query to see if we can get schema info
    const { data: cols, error: colError } = await supabase
      .from('profiles')
      .select('*')
      .limit(0);
      
    if (colError) {
        console.error("Error fetching profiles:", colError);
    } else {
        console.log("Profiles columns available.");
    }
    
    // Fallback: try to query information_schema if possible (though service role might not have access depending on config)
    const { data: schema, error: schemaError } = await supabase
        .rpc('inspect_table_columns', { t_name: 'profiles' });
    
    if (schemaError) {
        console.log("Could not use RPC to inspect. Trying raw query.");
    } else {
        console.log("Columns:", schema);
    }
  } else {
    console.log("Table info:", data);
  }
}

// Since I might not have the RPCs, I'll just try to fetch a record and see the keys
async function inspectRecord() {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Record sample keys:", Object.keys(data[0] || {}));
        console.log("Record sample:", data[0]);
    }
}

inspectRecord();
