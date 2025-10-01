import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres';

const isSupabase = DATABASE_URL.includes('supabase.co');
console.log('Connecting to database:', isSupabase ? 'Supabase' : 'Local PostgreSQL');

export const client = postgres(DATABASE_URL, {
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  connect_timeout: 10,
  onnotice: () => {},
  ssl: isSupabase ? 'require' : false,
});

export const db = drizzle(client, { schema });