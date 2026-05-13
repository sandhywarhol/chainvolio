const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tlbxjzruyytontxwvwtl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYnhqenJ1eXl0b250eHd2d3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODA3NjUsImV4cCI6MjA4Njc1Njc2NX0.MqFR-Iivn9IevHNY7yvEEVQ1boqwbDb3-NniOXgn3aI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .or('is_test.is.null,is_test.eq.false');

    if (error) {
        console.error(error);
    } else {
        console.log('Filtered Count:', count);
        if (data) {
            console.log('First 5 profiles:', data.slice(0, 5).map(p => ({
                name: p.display_name,
                is_test: p.is_test,
                skills: p.skills
            })));
        }
    }
}

run();
