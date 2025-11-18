import { config } from 'dotenv';
import path from 'node:path';

// Load .env from repository root
export function loadEnv(envPath) {
  const cwd = process.cwd();
  const resolved = envPath ? path.resolve(cwd, envPath) : path.resolve(cwd, '.env');
  config({ path: resolved });
}

// Load immediately on import (side-effect)
loadEnv();
