import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function test() {
  // Test common RPC names for executing SQL (often created by developers for migrations)
  const rpcs = ['exec_sql', 'execute_sql', 'run_sql', 'sql'];
  for (const name of rpcs) {
    const { data, error } = await supabase.rpc(name, { query: 'SELECT 1;', sql: 'SELECT 1;' });
    console.log(`RPC [${name}]:`, { data, error: error ? error.message : 'None' });
  }
}
test();
