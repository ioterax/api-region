import { Injectable } from '@nestjs/common';
import type {
  IAdministrativeDivision,
  IGeographicPlace,
  IGlobalCountry,
} from '@ioterax/foundation-lib-central';
import { RegionQueryInPort } from '@/application/ports/in/region-query.port';
import { RegionQueryRepositoryPort } from '@/application/ports/out/region-query-repository.port';
import {
  RegionObservabilityPort,
  type RegionQueryOperation,
  type RegionQueryReason,
  type RegionQueryResource,
} from '@/application/ports/out/region-observability.port';
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
  RegionSearchPage,
} from '@/domain/region-query';
import {
  RegionCatalogUnavailableException,
  RegionDataInvalidException,
  RegionNotFoundException,
  RegionPersistenceUnavailableException,
} from '@/exceptions/region.exceptions';

/** Coordinates release-filtered reads and records finite business outcomes. */
@Injectable()
export class RegionQueryService extends RegionQueryInPort {
  constructor(
    private readonly repository: RegionQueryRepositoryPort,
    private readonly observability: RegionObservabilityPort,
  ) {
    super();
  }

  listCountries(command: CountryListCommand): Promise<CountryPage> {
    return this.execute('country', 'list', () => this.repository.listCountries(command), pageSize);
  }

  getCountry(id: string): Promise<IGlobalCountry<string>> {
    return this.execute('country', 'get', async () => {
      const country = await this.repository.findCountry(id);
      if (!country) throw new RegionNotFoundException();
      return country;
    });
  }

  listAdministrativeDivisions(
    command: AdministrativeDivisionListCommand,
  ): Promise<AdministrativeDivisionPage> {
    return this.execute(
      'administrative_division',
      'list',
      () => this.repository.listAdministrativeDivisions(command),
      pageSize,
    );
  }

  getAdministrativeDivision(id: string): Promise<IAdministrativeDivision<string>> {
    return this.execute('administrative_division', 'get', async () => {
      const division = await this.repository.findAdministrativeDivision(id);
      if (!division) throw new RegionNotFoundException();
      return division;
    });
  }

  listPlaces(command: GeographicPlaceListCommand): Promise<GeographicPlacePage> {
    return this.execute('place', 'list', () => this.repository.listPlaces(command), pageSize);
  }

  getPlace(id: string): Promise<IGeographicPlace<string>> {
    return this.execute('place', 'get', async () => {
      const place = await this.repository.findPlace(id);
      if (!place) throw new RegionNotFoundException();
      return place;
    });
  }

  search(command: RegionSearchCommand): Promise<RegionSearchPage> {
    return this.execute('search', 'search', () => this.repository.search(command), pageSize);
  }

  getActiveCatalog(): Promise<RegionCatalog> {
    return this.execute('catalog', 'get', () => this.repository.getActiveCatalog());
  }

  listActiveReleases(): Promise<ReadonlyArray<RegionRelease>> {
    return this.execute('release', 'list', () => this.repository.listActiveReleases(), length);
  }

  private async execute<T>(
    resource: RegionQueryResource,
    operation: RegionQueryOperation,
    action: () => Promise<T>,
    itemCount: (result: T) => number = one,
  ): Promise<T> {
    const started = process.hrtime.bigint();
    try {
      const result = await action();
      this.observability.recordQuery(
        resource,
        operation,
        'accepted',
        'success',
        elapsedSeconds(started),
        itemCount(result),
      );
      return result;
    } catch (error) {
      this.observability.recordQuery(
        resource,
        operation,
        'rejected',
        reason(error),
        elapsedSeconds(started),
        0,
      );
      throw error;
    }
  }
}

function one(): number {
  return 1;
}

function length(value: ReadonlyArray<unknown>): number {
  return value.length;
}

function pageSize(value: { readonly items: ReadonlyArray<unknown> }): number {
  return value.items.length;
}

function reason(error: unknown): RegionQueryReason {
  if (error instanceof RegionNotFoundException) return 'not_found';
  if (error instanceof RegionCatalogUnavailableException) return 'catalog_unavailable';
  if (error instanceof RegionDataInvalidException) return 'data_invalid';
  if (error instanceof RegionPersistenceUnavailableException) return 'persistence_unavailable';
  return 'persistence_unavailable';
}

function elapsedSeconds(started: bigint): number {
  return Number(process.hrtime.bigint() - started) / 1_000_000_000;
}
