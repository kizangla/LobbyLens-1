import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_PROJECT_REF = SUPABASE_URL ? new URL(SUPABASE_URL).hostname.split('.')[0] : '';

const DATABASE_URL = SUPABASE_PROJECT_REF
  ? `postgresql://postgres.${SUPABASE_PROJECT_REF}:bolt@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
  : (process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres');

console.log('Connecting to Supabase database:', SUPABASE_PROJECT_REF ? `Project: ${SUPABASE_PROJECT_REF}` : 'Local database');

export const client = postgres(DATABASE_URL, {
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  connect_timeout: 10,
  onnotice: () => {},
  ssl: SUPABASE_PROJECT_REF ? 'require' : false,
});

export const db = drizzle(client, { schema });