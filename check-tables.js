const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tlbxjzruyytontxwvwtl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYnhqenJ1eXl0b250eHd2d3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODA3NjUsImV4cCI6MjA4Njc1Njc2NX0.MqFR-Iivn9IevHNY7yvEEVQ1boqwbDb3-NniOXgn3aI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('--- Table Check ---');

    const { error: colError } = await supabase
        .from('hiring_collections')
        .select('count', { count: 'exact', head: true });

    if (colError) {
        console.log('hiring_collections status: MISSING (' + colError.message + ')');
    } else {
        console.log('hiring_collections status: OK');
    }

    const { error: subError } = await supabase
        .from('collection_submissions')
        .select('count', { count: 'exact', head: true });

    if (subError) {
        console.log('collection_submissions status: MISSING (' + subError.message + ')');
    } else {
        console.log('collection_submissions status: OK');
    }
}

checkTables();
