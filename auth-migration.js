import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres.lktgfyfayfubytsgydal:Chinm@y1210@@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    const sql = `
      -- Enable RLS on registrations
      ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

      -- Allow anyone to insert (so students can submit forms)
      DROP POLICY IF EXISTS "Enable insert for all users" ON public.registrations;
      CREATE POLICY "Enable insert for all users" ON public.registrations
          AS PERMISSIVE FOR INSERT
          TO public
          WITH CHECK (true);

      -- Only allow AUTHENTICATED users to read the data
      DROP POLICY IF EXISTS "Enable read access for all users" ON public.registrations;
      DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.registrations;
      CREATE POLICY "Enable read access for authenticated users" ON public.registrations
          AS PERMISSIVE FOR SELECT
          TO authenticated
          USING (true);
    `;

    console.log("Executing SQL migration...");
    await client.query(sql);
    console.log("Migration executed successfully! Data is now secure.");

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

runMigration();
