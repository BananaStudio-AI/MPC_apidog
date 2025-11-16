#!/usr/bin/env tsx
import { loadRegistry, findModelsBySource, searchModelsByIdOrName } from '../apis/model_registry/service.ts';

async function test() {
  await loadRegistry();
  const comet = await findModelsBySource('comet');
  const fal = await findModelsBySource('fal');
  const flux = await searchModelsByIdOrName('flux');
  
  console.log('✅ Registry loaded successfully:');
  console.log('  Comet models:', comet.length);
  console.log('  FAL models:', fal.length);
  console.log('  Flux search:', flux.length);
  console.log('  Sample Flux models:', flux.slice(0, 3).map(m => m.id));
}

test();
