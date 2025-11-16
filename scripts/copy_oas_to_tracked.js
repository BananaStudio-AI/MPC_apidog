#!/usr/bin/env node
/**
 * Copy generated OAS files to tracked openapi/ directory
 * Run after: npm run apidog:pull or npm run apidog:push:oas --force
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const GENERATED = path.join(ROOT, 'apidog', 'generated');
const OPENAPI = path.join(ROOT, 'openapi');

const FILES = [
  { from: 'oas_raw.json', to: 'oas_raw.json', desc: 'Latest fetched OAS' },
  { from: 'oas_merged.json', to: 'oas_merged.json', desc: 'Merged OAS for import' }
];

async function copyFile(from, to, desc) {
  try {
    await fs.access(from);
    await fs.copyFile(from, to);
    console.log(`✓ Copied ${desc}: ${path.basename(to)}`);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`⊘ Skipped ${desc}: not found`);
      return false;
    }
    throw err;
  }
}

async function main() {
  console.log('Copying generated OAS files to openapi/...\n');
  
  let copied = 0;
  for (const { from, to, desc } of FILES) {
    const fromPath = path.join(GENERATED, from);
    const toPath = path.join(OPENAPI, to);
    const success = await copyFile(fromPath, toPath, desc);
    if (success) copied++;
  }
  
  console.log(`\n${copied}/${FILES.length} files copied to openapi/`);
  console.log('\nCommit these files to track API changes:');
  console.log('  git add openapi/');
  console.log('  git commit -m "chore: update OpenAPI specs"');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
