#!/usr/bin/env node
import './lib/env-loader.js';
/**
 * List all Apidog projects accessible with your token.
 * Useful for finding project IDs.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

async function main() {
  const TOKEN = process.env.APIDOG_ACCESS_TOKEN;
  if (!TOKEN) {
    console.error('❌ APIDOG_ACCESS_TOKEN not set');
    process.exit(1);
  }
  if (TOKEN.includes(':')) {
    console.warn('⚠️ Token contains colon; may not be a Bearer token.');
  }
  try {
    const { default: fetch } = await import('node-fetch');
    const url = 'https://api.apidog.com/api/v1/projects';
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    console.log(`HTTP ${resp.status}`);
    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!resp.ok) {
      console.error('❌ Failed to list projects');
      console.error(JSON.stringify(data, null, 2));
      if (resp.status === 403) {
        console.error('\n🔒 403 Forbidden: Token account lacks any project access.');
        console.error('   Confirm the token is from Account Settings → API Access Token and has project memberships.');
      }
      process.exit(1);
    }
    const projects = data?.data || data?.projects || [];
    if (!Array.isArray(projects)) {
      console.log('Unexpected response shape:', JSON.stringify(data).slice(0,300));
      process.exit(1);
    }
    console.log(`Accessible projects (${projects.length}):`);
    for (const p of projects) {
      console.log(` - ID: ${p.id} Name: ${p.name}`);
    }
    const target = process.env.APIDOG_PROJECT_ID || '1128155';
    const found = projects.find(p => String(p.id) === String(target));
    if (found) {
      console.log(`\n✅ Target project ${target} is accessible.`);
    } else {
      console.log(`\n⚠️ Target project ${target} NOT found in accessible list.`);
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

main();
