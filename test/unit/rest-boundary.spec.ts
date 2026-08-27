import type { ExecutionContext } from '@nestjs/common';
import { AdministrativeDivisionType, GeographicPlaceType } from '@ioterax/foundation-lib-central';
import { RegionRestMapper } from '@/adapters/in/rest/mappers/region-rest.mapper';
import { RegionRestAdapter } from '@/adapters/in/rest/region-rest.adapter';
import { RegionController } from '@/adapters/in/rest/controllers/region.controller';
import { HealthController } from '@/adapters/in/rest/controllers/health.controller';
import { MetricsAccessGuard } from '@/adapters/in/rest/guards/metrics-access.guard';
import type { RegionRestInPort } from '@/adapters/in/rest/ports/region-rest-in.port';
import type { RegionQueryInPort } from '@/application/ports/in/region-query.port';
import type { RegionQueryRepositoryPort } from '@/application/ports/out/region-query-repository.port';
import {
  MetricsAccessDeniedException,
  RegionPersistenceUnavailableException,
} from '@/exceptions/region.exceptions';
import {
  CATALOG_DOCUMENT,
  COUNTRY_DOCUMENT,
  DIVISION_DOCUMENT,
  PLACE_DOCUMENT,
  RELEASE_DOCUMENT,
} from './fixtures';

describe('RegionRestMapper and RegionRestAdapter', () => {
  const mapper = new RegionRestMapper();
  const queries = {
    listCountries: jest.fn(),
    getCountry: jest.fn(),
    listAdministrativeDivisions: jest.fn(),
    getAdministrativeDivision: jest.fn(),
    listPlaces: jest.fn(),
    getPlace: jest.fn(),
    search: jest.fn(),
    getActiveCatalog: jest.fn(),
    listActiveReleases: jest.fn(),
  } as unknown as jest.Mocked<RegionQueryInPort>;
  const adapter = new RegionRestAdapter(queries, mapper);

  beforeEach(() => jest.clearAllMocks());

  it('maps strict query models into transport-neutral commands', () => {
    expect(
      mapper.toCountryCommand({ page: 1, pageSize: 10, isoAlpha2: 'ES', languageTag: 'es-ES' }),
    ).toEqual({ page: 1, pageSize: 10, isoAlpha2: 'ES', languageTag: 'es-ES' });
    expect(mapper.toCountryCommand({ page: 1, pageSize: 10 })).toEqual({ page: 1, pageSize: 10 });
    expect(
      mapper.toDivisionCommand({
        page: 2,
        pageSize: 20,
        countryCode: 'ES',
        parentId: 'ES',
        level: 1,
        type: AdministrativeDivisionType.AUTONOMOUS_COMMUNITY,
      }),
    ).toMatchObject({ countryCode: 'ES', parentId: 'ES', level: 1 });
    expect(mapper.toDivisionCommand({ page: 1, pageSize: 20, countryCode: 'ES' })).toEqual({
      page: 1,
      pageSize: 20,
      countryCode: 'ES',
    });
    expect(
      mapper.toPlaceCommand({
        page: 1,
        pageSize: 20,
        countryCode: 'ES',
        parentDivisionId: 'ES-CT',
        type: GeographicPlaceType.CITY,
      }),
    ).toMatchObject({ parentDivisionId: 'ES-CT', type: 'CITY' });
    expect(mapper.toPlaceCommand({ page: 1, pageSize: 20, countryCode: 'ES' })).toEqual({
      page: 1,
      pageSize: 20,
      countryCode: 'ES',
    });
    expect(
      mapper.toSearchCommand({
        page: 1,
        pageSize: 20,
        query: 'Barcelona',
        countryCode: 'ES',
        kinds: ['place'],
      }),
    ).toMatchObject({ countryCode: 'ES', kinds: ['place'] });
  });

  it('maps and clones all response allowlists', () => {
    const page = { page: 1, pageSize: 25, total: 1 };
    expect(mapper.toCountryPage({ ...page, items: [COUNTRY_DOCUMENT] })).toMatchObject({
      total: 1,
    });
    expect(mapper.toDivisionPage({ ...page, items: [DIVISION_DOCUMENT] })).toMatchObject({
      total: 1,
    });
    expect(mapper.toPlacePage({ ...page, items: [PLACE_DOCUMENT] })).toMatchObject({ total: 1 });
    expect(
      mapper.toSearchPage({
        ...page,
        items: [
          { kind: 'place', id: 'ES-BCN', countryCode: 'ES', name: 'Barcelona', localizedNames: [] },
        ],
      }),
    ).toMatchObject({ total: 1 });
    expect(mapper.toCatalog(CATALOG_DOCUMENT)).toEqual(CATALOG_DOCUMENT);
    expect(mapper.toReleases([RELEASE_DOCUMENT])).toEqual([RELEASE_DOCUMENT]);
  });

  it('adapts every REST operation to the application port', async () => {
    const page = { page: 1, pageSize: 25, total: 1 };
    queries.listCountries.mockResolvedValue({ ...page, items: [COUNTRY_DOCUMENT] });
    queries.getCountry.mockResolvedValue(COUNTRY_DOCUMENT);
    queries.listAdministrativeDivisions.mockResolvedValue({ ...page, items: [DIVISION_DOCUMENT] });
    queries.getAdministrativeDivision.mockResolvedValue(DIVISION_DOCUMENT);
    queries.listPlaces.mockResolvedValue({ ...page, items: [PLACE_DOCUMENT] });
    queries.getPlace.mockResolvedValue(PLACE_DOCUMENT);
    queries.search.mockResolvedValue({ ...page, items: [] });
    queries.getActiveCatalog.mockResolvedValue(CATALOG_DOCUMENT);
    queries.listActiveReleases.mockResolvedValue([RELEASE_DOCUMENT]);

    await adapter.listCountries({ page: 1, pageSize: 25 });
    await adapter.getCountry('ES');
    await adapter.listAdministrativeDivisions({ page: 1, pageSize: 25, countryCode: 'ES' });
    await adapter.getAdministrativeDivision('ES-CT');
    await adapter.listPlaces({ page: 1, pageSize: 25, countryCode: 'ES' });
    await adapter.getPlace('ES-BCN');
    await adapter.search({ page: 1, pageSize: 25, query: 'Barcelona', kinds: ['place'] });
    await adapter.getActiveCatalog();
    await adapter.listActiveReleases();
    expect(queries.listActiveReleases).toHaveBeenCalledTimes(1);
  });
});

