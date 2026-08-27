import { MongoClient, type Db } from 'mongodb';
import { migrateRegionQueryIndexes } from '@/infra/region-index-migration';
import { getRegionQueryIndexContracts, getRegionTextIndexContracts } from '@/infra/region-indexes';
import { migrateRegionIndexes } from '@/scripts/migrate-region-indexes';

jest.mock('@/infra/region-index-migration', () => ({ migrateRegionQueryIndexes: jest.fn() }));

const ORIGINAL_ENV = { ...process.env };

describe('Region query indexes', () => {
  it('owns bounded supporting and localized text indexes for all query collections', () => {
    const contracts = getRegionQueryIndexContracts();
    expect(contracts.map(contract => contract.collectionName)).toEqual([
      'global_countries',
      'administrative_divisions',
      'geographic_places',
    ]);
    expect(
      contracts.flatMap(contract => contract.indexes).map(index => index.options?.name),
    ).toEqual(
      expect.arrayContaining([
        'division_release_country_parent_name_idx',
        'place_release_country_type_name_idx',
      ]),
    );
    expect(getRegionTextIndexContracts().map(contract => contract.name)).toEqual([
      'country_localized_name_text_idx',
      'division_localized_name_text_idx',
      'place_localized_name_text_idx',
    ]);
  });
});

describe('migrateRegionIndexes', () => {
  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: 'mongodb://localhost:27017',
      MONGODB_DATABASE: 'foundation_central',
    };
    delete process.env.MONGODB_URI_FILE;
    delete process.env.REGION_INDEX_MODE;
    jest.spyOn(MongoClient.prototype, 'connect').mockResolvedValue({} as MongoClient);
    jest.spyOn(MongoClient.prototype, 'db').mockReturnValue({} as Db);
    jest.spyOn(MongoClient.prototype, 'close').mockResolvedValue();
    jest.mocked(migrateRegionQueryIndexes).mockResolvedValue({ applied: false, actions: [] });
    jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => jest.restoreAllMocks());
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('plans by default and applies only after explicit opt-in', async () => {
    await migrateRegionIndexes();
    expect(migrateRegionQueryIndexes).toHaveBeenLastCalledWith(expect.anything(), {
      apply: false,
    });
    process.env.REGION_INDEX_MODE = 'apply';
    await migrateRegionIndexes();
    expect(migrateRegionQueryIndexes).toHaveBeenLastCalledWith(expect.anything(), {
      apply: true,
    });
    expect(MongoClient.prototype.close).toHaveBeenCalledTimes(2);
  });

  it('rejects unsupported modes, databases, and credential sources', async () => {
    process.env.REGION_INDEX_MODE = 'destroy';
    await expect(migrateRegionIndexes()).rejects.toThrow('Unsupported region index mode');
    process.env.REGION_INDEX_MODE = 'plan';
    process.env.MONGODB_DATABASE = 'other';
    await expect(migrateRegionIndexes()).rejects.toThrow('Unexpected MongoDB database');
    process.env.MONGODB_DATABASE = 'foundation_central';
    process.env.MONGODB_URI_FILE = '/tmp/other';
    await expect(migrateRegionIndexes()).rejects.toThrow('exactly one');
    delete process.env.MONGODB_URI;
    delete process.env.MONGODB_URI_FILE;
    await expect(migrateRegionIndexes()).rejects.toThrow('credential is required');
  });
});
