import type { Collection, Db, IndexDescriptionInfo } from 'mongodb';
import { migrateMongoIndexes } from '@ioterax/infra-lib-database';
import { migrateRegionQueryIndexes } from '@/infra/region-index-migration';

jest.mock('@ioterax/infra-lib-database', () => {
  const actual = jest.requireActual('@ioterax/infra-lib-database');
  return { ...actual, migrateMongoIndexes: jest.fn() };
});

function textIndex(name: string, fields = ['localizedNames.name', 'name']): IndexDescriptionInfo {
  return {
    name,
    key: { _fts: 'text', _ftsx: 1 },
    weights: Object.fromEntries(fields.map(field => [field, 1])),
    default_language: 'none',
  };
}

type IndexResponse =
  IndexDescriptionInfo[] | { readonly error: unknown } | { readonly value: unknown };

function databaseWith(indexes: IndexResponse[]): {
  database: Db;
  createIndex: jest.Mock;
} {
  const createIndex = jest.fn().mockResolvedValue('created');
  const listIndexes = jest.fn().mockImplementation(() => ({
    toArray: jest.fn().mockImplementation(async () => {
      const response = indexes.shift() ?? [];
      if ('error' in response) throw response.error;
      if ('value' in response) return response.value;
      return response;
    }),
  })) as jest.MockedFunction<Collection['listIndexes']>;
  const collection = { createIndex, listIndexes } as unknown as Collection;
  return { database: { collection: jest.fn(() => collection) } as unknown as Db, createIndex };
}

describe('migrateRegionQueryIndexes', () => {
  beforeEach(() => {
    jest.mocked(migrateMongoIndexes).mockResolvedValue({ applied: false, actions: [] });
  });

  it('plans missing MongoDB text indexes without changing the database', async () => {
    const { database, createIndex } = databaseWith([[], [], []]);
    const result = await migrateRegionQueryIndexes(database);
    expect(result).toMatchObject({ applied: false });
    expect(result.actions.filter(entry => entry.action === 'create')).toHaveLength(3);
    expect(createIndex).not.toHaveBeenCalled();
  });

  it('creates and verifies persisted MongoDB text index representations', async () => {
    const existing = [
      textIndex('country_localized_name_text_idx'),
      textIndex('division_localized_name_text_idx'),
      textIndex('place_localized_name_text_idx'),
    ];
    const { database, createIndex } = databaseWith([
      [],
      [existing[0]],
      [],
      [existing[1]],
      [],
      [existing[2]],
    ]);
    const result = await migrateRegionQueryIndexes(database, { apply: true });
    expect(result.applied).toBe(true);
    expect(createIndex).toHaveBeenCalledTimes(3);
    expect(createIndex).toHaveBeenCalledWith(
      { name: 'text', 'localizedNames.name': 'text' },
      expect.objectContaining({ default_language: 'none' }),
    );
  });

  it('retains equivalent indexes and rejects incompatible text definitions', async () => {
    const equivalent = textIndex('legacy_text_name');
    const retained = databaseWith([[equivalent], [equivalent], [equivalent]]);
    await expect(migrateRegionQueryIndexes(retained.database)).resolves.toMatchObject({
      actions: expect.arrayContaining([expect.objectContaining({ reason: 'equivalent' })]),
    });

    const incompatible = databaseWith([[textIndex('country_localized_name_text_idx', ['name'])]]);
    await expect(migrateRegionQueryIndexes(incompatible.database)).rejects.toThrow(
      'incompatible definition',
    );
  });

  it('retains current named text indexes', async () => {
    const current = databaseWith([
      [textIndex('country_localized_name_text_idx')],
      [textIndex('division_localized_name_text_idx')],
      [textIndex('place_localized_name_text_idx')],
    ]);
    await expect(migrateRegionQueryIndexes(current.database)).resolves.toMatchObject({
      actions: [
        expect.objectContaining({ action: 'retain', reason: 'current' }),
        expect.objectContaining({ action: 'retain', reason: 'current' }),
        expect.objectContaining({ action: 'retain', reason: 'current' }),
      ],
    });
  });

  it('rejects an incompatible unnamed text index and a failed post-create verification', async () => {
    const unnamed = textIndex('temporary', ['name']);
    delete unnamed.name;
    const incompatible = databaseWith([[unnamed]]);
    await expect(migrateRegionQueryIndexes(incompatible.database)).rejects.toThrow(
      'already has an incompatible text index',
    );

    const unverified = databaseWith([[], []]);
    await expect(migrateRegionQueryIndexes(unverified.database, { apply: true })).rejects.toThrow(
      'text index verification failed',
    );
  });

  it('handles absent namespaces and rejects invalid or failed index inspection', async () => {
    const missing = databaseWith([
      { error: { code: 26 } },
      { error: { code: 27 } },
      { error: { code: 26 } },
    ]);
    await expect(migrateRegionQueryIndexes(missing.database)).resolves.toMatchObject({
      actions: expect.arrayContaining([expect.objectContaining({ action: 'create' })]),
    });

    const invalid = databaseWith([{ value: {} }]);
    await expect(migrateRegionQueryIndexes(invalid.database)).rejects.toThrow(
      'returned invalid index metadata',
    );

    const failed = databaseWith([{ error: new Error('inspection failed') }]);
    await expect(migrateRegionQueryIndexes(failed.database)).rejects.toThrow('inspection failed');
  });
});
