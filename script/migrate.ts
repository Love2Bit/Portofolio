import pg from 'pg';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const { Pool } = pg;

async function migrate() {
    if (!process.env.SUPABASE_DB_URL) {
        console.error('SUPABASE_DB_URL is not defined in .env');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log('Connected to Supabase Postgres...');

        const schemaPath = path.join(process.cwd(), 'supabase_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running migration...');
        await client.query(schemaSql);

        console.log('Migration completed successfully.');
        client.release();
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
