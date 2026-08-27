import { Inject, Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { MongoClient, type Db, type Document, type Filter } from 'mongodb';
import type {
  IAdministrativeDivision,
  IGeographicPlace,
  IGlobalCountry,
} from '@ioterax/foundation-lib-central';
import { RegionQueryRepositoryPort } from '@/application/ports/out/region-query-repository.port';
import { RegionObservabilityPort } from '@/application/ports/out/region-observability.port';
import type {
  AdministrativeDivisionListCommand,
  AdministrativeDivisionPage,
  CountryListCommand,
  CountryPage,
  GeographicPlaceListCommand,
  GeographicPlacePage,
  RegionCatalog,
  RegionRelease,
  RegionSearchCommand,
  RegionSearchKind,
  RegionSearchPage,
  RegionSearchResult,
} from '@/domain/region-query';
import {
  RegionCatalogUnavailableException,
  RegionException,
  RegionPersistenceUnavailableException,
} from '@/exceptions/region.exceptions';
import { REGION_API_CONFIGURATION, type RegionApiConfiguration } from '@/infra/runtime.config';
import { RegionPersistenceMapper } from '@/adapters/out/mongodb/mappers/region-persistence.mapper';
import {
  ADMINISTRATIVE_DIVISIONS_COLLECTION,
  GEOGRAPHIC_PLACES_COLLECTION,
  GLOBAL_COUNTRIES_COLLECTION,
  GLOBAL_REGION_CATALOG_ID,
  REGION_CATALOGS_COLLECTION,
  REGION_RELEASES_COLLECTION,
} from '@/adapters/out/mongodb/region.collections';

interface RankedSearchResult {
  readonly result: RegionSearchResult;
  readonly score: number;
}

interface StringIdDocument extends Document {
  _id: string;
}

/** MongoDB read adapter that exposes only records referenced by the active catalog pointer. */
@Injectable()
export class MongoRegionQueryRepository
  extends RegionQueryRepositoryPort
  implements OnModuleInit, OnApplicationShutdown
{
  private client?: MongoClient;
  private database?: Db;
  private ready = false;

  constructor(
    @Inject(REGION_API_CONFIGURATION) private readonly config: RegionApiConfiguration,
    private readonly mapper: RegionPersistenceMapper,
    private readonly observability: RegionObservabilityPort,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    const started = process.hrtime.bigint();
    try {
      this.client = new MongoClient(this.config.mongoUri, {
        appName: this.config.serviceName,
        maxPoolSize: 20,
        minPoolSize: 0,
        retryReads: true,
        retryWrites: false,
        serverSelectionTimeoutMS: 10_000,
      });
      await this.client.connect();
      this.database = this.client.db(this.config.databaseName);
      await this.database.command({ ping: 1 });
      this.ready = true;
      this.observability.recordMongoConnection('connected');
      this.observability.recordDatabaseOperation('connect', 'success', elapsedSeconds(started));
    } catch {
      this.ready = false;
      this.observability.recordMongoConnection('error');
      this.observability.recordDatabaseOperation('connect', 'failure', elapsedSeconds(started));
      throw new RegionPersistenceUnavailableException();
    }
  }

  async onApplicationShutdown(): Promise<void> {
    if (!this.client) return;
    await this.client.close();
    this.ready = false;
    this.observability.recordMongoConnection('disconnected');
  }

  isReady(): boolean {
    return this.ready;
  }

  listCountries(command: CountryListCommand): Promise<CountryPage> {
    return this.databaseOperation(async database => {
      const activeReleaseIds = await this.activeReleaseIds(database);
      const filter: Filter<Document> = { datasetReleaseId: { $in: activeReleaseIds } };
      if (command.isoAlpha2) filter.isoAlpha2 = command.isoAlpha2;
      if (command.languageTag) {
        filter.$or = [
          { languageTags: command.languageTag },
          { 'localizedNames.languageTag': command.languageTag },
        ];
      }
      const collection = database.collection(GLOBAL_COUNTRIES_COLLECTION);
      const [documents, total] = await Promise.all([
        collection
          .find(filter, { projection: { _id: 0, geo: 0 } })
          .sort({ name: 1, id: 1 })
          .skip(offset(command))
          .limit(command.pageSize)
          .toArray(),
        collection.countDocuments(filter),
      ]);
      return page(
        documents.map(document => this.mapper.toCountry(document)),
        command,
        total,
      );
    });
  }

  findCountry(id: string): Promise<IGlobalCountry<string> | undefined> {
    return this.databaseOperation(async database => {
      const document = await database
        .collection(GLOBAL_COUNTRIES_COLLECTION)
        .findOne(
          { id, datasetReleaseId: { $in: await this.activeReleaseIds(database) } },
          { projection: { _id: 0, geo: 0 } },
        );
      return document ? this.mapper.toCountry(document) : undefined;
    });
  }

  listAdministrativeDivisions(
    command: AdministrativeDivisionListCommand,
  ): Promise<AdministrativeDivisionPage> {
    return this.databaseOperation(async database => {
      const filter: Filter<Document> = {
        datasetReleaseId: { $in: await this.activeReleaseIds(database) },
        countryCode: command.countryCode,
      };
      if (command.parentId) filter.parentId = command.parentId;
      if (command.level !== undefined) filter.level = command.level;
      if (command.type) filter.type = command.type;
      const collection = database.collection(ADMINISTRATIVE_DIVISIONS_COLLECTION);
      const [documents, total] = await Promise.all([
        collection
          .find(filter, { projection: { _id: 0, geo: 0 } })
          .sort({ level: 1, name: 1, id: 1 })
          .skip(offset(command))
          .limit(command.pageSize)
          .toArray(),
        collection.countDocuments(filter),
      ]);
      return page(
        documents.map(document => this.mapper.toAdministrativeDivision(document)),
        command,
        total,
      );
    });
  }

  findAdministrativeDivision(id: string): Promise<IAdministrativeDivision<string> | undefined> {
    return this.databaseOperation(async database => {
      const document = await database
        .collection(ADMINISTRATIVE_DIVISIONS_COLLECTION)
        .findOne(
          { id, datasetReleaseId: { $in: await this.activeReleaseIds(database) } },
          { projection: { _id: 0, geo: 0 } },
        );
      return document ? this.mapper.toAdministrativeDivision(document) : undefined;
    });
  }

  listPlaces(command: GeographicPlaceListCommand): Promise<GeographicPlacePage> {
    return this.databaseOperation(async database => {
      const filter: Filter<Document> = {
        datasetReleaseId: { $in: await this.activeReleaseIds(database) },
        countryCode: command.countryCode,
      };
      if (command.parentDivisionId) filter.parentDivisionId = command.parentDivisionId;
      if (command.type) filter.type = command.type;
      const collection = database.collection(GEOGRAPHIC_PLACES_COLLECTION);
      const [documents, total] = await Promise.all([
        collection
          .find(filter, { projection: { _id: 0, geo: 0 } })
          .sort({ name: 1, id: 1 })
          .skip(offset(command))
          .limit(command.pageSize)
          .toArray(),
        collection.countDocuments(filter),
      ]);
      return page(
        documents.map(document => this.mapper.toPlace(document)),
        command,
        total,
      );
    });
  }

  findPlace(id: string): Promise<IGeographicPlace<string> | undefined> {
    return this.databaseOperation(async database => {
      const document = await database
        .collection(GEOGRAPHIC_PLACES_COLLECTION)
        .findOne(
          { id, datasetReleaseId: { $in: await this.activeReleaseIds(database) } },
          { projection: { _id: 0, geo: 0 } },
        );
      return document ? this.mapper.toPlace(document) : undefined;
    });
  }

  search(command: RegionSearchCommand): Promise<RegionSearchPage> {
    return this.databaseOperation(async database => {
      const activeReleaseIds = await this.activeReleaseIds(database);
      const limit = offset(command) + command.pageSize;
      const batches = await Promise.all(
        command.kinds.map(kind =>
          this.searchCollection(database, kind, command, activeReleaseIds, limit),
        ),
      );
      const ranked = batches
        .flatMap(batch => batch.items)
        .sort(
          (left, right) =>
            right.score - left.score ||
            left.result.name.localeCompare(right.result.name) ||
            left.result.kind.localeCompare(right.result.kind) ||
            left.result.id.localeCompare(right.result.id),
        );
      return page(
        ranked.slice(offset(command), limit).map(entry => entry.result),
        command,
        batches.reduce((total, batch) => total + batch.total, 0),
      );
    });
  }

  getActiveCatalog(): Promise<RegionCatalog> {
    return this.databaseOperation(async database => {
      const document = await this.catalogDocument(database);
      return this.mapper.toCatalog(document);
    });
  }

  listActiveReleases(): Promise<ReadonlyArray<RegionRelease>> {
    return this.databaseOperation(async database => {
      const ids = await this.activeReleaseIds(database);
      const documents = await database
        .collection(REGION_RELEASES_COLLECTION)
        .find({ id: { $in: ids } }, { projection: { _id: 0 } })
        .sort({ sequence: 1, packId: 1, id: 1 })
        .toArray();
      return documents.map(document => this.mapper.toRelease(document));
    });
  }

  private async searchCollection(
    database: Db,
    kind: RegionSearchKind,
    command: RegionSearchCommand,
    activeReleaseIds: ReadonlyArray<string>,
    limit: number,
  ): Promise<{ readonly items: ReadonlyArray<RankedSearchResult>; readonly total: number }> {
    const collection = database.collection(collectionName(kind));
    const filter: Filter<Document> = {
      datasetReleaseId: { $in: activeReleaseIds },
      $text: { $search: command.query },
    };
    if (command.countryCode) {
      filter[kind === 'country' ? 'isoAlpha2' : 'countryCode'] = command.countryCode;
    }
    const [documents, total] = await Promise.all([
      collection
        .find(filter, { projection: { _id: 0, geo: 0, score: { $meta: 'textScore' } } })
        .sort({ score: { $meta: 'textScore' }, name: 1, id: 1 })
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);
    return {
      items: documents.map(document => ({
        result: this.mapper.toSearchResult(kind, document),
        score: typeof document.score === 'number' ? document.score : 0,
      })),
      total,
    };
  }

  private async activeReleaseIds(database: Db): Promise<ReadonlyArray<string>> {
    const catalog = this.mapper.toCatalog(await this.catalogDocument(database));
    if (catalog.activeReleaseIds.length === 0) throw new RegionCatalogUnavailableException();
    return catalog.activeReleaseIds;
  }

  private async catalogDocument(database: Db): Promise<Document> {
    const document = await database
      .collection<StringIdDocument>(REGION_CATALOGS_COLLECTION)
      .findOne({ _id: GLOBAL_REGION_CATALOG_ID }, { projection: { _id: 0 } });
    if (!document) throw new RegionCatalogUnavailableException();
    return document;
  }

  private async databaseOperation<T>(action: (database: Db) => Promise<T>): Promise<T> {
    const started = process.hrtime.bigint();
    try {
      const result = await action(this.requireDatabase());
      this.observability.recordDatabaseOperation('read', 'success', elapsedSeconds(started));
      return result;
    } catch (error) {
      this.observability.recordDatabaseOperation('read', 'failure', elapsedSeconds(started));
      if (error instanceof RegionException) throw error;
      throw new RegionPersistenceUnavailableException();
    }
  }

  private requireDatabase(): Db {
    if (!this.database || !this.ready) throw new RegionPersistenceUnavailableException();
    return this.database;
  }
}

function collectionName(kind: RegionSearchKind): string {
  if (kind === 'country') return GLOBAL_COUNTRIES_COLLECTION;
  if (kind === 'administrative_division') return ADMINISTRATIVE_DIVISIONS_COLLECTION;
  return GEOGRAPHIC_PLACES_COLLECTION;
}

function offset(command: { readonly page: number; readonly pageSize: number }): number {
  return (command.page - 1) * command.pageSize;
}

function page<T>(
  items: ReadonlyArray<T>,
  command: { readonly page: number; readonly pageSize: number },
  total: number,
): { items: ReadonlyArray<T>; page: number; pageSize: number; total: number } {
  return { items, page: command.page, pageSize: command.pageSize, total };
}

function elapsedSeconds(started: bigint): number {
  return Number(process.hrtime.bigint() - started) / 1_000_000_000;
}
