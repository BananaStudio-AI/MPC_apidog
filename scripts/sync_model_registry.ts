import { fetchAllModels } from '../apis/model_registry';
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function main() {
  const models = await fetchAllModels();
  const bySource = models.reduce((acc, m) => {
    acc[m.source] = (acc[m.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const outPath = path.join(__dirname, '../data/model_registry.json');
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(models, null, 2));
  console.log(`Wrote ${models.length} models to data/model_registry.json`);
  Object.entries(bySource).forEach(([src, count]) => {
    console.log(`  ${src}: ${count}`);
  });
}

main().catch((err) => {
  console.error('Error syncing model registry:', err);
  process.exit(1);
});
