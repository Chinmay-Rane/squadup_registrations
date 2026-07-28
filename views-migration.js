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
      ALTER TABLE public.form_config ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 0;
    `;

    console.log("Executing SQL migration to add page_views column...");
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
