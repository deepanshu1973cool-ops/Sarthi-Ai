import { Client } from 'pg';

const dbPassword = process.argv[2];

if (!dbPassword) {
  console.error('Error: Please provide the Supabase database password as an argument.');
  console.error('Usage: npx tsx run-migration.ts <your-db-password>');
  process.exit(1);
}

// Supabase DB Connection Details derived from project ref
const connectionString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.ctslwiecbwuexqmtcxqn.supabase.co:5432/postgres`;

async function migrate() {
  const client = new Client({ connectionString });
  console.log('Connecting to Supabase PostgreSQL database...');
  try {
    await client.connect();
    console.log('Connected successfully!');

    // 1. Inspect for duplicate user_id values
    console.log('\n--- Step 1: Inspecting for duplicate user_id values ---');
    const inspectRes = await client.query(`
      SELECT user_id, COUNT(*) as count 
      FROM public.user_progress 
      GROUP BY user_id 
      HAVING COUNT(*) > 1;
    `);

    console.log(`Found ${inspectRes.rows.length} duplicate user_id groups.`);
    if (inspectRes.rows.length > 0) {
      console.log('Duplicates details:', inspectRes.rows);
      
      // 2. Safely remove duplicates keeping only the newest entry
      console.log('\n--- Step 2: Removing duplicates (keeping newest ctid) ---');
      const deleteRes = await client.query(`
        DELETE FROM public.user_progress a
        WHERE a.ctid <> (
          SELECT max(b.ctid)
          FROM public.user_progress b
          WHERE a.user_id = b.user_id
        );
      `);
      console.log(`Deduplication completed. Rows deleted: ${deleteRes.rowCount}`);
    } else {
      console.log('No duplicates found.');
    }

    // 3. Add UNIQUE constraint on user_id
    console.log('\n--- Step 3: Adding UNIQUE constraint on user_id ---');
    // Check if constraint already exists
    const checkConstraint = await client.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conname = 'user_progress_user_id_key';
    `);

    if (checkConstraint.rows.length > 0) {
      console.log('UNIQUE constraint user_progress_user_id_key already exists.');
    } else {
      console.log('Executing ALTER TABLE to add UNIQUE constraint...');
      await client.query(`
        ALTER TABLE public.user_progress
        ADD CONSTRAINT user_progress_user_id_key UNIQUE (user_id);
      `);
      console.log('UNIQUE constraint added successfully!');
    }

    console.log('\nMigration completed successfully!');
  } catch (err: any) {
    console.error('\nMigration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
