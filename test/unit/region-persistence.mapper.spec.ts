import { RegionPersistenceMapper } from '@/adapters/out/mongodb/mappers/region-persistence.mapper';
import { RegionDataInvalidException } from '@/exceptions/region.exceptions';
import {
  CATALOG_DOCUMENT,
  COUNTRY_DOCUMENT,
  DIVISION_DOCUMENT,
  PLACE_DOCUMENT,
  RELEASE_DOCUMENT,
} from './fixtures';

describe('RegionPersistenceMapper', () => {
  const mapper = new RegionPersistenceMapper();

  it('maps complete country, division, place, catalog, release, and search documents', () => {
    expect(mapper.toCountry(COUNTRY_DOCUMENT)).toEqual(COUNTRY_DOCUMENT);
    expect(mapper.toAdministrativeDivision(DIVISION_DOCUMENT)).toEqual(DIVISION_DOCUMENT);
    expect(mapper.toPlace(PLACE_DOCUMENT)).toEqual(PLACE_DOCUMENT);
    expect(mapper.toCatalog(CATALOG_DOCUMENT)).toEqual(CATALOG_DOCUMENT);
    expect(mapper.toRelease(RELEASE_DOCUMENT)).toEqual(RELEASE_DOCUMENT);
    expect(mapper.toSearchResult('country', COUNTRY_DOCUMENT)).toMatchObject({
      kind: 'country',
      id: 'ES',
      countryCode: 'ES',
    });
    expect(mapper.toSearchResult('administrative_division', DIVISION_DOCUMENT)).toMatchObject({
      kind: 'administrative_division',
      id: 'ES-CT',
    });
    expect(mapper.toSearchResult('place', PLACE_DOCUMENT)).toMatchObject({
      kind: 'place',
      id: 'ES-BCN',
    });
  });

  it('omits every optional field when persistence does not provide it', () => {
    const country = { ...COUNTRY_DOCUMENT } as Record<string, unknown>;
    for (const key of ['officialName', 'callingCodes', 'independent', 'sovereigntyCountryCode']) {
      delete country[key];
    }
    const division = { ...DIVISION_DOCUMENT } as Record<string, unknown>;
    for (const key of ['parentId', 'centroid', 'timeZoneIds']) delete division[key];
    const place = { ...PLACE_DOCUMENT } as Record<string, unknown>;
    for (const key of ['parentDivisionId', 'code', 'population']) delete place[key];
    const release = { ...RELEASE_DOCUMENT } as Record<string, unknown>;
    for (const key of ['activatedAt', 'supersededAt', 'previousReleaseId']) delete release[key];
    const catalog = {
      ...CATALOG_DOCUMENT,
      packs: [
        {
          packId: 'spain',
          sequence: 1,
          status: 'ACTIVE',
          countryCodes: ['ES'],
        },
      ],
    } as Record<string, unknown>;

    expect(mapper.toCountry(country)).not.toHaveProperty('officialName');
    expect(mapper.toAdministrativeDivision(division)).not.toHaveProperty('parentId');
    expect(mapper.toPlace(place)).not.toHaveProperty('population');
    expect(mapper.toRelease(release)).not.toHaveProperty('activatedAt');
    expect(mapper.toCatalog(catalog).packs[0]).not.toHaveProperty('activeReleaseId');
  });

  it('omits optional localized-name, provenance, and license fields', () => {
    const country = {
      ...COUNTRY_DOCUMENT,
      localizedNames: [
        {
          languageTag: 'es-ES',
          name: 'España',
          type: COUNTRY_DOCUMENT.localizedNames[0].type,
        },
      ],
      sourceReferences: [
        {
          source: 'Eurostat',
          dataset: 'Countries',
          version: '2026',
          license: {
            name: 'CC BY 4.0',
            url: 'https://creativecommons.org/licenses/by/4.0/',
          },
        },
      ],
    };
    const mapped = mapper.toCountry(country);
    expect(mapped.localizedNames[0]).not.toHaveProperty('preferred');
    expect(mapped.sourceReferences[0]).not.toHaveProperty('recordId');
    expect(mapped.sourceReferences[0].license).not.toHaveProperty('attribution');
  });

  it.each([
    [{ ...COUNTRY_DOCUMENT, id: '' }, 'country'],
    [{ ...COUNTRY_DOCUMENT, localizedNames: {} }, 'country'],
    [{ ...COUNTRY_DOCUMENT, sourceReferences: [null] }, 'country'],
    [{ ...COUNTRY_DOCUMENT, callingCodes: [1] }, 'country'],
    [{ ...DIVISION_DOCUMENT, level: -1 }, 'division'],
    [{ ...DIVISION_DOCUMENT, type: 'UNKNOWN_TYPE' }, 'division'],
    [{ ...DIVISION_DOCUMENT, centroid: { latitude: 91, longitude: 0 } }, 'division'],
    [{ ...PLACE_DOCUMENT, location: { latitude: 0, longitude: Number.NaN } }, 'place'],
    [{ ...PLACE_DOCUMENT, population: 1.2 }, 'place'],
    [{ ...CATALOG_DOCUMENT, packs: {} }, 'catalog'],
    [{ ...CATALOG_DOCUMENT, updatedAt: 'not-a-date' }, 'catalog'],
    [{ ...RELEASE_DOCUMENT, recordCounts: null }, 'release'],
  ])('rejects malformed %s persistence data', (document, kind) => {
    const action = (): unknown => {
      if (kind === 'country') return mapper.toCountry(document);
      if (kind === 'division') return mapper.toAdministrativeDivision(document);
      if (kind === 'place') return mapper.toPlace(document);
      if (kind === 'catalog') return mapper.toCatalog(document);
      return mapper.toRelease(document);
    };
    expect(action).toThrow(RegionDataInvalidException);
  });
});
