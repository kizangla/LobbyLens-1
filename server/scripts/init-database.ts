import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in environment');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1
});

async function initDatabase() {
  try {
    console.log('Checking database...');

    const tables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log(`Found ${tables.length} existing tables:`, tables.map(t => t.tablename));

    if (tables.length === 0) {
      console.log('\nDatabase is empty. Applying migrations...\n');

      const migration1 = readFileSync(
        join(process.cwd(), 'supabase/migrations/20251001024641_initial_schema.sql'),
        'utf-8'
      );

      await sql.unsafe(migration1);
      console.log('✓ Applied initial schema migration');

      const migration2 = readFileSync(
        join(process.cwd(), 'supabase/migrations/20251001031951_seed_basic_data.sql'),
        'utf-8'
      );

      await sql.unsafe(migration2);
      console.log('✓ Applied seed data migration');

      console.log('\nDatabase initialized successfully!');
    } else {
      console.log('\nDatabase already initialized.');
    }

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

initDatabase();
