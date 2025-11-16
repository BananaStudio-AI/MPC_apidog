/**
 * Centralized .env loader for Apidog scripts
 * Auto-loads from repo root .env file
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from repo root (3 levels up from apidog/scripts/lib/)
const ROOT = path.resolve(__dirname, '../../..');
const envPath = path.join(ROOT, '.env');

// Load with override: false to preserve existing process.env values
config({ path: envPath, override: false });

export function getEnv(key, fallback = undefined) {
  return process.env[key] ?? fallback;
}

export function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Export common vars for convenience
export const APIDOG_ACCESS_TOKEN = getEnv('APIDOG_ACCESS_TOKEN');
export const APIDOG_PROJECT_ID = getEnv('APIDOG_PROJECT_ID', '1128155');
export const OPENAI_API_KEY = getEnv('OPENAI_API_KEY');
