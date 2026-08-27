import type { Db, IndexDescriptionInfo } from 'mongodb';
import {
  migrateMongoIndexes,
  type MongoIndexMigrationAction,
  type MongoIndexMigrationReport,
} from '@ioterax/infra-lib-database';
import {
  getRegionQueryIndexContracts,
  getRegionTextIndexContracts,
  type RegionTextIndexContract,
} from '@/infra/region-indexes';

/** Reconciles API-owned B-tree and MongoDB text indexes without running at service startup. */
export async function migrateRegionQueryIndexes(
  database: Db,
  options: { readonly apply?: boolean } = {},
): Promise<MongoIndexMigrationReport> {
  const standard = await migrateMongoIndexes(database, getRegionQueryIndexContracts(), options);
  const textActions: MongoIndexMigrationAction[] = [];

  for (const contract of getRegionTextIndexContracts()) {
    const collection = database.collection(contract.collectionName);
    const existing = await listIndexes(database, contract.collectionName);
    const named = existing.find(index => index.name === contract.name);
    if (named) {
      if (!textIndexMatches(named, contract)) {
        throw new Error(
          `MongoDB text index ${contract.collectionName}.${contract.name} exists with an incompatible definition.`,
        );
      }
      textActions.push(action('retain', contract, contract.name, 'current'));
      continue;
    }

    const equivalent = existing.find(index => textIndexMatches(index, contract));
    if (equivalent?.name) {
      textActions.push(action('retain', contract, equivalent.name, 'equivalent'));
      continue;
    }
    const incompatibleTextIndex = existing.find(isTextIndex);
    if (incompatibleTextIndex) {
      throw new Error(
        `MongoDB collection ${contract.collectionName} already has an incompatible text index.`,
      );
    }

    textActions.push(action('create', contract, contract.name, 'missing'));
    if (!options.apply) continue;
    await collection.createIndex(textIndexKey(contract), {
      name: contract.name,
      default_language: contract.defaultLanguage,
    });
    const verified = await listIndexes(database, contract.collectionName);
    if (
      !verified.some(index => index.name === contract.name && textIndexMatches(index, contract))
    ) {
      throw new Error(
        `MongoDB text index verification failed for ${contract.collectionName}.${contract.name}.`,
      );
    }
  }

  return { applied: options.apply === true, actions: [...standard.actions, ...textActions] };
}

async function listIndexes(database: Db, collectionName: string): Promise<IndexDescriptionInfo[]> {
  try {
    const indexes: unknown = await database.collection(collectionName).listIndexes().toArray();
    if (!Array.isArray(indexes) || !indexes.every(isIndexDescriptionInfo)) {
      throw new Error(`MongoDB returned invalid index metadata for ${collectionName}.`);
    }
    return indexes;
  } catch (error) {
    if (isMissingNamespace(error)) return [];
    throw error;
  }
}

function textIndexMatches(
  existing: IndexDescriptionInfo,
  desired: RegionTextIndexContract,
): boolean {
  if (!isTextIndex(existing) || existing.default_language !== desired.defaultLanguage) return false;
  const expectedWeights = Object.fromEntries([...desired.fields].sort().map(field => [field, 1]));
  return stableJson(existing.weights ?? {}) === stableJson(expectedWeights);
}

function isTextIndex(index: IndexDescriptionInfo): boolean {
  const key = index.key;
  return key._fts === 'text' && key._ftsx === 1;
}

function isIndexDescriptionInfo(value: unknown): value is IndexDescriptionInfo {
  return Boolean(value && typeof value === 'object' && 'key' in value);
}

function textIndexKey(contract: RegionTextIndexContract): Record<string, 'text'> {
  return Object.fromEntries(contract.fields.map(field => [field, 'text']));
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function action(
  actionName: MongoIndexMigrationAction['action'],
  contract: RegionTextIndexContract,
  indexName: string,
  reason: MongoIndexMigrationAction['reason'],
): MongoIndexMigrationAction {
  return { action: actionName, collectionName: contract.collectionName, indexName, reason };
}

function isMissingNamespace(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error.code === 26 || error.code === 27),
  );
}
