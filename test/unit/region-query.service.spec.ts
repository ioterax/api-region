import { RegionQueryService } from '@/application/service/region-query.service';
import type { RegionQueryRepositoryPort } from '@/application/ports/out/region-query-repository.port';
import type { RegionObservabilityPort } from '@/application/ports/out/region-observability.port';
import {
  RegionCatalogUnavailableException,
  RegionDataInvalidException,
  RegionNotFoundException,
  RegionPersistenceUnavailableException,
} from '@/exceptions/region.exceptions';
import {
  CATALOG_DOCUMENT,
  COUNTRY_DOCUMENT,
  DIVISION_DOCUMENT,
  PLACE_DOCUMENT,
  RELEASE_DOCUMENT,
} from './fixtures';

describe('RegionQueryService', () => {
  const repository = {
    listCountries: jest.fn(),
    findCountry: jest.fn(),
    listAdministrativeDivisions: jest.fn(),
    findAdministrativeDivision: jest.fn(),
    listPlaces: jest.fn(),
    findPlace: jest.fn(),
    search: jest.fn(),
    getActiveCatalog: jest.fn(),
    listActiveReleases: jest.fn(),
    isReady: jest.fn(),
  } as unknown as jest.Mocked<RegionQueryRepositoryPort>;
  const observability = {
    recordQuery: jest.fn(),
    recordDatabaseOperation: jest.fn(),
    recordMongoConnection: jest.fn(),
  } as unknown as jest.Mocked<RegionObservabilityPort>;
  const service = new RegionQueryService(repository, observability);

  beforeEach(() => jest.clearAllMocks());

  it('delegates every successful read and records bounded result counts', async () => {
    const page = { items: [COUNTRY_DOCUMENT], page: 1, pageSize: 25, total: 1 };
    repository.listCountries.mockResolvedValue(page);
    repository.findCountry.mockResolvedValue(COUNTRY_DOCUMENT);
    repository.listAdministrativeDivisions.mockResolvedValue({
      ...page,
      items: [DIVISION_DOCUMENT],
    });
    repository.findAdministrativeDivision.mockResolvedValue(DIVISION_DOCUMENT);
    repository.listPlaces.mockResolvedValue({ ...page, items: [PLACE_DOCUMENT] });
    repository.findPlace.mockResolvedValue(PLACE_DOCUMENT);
    repository.search.mockResolvedValue({
      ...page,
      items: [
        { kind: 'place', id: 'ES-BCN', countryCode: 'ES', name: 'Barcelona', localizedNames: [] },
      ],
    });
    repository.getActiveCatalog.mockResolvedValue(CATALOG_DOCUMENT);
    repository.listActiveReleases.mockResolvedValue([RELEASE_DOCUMENT]);

    await expect(service.listCountries({ page: 1, pageSize: 25 })).resolves.toEqual(page);
    await expect(service.getCountry('ES')).resolves.toEqual(COUNTRY_DOCUMENT);
    await expect(
      service.listAdministrativeDivisions({ countryCode: 'ES', page: 1, pageSize: 25 }),
    ).resolves.toMatchObject({ items: [DIVISION_DOCUMENT] });
    await expect(service.getAdministrativeDivision('ES-CT')).resolves.toEqual(DIVISION_DOCUMENT);
    await expect(
      service.listPlaces({ countryCode: 'ES', page: 1, pageSize: 25 }),
    ).resolves.toMatchObject({ items: [PLACE_DOCUMENT] });
    await expect(service.getPlace('ES-BCN')).resolves.toEqual(PLACE_DOCUMENT);
    await expect(
      service.search({ query: 'Barcelona', kinds: ['place'], page: 1, pageSize: 25 }),
    ).resolves.toMatchObject({ total: 1 });
    await expect(service.getActiveCatalog()).resolves.toEqual(CATALOG_DOCUMENT);
    await expect(service.listActiveReleases()).resolves.toEqual([RELEASE_DOCUMENT]);

    expect(observability.recordQuery).toHaveBeenCalledTimes(9);
    expect(observability.recordQuery).toHaveBeenCalledWith(
      'release',
      'list',
      'accepted',
      'success',
      expect.any(Number),
      1,
    );
  });

  it('fails with not-found errors for missing detail records', async () => {
    repository.findCountry.mockResolvedValue(undefined);
    repository.findAdministrativeDivision.mockResolvedValue(undefined);
    repository.findPlace.mockResolvedValue(undefined);
    await expect(service.getCountry('missing')).rejects.toBeInstanceOf(RegionNotFoundException);
    await expect(service.getAdministrativeDivision('missing')).rejects.toBeInstanceOf(
      RegionNotFoundException,
    );
    await expect(service.getPlace('missing')).rejects.toBeInstanceOf(RegionNotFoundException);
    expect(observability.recordQuery).toHaveBeenLastCalledWith(
      'place',
      'get',
      'rejected',
      'not_found',
      expect.any(Number),
      0,
    );
  });

  it.each([
    [new RegionCatalogUnavailableException(), 'catalog_unavailable'],
    [new RegionDataInvalidException(), 'data_invalid'],
    [new RegionPersistenceUnavailableException(), 'persistence_unavailable'],
    [new Error('unexpected'), 'persistence_unavailable'],
  ])('records a finite rejected reason for %p', async (error, expectedReason) => {
    repository.getActiveCatalog.mockRejectedValue(error);
    await expect(service.getActiveCatalog()).rejects.toBe(error);
    expect(observability.recordQuery).toHaveBeenLastCalledWith(
      'catalog',
      'get',
      'rejected',
      expectedReason,
      expect.any(Number),
      0,
    );
  });
});
