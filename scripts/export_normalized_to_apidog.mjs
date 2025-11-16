#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const SRC = path.join(ROOT, 'openapi', 'api-hub.oas.json');
const DEST_DIR = path.join(ROOT, 'apidog', 'generated');
const DEST = path.join(DEST_DIR, 'oas_merged.json');

async function main() {
  await fs.mkdir(DEST_DIR, { recursive: true });
  const txt = await fs.readFile(SRC, 'utf8');
  const oas = JSON.parse(txt);
  await fs.writeFile(DEST, JSON.stringify(oas, null, 2));
  console.log(`✓ Exported normalized OAS -> ${path.relative(ROOT, DEST)}`);
}

main().catch(err => { console.error('Export failed:', err?.message || err); process.exit(1); });
