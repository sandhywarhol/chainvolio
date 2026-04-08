const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL.trim(),
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()
);

async function checkTable() {
  console.log("Checking api_keys table...");
  const { data, error } = await supabase
    .from('api_keys')
    .select('count', { count: 'exact', head: true });

  if (error) {
    console.error("Error checking table:", error.message);
    if (error.message.includes("does not exist")) {
      console.log("RESULT: Table api_keys DOES NOT exist.");
    } else {
      console.log("RESULT: Table exists but access is denied or other error.");
    }
  } else {
    console.log("RESULT: Table api_keys EXISTS.");
  }
}

checkTable();
