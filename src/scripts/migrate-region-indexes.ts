import { readFileSync } from 'node:fs';
import { MongoClient } from 'mongodb';
import { migrateRegionQueryIndexes } from '@/infra/region-index-migration';

function mongoUri(): string {
  const direct = process.env.MONGODB_URI?.trim();
  const file = process.env.MONGODB_URI_FILE?.trim();
  if (direct && file) throw new Error('Use exactly one MongoDB credential source');
  if (direct) return direct;
  if (!file) throw new Error('MongoDB credential is required');
  const value = readFileSync(file, 'utf8').trim();
  if (!value) throw new Error('MongoDB credential file is empty');
  return value;
}

/** Plans by default and applies only when REGION_INDEX_MODE is explicitly apply. */
export async function migrateRegionIndexes(): Promise<void> {
  const mode = process.env.REGION_INDEX_MODE?.trim() || 'plan';
  if (mode !== 'plan' && mode !== 'apply') throw new Error('Unsupported region index mode');
  const databaseName = process.env.MONGODB_DATABASE?.trim() || 'foundation_central';
  if (databaseName !== 'foundation_central') throw new Error('Unexpected MongoDB database');
  const client = new MongoClient(mongoUri(), { appName: 'api-region-index-migration' });
  try {
    await client.connect();
    const result = await migrateRegionQueryIndexes(client.db(databaseName), {
      apply: mode === 'apply',
    });
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  void migrateRegionIndexes().catch(() => {
    process.stderr.write('api_region_index_migration_failed\n');
    process.exitCode = 1;
  });
}