describe('RegionController', () => {
  const regions = {
    listCountries: jest.fn(),
    getCountry: jest.fn(),
    listAdministrativeDivisions: jest.fn(),
    getAdministrativeDivision: jest.fn(),
    listPlaces: jest.fn(),
    getPlace: jest.fn(),
    search: jest.fn(),
    getActiveCatalog: jest.fn(),
    listActiveReleases: jest.fn(),
  } as unknown as jest.Mocked<RegionRestInPort>;
  const controller = new RegionController(regions);

  it('delegates every versioned read route', async () => {
    regions.listCountries.mockResolvedValue({ items: [], page: 1, pageSize: 25, total: 0 });
    regions.getCountry.mockResolvedValue(COUNTRY_DOCUMENT);
    regions.listAdministrativeDivisions.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 25,
      total: 0,
    });
    regions.getAdministrativeDivision.mockResolvedValue(DIVISION_DOCUMENT);
    regions.listPlaces.mockResolvedValue({ items: [], page: 1, pageSize: 25, total: 0 });
    regions.getPlace.mockResolvedValue(PLACE_DOCUMENT);
    regions.search.mockResolvedValue({ items: [], page: 1, pageSize: 25, total: 0 });
    regions.getActiveCatalog.mockResolvedValue(CATALOG_DOCUMENT);
    regions.listActiveReleases.mockResolvedValue([RELEASE_DOCUMENT]);
    await controller.listCountries({ page: 1, pageSize: 25 });
    await controller.getCountry({ id: 'ES' });
    await controller.listAdministrativeDivisions({ page: 1, pageSize: 25, countryCode: 'ES' });
    await controller.getAdministrativeDivision({ id: 'ES-CT' });
    await controller.listPlaces({ page: 1, pageSize: 25, countryCode: 'ES' });
    await controller.getPlace({ id: 'ES-BCN' });
    await controller.search({ page: 1, pageSize: 25, query: 'Barcelona', kinds: ['place'] });
    await controller.getActiveCatalog();
    await controller.listActiveReleases();
    expect(regions.listActiveReleases).toHaveBeenCalledTimes(1);
  });
});

describe('operational REST guards', () => {
  const repository = { isReady: jest.fn() } as unknown as jest.Mocked<RegionQueryRepositoryPort>;
  const health = new HealthController(repository);
  const guard = new MetricsAccessGuard();
  const originalToken = process.env.METRICS_BEARER_TOKEN;

  afterAll(() => {
    if (originalToken === undefined) delete process.env.METRICS_BEARER_TOKEN;
    else process.env.METRICS_BEARER_TOKEN = originalToken;
  });

  it('reports liveness and fails readiness closed', () => {
    expect(health.live()).toEqual({ status: 'ok' });
    repository.isReady.mockReturnValue(false);
    expect(() => health.ready()).toThrow(RegionPersistenceUnavailableException);
    repository.isReady.mockReturnValue(true);
    expect(health.ready()).toEqual({ status: 'ready' });
  });

  it('accepts only an exact timing-safe metrics bearer token', () => {
    process.env.METRICS_BEARER_TOKEN = 'secret-token';
    expect(guard.canActivate(context('Bearer secret-token'))).toBe(true);
    expect(() => guard.canActivate(context('Bearer wrong'))).toThrow(MetricsAccessDeniedException);
    expect(() => guard.canActivate(context(['Bearer secret-token']))).toThrow(
      MetricsAccessDeniedException,
    );
    delete process.env.METRICS_BEARER_TOKEN;
    expect(() => guard.canActivate(context(undefined))).toThrow(MetricsAccessDeniedException);
  });
});

function context(authorization: string | readonly string[] | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers: { authorization } }) }),
  } as unknown as ExecutionContext;
}
