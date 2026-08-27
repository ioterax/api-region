import { MongoClient, type Db } from 'mongodb';
import { AdministrativeDivisionType, GeographicPlaceType } from '@ioterax/foundation-lib-central';
import { MongoRegionQueryRepository } from '@/adapters/out/mongodb/mongo-region-query.repository';
import { RegionPersistenceMapper } from '@/adapters/out/mongodb/mappers/region-persistence.mapper';
import type { RegionObservabilityPort } from '@/application/ports/out/region-observability.port';
import {
  RegionCatalogUnavailableException,
  RegionPersistenceUnavailableException,
} from '@/exceptions/region.exceptions';
import {
  ADMINISTRATIVE_DIVISIONS_COLLECTION,
  GEOGRAPHIC_PLACES_COLLECTION,
  GLOBAL_COUNTRIES_COLLECTION,
  REGION_CATALOGS_COLLECTION,
  REGION_RELEASES_COLLECTION,
} from '@/adapters/out/mongodb/region.collections';
import {
  CATALOG_DOCUMENT,
  COUNTRY_DOCUMENT,
  DIVISION_DOCUMENT,
  PLACE_DOCUMENT,
  RELEASE_DOCUMENT,
} from './fixtures';

describe('MongoRegionQueryRepository', () => {
  const observability = {
    recordQuery: jest.fn(),
    recordDatabaseOperation: jest.fn(),
    recordMongoConnection: jest.fn(),
  } as unknown as jest.Mocked<RegionObservabilityPort>;
  const config = {
    serviceName: 'api-region-test',
    mongoUri: 'mongodb://localhost:27017',
    databaseName: 'foundation_central' as const,
    port: 3903,
  };

  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.restoreAllMocks());

  it('connects, reports readiness, and closes the read-only client', async () => {
    const database = databaseFixture();
    jest.spyOn(MongoClient.prototype, 'connect').mockResolvedValue({} as MongoClient);
    jest.spyOn(MongoClient.prototype, 'db').mockReturnValue(database.db);
    const close = jest.spyOn(MongoClient.prototype, 'close').mockResolvedValue();
    const repository = new MongoRegionQueryRepository(
      config,
      new RegionPersistenceMapper(),
      observability,
    );
    expect(repository.isReady()).toBe(false);
    await repository.onModuleInit();
    expect(repository.isReady()).toBe(true);
    expect(observability.recordMongoConnection).toHaveBeenCalledWith('connected');
    await repository.onApplicationShutdown();
    expect(close).toHaveBeenCalled();
    expect(repository.isReady()).toBe(false);
    await new MongoRegionQueryRepository(
      config,
      new RegionPersistenceMapper(),
      observability,
    ).onApplicationShutdown();
  });

  it('fails closed when MongoDB initialization fails', async () => {
    jest.spyOn(MongoClient.prototype, 'connect').mockRejectedValue(new Error('connection failed'));
    const repository = new MongoRegionQueryRepository(
      config,
      new RegionPersistenceMapper(),
      observability,
    );
    await expect(repository.onModuleInit()).rejects.toBeInstanceOf(
      RegionPersistenceUnavailableException,
    );
    expect(observability.recordMongoConnection).toHaveBeenCalledWith('error');
  });

  it('lists and finds only active countries with bounded filters and pagination', async () => {
    const fixture = databaseFixture();
    const repository = readyRepository(fixture.db);
    await expect(
      repository.listCountries({
        page: 2,
        pageSize: 1,
        isoAlpha2: 'ES',
        languageTag: 'es-ES',
      }),
    ).resolves.toMatchObject({ items: [COUNTRY_DOCUMENT], page: 2, pageSize: 1, total: 1 });
    expect(fixture.countries.find).toHaveBeenCalledWith(
      expect.objectContaining({
        datasetReleaseId: { $in: ['spain-2026'] },
        isoAlpha2: 'ES',
        $or: expect.any(Array),
      }),
      expect.any(Object),
    );
    await expect(repository.findCountry('ES')).resolves.toEqual(COUNTRY_DOCUMENT);
    fixture.countries.findOne.mockResolvedValueOnce(null);
    await expect(repository.findCountry('missing')).resolves.toBeUndefined();
  });

  it('lists and finds active administrative divisions using every supported filter', async () => {
    const fixture = databaseFixture();
    const repository = readyRepository(fixture.db);
    await expect(
      repository.listAdministrativeDivisions({
        page: 1,
        pageSize: 25,
        countryCode: 'ES',
        parentId: 'ES',
        level: 1,
        type: AdministrativeDivisionType.AUTONOMOUS_COMMUNITY,
      }),
    ).resolves.toMatchObject({ items: [DIVISION_DOCUMENT], total: 1 });
    await expect(repository.findAdministrativeDivision('ES-CT')).resolves.toEqual(
      DIVISION_DOCUMENT,
    );
    fixture.divisions.findOne.mockResolvedValueOnce(null);
    await expect(repository.findAdministrativeDivision('missing')).resolves.toBeUndefined();
  });

  it('lists and finds active places using every supported filter', async () => {
    const fixture = databaseFixture();
    const repository = readyRepository(fixture.db);
    await expect(
      repository.listPlaces({
        page: 1,
        pageSize: 25,
        countryCode: 'ES',
        parentDivisionId: 'ES-CT',
        type: GeographicPlaceType.CITY,
      }),
    ).resolves.toMatchObject({ items: [PLACE_DOCUMENT], total: 1 });
    await expect(repository.findPlace('ES-BCN')).resolves.toEqual(PLACE_DOCUMENT);
    fixture.places.findOne.mockResolvedValueOnce(null);
    await expect(repository.findPlace('missing')).resolves.toBeUndefined();
  });

  it('searches selected active collections and returns deterministic global pagination', async () => {
    const fixture = databaseFixture({
      countries: [{ ...COUNTRY_DOCUMENT, score: 2 }],
      divisions: [{ ...DIVISION_DOCUMENT, score: 3 }],
      places: [{ ...PLACE_DOCUMENT, score: 4 }],
    });
    const repository = readyRepository(fixture.db);
    const result = await repository.search({
      query: 'Barcelona',
      countryCode: 'ES',
      kinds: ['country', 'administrative_division', 'place'],
      page: 1,
      pageSize: 2,
    });
    expect(result).toMatchObject({ total: 3, page: 1, pageSize: 2 });
    expect(result.items.map(item => item.kind)).toEqual(['place', 'administrative_division']);
    expect(fixture.countries.find).toHaveBeenCalledWith(
      expect.objectContaining({ isoAlpha2: 'ES', $text: { $search: 'Barcelona' } }),
      expect.any(Object),
    );
  });

  it('reads the active catalog and its immutable releases in sequence order', async () => {
    const fixture = databaseFixture();
    const repository = readyRepository(fixture.db);
    await expect(repository.getActiveCatalog()).resolves.toEqual(CATALOG_DOCUMENT);
    await expect(repository.listActiveReleases()).resolves.toEqual([RELEASE_DOCUMENT]);
  });

  it('preserves expected catalog failures and sanitizes unexpected persistence failures', async () => {
    const missing = databaseFixture({ catalog: null });
    await expect(readyRepository(missing.db).getActiveCatalog()).rejects.toBeInstanceOf(
      RegionCatalogUnavailableException,
    );
    const empty = databaseFixture({ catalog: { ...CATALOG_DOCUMENT, activeReleaseIds: [] } });
    await expect(
      readyRepository(empty.db).listCountries({ page: 1, pageSize: 25 }),
    ).rejects.toBeInstanceOf(RegionCatalogUnavailableException);
    const broken = databaseFixture();
    broken.catalog.findOne.mockRejectedValue(new Error('driver detail must be hidden'));
    await expect(readyRepository(broken.db).getActiveCatalog()).rejects.toBeInstanceOf(
      RegionPersistenceUnavailableException,
    );
    const unavailable = new MongoRegionQueryRepository(
      config,
      new RegionPersistenceMapper(),
      observability,
    );
    await expect(unavailable.getActiveCatalog()).rejects.toBeInstanceOf(
      RegionPersistenceUnavailableException,
    );
    expect(observability.recordDatabaseOperation).toHaveBeenCalledWith(
      'read',
      'failure',
      expect.any(Number),
    );
  });

  function readyRepository(database: Db): MongoRegionQueryRepository {
    const repository = new MongoRegionQueryRepository(
      config,
      new RegionPersistenceMapper(),
      observability,
    );
    Object.assign(repository, { database, ready: true });
    return repository;
  }
});

