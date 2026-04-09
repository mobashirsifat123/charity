const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

function buildPoolConfig() {
    const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    if (connectionString) {
        return {
            connectionString,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
        };
    }

    const hasDiscreteConfig = Boolean(
        process.env.DB_USER &&
        process.env.DB_HOST &&
        process.env.DB_NAME &&
        process.env.DB_PASSWORD &&
        process.env.DB_PORT
    );

    if (!hasDiscreteConfig) {
        return null;
    }

    return {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT),
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    };
}

function createDbNotConfiguredError() {
    const error = new Error('Database is not configured. Set DATABASE_URL (or DB_USER/DB_HOST/DB_NAME/DB_PASSWORD/DB_PORT).');
    error.code = 'DB_NOT_CONFIGURED';
    return error;
}

const poolConfig = buildPoolConfig();
const pool = poolConfig ? new Pool(poolConfig) : null;

if (pool) {
    pool.on('connect', () => {
        console.log('Connected to PostgreSQL database');
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle PostgreSQL client', err);
    });
}

const db = {
    isConfigured: Boolean(pool),
    query: (...args) => {
        if (!pool) {
            throw createDbNotConfiguredError();
        }
        return pool.query(...args);
    },
};

module.exports = db;
