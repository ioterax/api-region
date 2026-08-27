import { MongoDBContainer, type StartedMongoDBContainer } from '@testcontainers/mongodb';
import { MongoClient } from 'mongodb';
import { MongoRegionQueryRepository } from '@/adapters/out/mongodb/mongo-region-query.repository';
import { RegionPersistenceMapper } from '@/adapters/out/mongodb/mappers/region-persistence.mapper';
import { RegionObservabilityPort } from '@/application/ports/out/region-observability.port';
import { migrateRegionQueryIndexes } from '@/infra/region-index-migration';
import type { RegionApiConfiguration } from '@/infra/runtime.config';
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
} from '../unit/fixtures';

interface StringIdDocument {
  _id: string;
  [key: string]: unknown;
}

class E2eObservability extends RegionObservabilityPort {
  recordQuery(): void {}
  recordDatabaseOperation(): void {}
  recordMongoConnection(): void {}
}

describe('MongoDB Region API E2E', () => {
  let container: StartedMongoDBContainer;
  let adminClient: MongoClient;
  let repository: MongoRegionQueryRepository;
  const observability = new E2eObservability();

  beforeAll(async () => {
    container = await new MongoDBContainer('mongo:8.3.8-noble')
      .withEnvironment({ GLIBC_TUNABLES: 'glibc.pthread.rseq=1' })
      .start();
    const mongoUri = `mongodb://${container.getHost()}:${container.getMappedPort(27017)}/?directConnection=true`;
    const configuration: RegionApiConfiguration = {
      serviceName: 'api-region-e2e',
      mongoUri,
      databaseName: 'foundation_central',
      port: 3903,
    };
    adminClient = new MongoClient(configuration.mongoUri);
    await adminClient.connect();
    const database = adminClient.db(configuration.databaseName);
    await Promise.all([
      database.collection<StringIdDocument>(GLOBAL_COUNTRIES_COLLECTION).insertMany([
        { _id: 'spain-2026:ES', ...COUNTRY_DOCUMENT },
        {
          _id: 'inactive-2026:PT',
          ...COUNTRY_DOCUMENT,
          id: 'PT',
          datasetReleaseId: 'inactive-2026',
          isoAlpha2: 'PT',
          isoAlpha3: 'PRT',
          isoNumeric: '620',
          name: 'Portugal',
        },
      ]),
      database
        .collection<StringIdDocument>(ADMINISTRATIVE_DIVISIONS_COLLECTION)
        .insertOne({ _id: 'spain-2026:ES-CT', ...DIVISION_DOCUMENT }),
      database
        .collection<StringIdDocument>(GEOGRAPHIC_PLACES_COLLECTION)
        .insertOne({ _id: 'spain-2026:ES-BCN', ...PLACE_DOCUMENT }),
      database
        .collection<StringIdDocument>(REGION_CATALOGS_COLLECTION)
        .insertOne({ _id: 'global', ...CATALOG_DOCUMENT }),
      database
        .collection<StringIdDocument>(REGION_RELEASES_COLLECTION)
        .insertOne({ _id: 'spain-2026', ...RELEASE_DOCUMENT }),
    ]);
    await migrateRegionQueryIndexes(database, { apply: true });
    repository = new MongoRegionQueryRepository(
      configuration,
      new RegionPersistenceMapper(),
      observability,
    );
    await repository.onModuleInit();
  });

  afterAll(async () => {
    await repository?.onApplicationShutdown();
    await adminClient?.close();
    await container?.stop();
  });

  it('never exposes records outside the atomic active catalog pointer', async () => {
    await expect(repository.listCountries({ page: 1, pageSize: 25 })).resolves.toMatchObject({
      total: 1,
      items: [expect.objectContaining({ id: 'ES', datasetReleaseId: 'spain-2026' })],
    });
    await expect(repository.findCountry('PT')).resolves.toBeUndefined();
    await expect(
      repository.listAdministrativeDivisions({ countryCode: 'ES', page: 1, pageSize: 25 }),
    ).resolves.toMatchObject({ total: 1 });
    await expect(
      repository.listPlaces({ countryCode: 'ES', page: 1, pageSize: 25 }),
    ).resolves.toMatchObject({ total: 1 });
  });

  it('searches localized active names and returns catalog provenance', async () => {
    await expect(
      repository.search({ query: 'Barcelona', kinds: ['place'], page: 1, pageSize: 25 }),
    ).resolves.toMatchObject({
      total: 1,
      items: [expect.objectContaining({ id: 'ES-BCN', kind: 'place' })],
    });
    await expect(repository.getActiveCatalog()).resolves.toMatchObject({
      activeReleaseIds: ['spain-2026'],
    });
    await expect(repository.listActiveReleases()).resolves.toEqual([
      expect.objectContaining({ id: 'spain-2026' }),
    ]);
  });
});
