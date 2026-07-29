import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Credentials missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  // Test insert with user_id
  const insertUserId = await supabase
    .from('profiles')
    .insert([{
      user_id: '00000000-0000-0000-0000-000000000000',
      full_name: 'Test Name',
      age: 25,
      state: 'Maharashtra',
      gender: 'Male',
      education: 'Graduate',
      annual_income: 150000,
      social_category: 'General',
      occupation: 'Student'
    }]);

  console.log('Insert with user_id result:');
  console.log('Error:', insertUserId.error ? insertUserId.error.message : 'None');
  console.log('Code:', insertUserId.error ? insertUserId.error.code : 'None');

  // Test insert with id
  const insertId = await supabase
    .from('profiles')
    .insert([{
      id: '00000000-0000-0000-0000-000000000000',
      full_name: 'Test Name',
      age: 25,
      state: 'Maharashtra',
      gender: 'Male',
      education: 'Graduate',
      annual_income: 150000,
      social_category: 'General',
      occupation: 'Student'
    }]);

  console.log('\nInsert with id result:');
  console.log('Error:', insertId.error ? insertId.error.message : 'None');
  console.log('Code:', insertId.error ? insertId.error.code : 'None');
}

test();
