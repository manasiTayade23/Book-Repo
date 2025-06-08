import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
    NODE_ENV: string;
    PORT: string;
    DATABASE_URL: string | undefined;
    JWT_SECRET: string | undefined;
    JWT_EXPIRE: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DB: string;
}

const config: Config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '7000',
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',
    POSTGRES_USER: process.env.POSTGRES_USER || 'postgres',
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'postgres',
    POSTGRES_DB: process.env.POSTGRES_DB || 'book_review_api'
};

export default config; 