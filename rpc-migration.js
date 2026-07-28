import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    const sql = `
      CREATE OR REPLACE FUNCTION increment_page_views()
      RETURNS void AS $$
      BEGIN
        UPDATE public.form_config SET page_views = page_views + 1 WHERE id = 1;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      GRANT EXECUTE ON FUNCTION increment_page_views() TO anon, authenticated;
    `;

    console.log("Executing SQL migration for RPC...");
    await client.query(sql);
    console.log("Migration executed successfully!");

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

runMigration();