interface FixtureOptions {
  catalog?: Record<string, unknown> | null;
  countries?: ReadonlyArray<Record<string, unknown>>;
  divisions?: ReadonlyArray<Record<string, unknown>>;
  places?: ReadonlyArray<Record<string, unknown>>;
}

function databaseFixture(options: FixtureOptions = {}) {
  const catalog = collectionFixture(
    options.catalog === undefined ? CATALOG_DOCUMENT : options.catalog,
    [],
    1,
  );
  const countries = collectionFixture(
    COUNTRY_DOCUMENT,
    options.countries ?? [COUNTRY_DOCUMENT],
    options.countries?.length ?? 1,
  );
  const divisions = collectionFixture(
    DIVISION_DOCUMENT,
    options.divisions ?? [DIVISION_DOCUMENT],
    options.divisions?.length ?? 1,
  );
  const places = collectionFixture(
    PLACE_DOCUMENT,
    options.places ?? [PLACE_DOCUMENT],
    options.places?.length ?? 1,
  );
  const releases = collectionFixture(RELEASE_DOCUMENT, [RELEASE_DOCUMENT], 1);
  const collections: Record<string, ReturnType<typeof collectionFixture>> = {
    [REGION_CATALOGS_COLLECTION]: catalog,
    [GLOBAL_COUNTRIES_COLLECTION]: countries,
    [ADMINISTRATIVE_DIVISIONS_COLLECTION]: divisions,
    [GEOGRAPHIC_PLACES_COLLECTION]: places,
    [REGION_RELEASES_COLLECTION]: releases,
  };
  const db = {
    collection: jest.fn((name: string) => collections[name]),
    command: jest.fn().mockResolvedValue({ ok: 1 }),
  } as unknown as Db;
  return { db, catalog, countries, divisions, places, releases };
}

function collectionFixture(
  found: Record<string, unknown> | null,
  documents: ReadonlyArray<Record<string, unknown>>,
  total: number,
) {
  return {
    findOne: jest.fn().mockResolvedValue(found),
    countDocuments: jest.fn().mockResolvedValue(total),
    find: jest.fn(() => cursorFixture(documents)),
  };
}

function cursorFixture(documents: ReadonlyArray<Record<string, unknown>>) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue(documents),
  };
}
