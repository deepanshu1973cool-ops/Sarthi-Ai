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
  const email = `test_user_${Date.now()}@gmail.com`;
  const password = 'TestPassword123!';

  console.log(`Signing up user: ${email}`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    console.error('Sign up error:', signUpError);
    return;
  }

  const user = signUpData.user;
  if (!user) {
    console.error('User not returned after sign up');
    return;
  }

  const userId = user.id;
  console.log(`User created successfully with ID: ${userId}`);

  // Now, try inserting with "id"
  const insertId = await supabase
    .from('profiles')
    .insert([{
      id: userId,
      full_name: 'Test Name',
      age: 25,
      state: 'Maharashtra',
      gender: 'Male',
      education: 'Graduate',
      annual_income: 150000,
      social_category: 'General',
      occupation: 'Student'
    }])
    .select();

  console.log('Insert with "id" column result:');
  if (insertId.error) {
    console.log('Error:', insertId.error.message);
    console.log('Code:', insertId.error.code);
  } else {
    console.log('Success!', insertId.data);
  }

  // Now, try inserting with "user_id"
  const insertUserId = await supabase
    .from('profiles')
    .insert([{
      user_id: userId,
      full_name: 'Test Name 2',
      age: 30,
      state: 'Delhi',
      gender: 'Female',
      education: 'Masters',
      annual_income: 300000,
      social_category: 'General',
      occupation: 'Employed'
    }])
    .select();

  console.log('\nInsert with "user_id" column result:');
  if (insertUserId.error) {
    console.log('Error:', insertUserId.error.message);
    console.log('Code:', insertUserId.error.code);
  } else {
    console.log('Success!', insertUserId.data);
  }
}

test();
