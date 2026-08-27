import {
  AdministrativeDivisionType,
  GeographicNameType,
  GeographicPlaceType,
  RegionDatasetPackStatus,
  RegionDatasetReleaseStatus,
} from '@ioterax/foundation-lib-central';

export const NOW = new Date('2026-08-27T10:00:00.000Z');

export const SOURCE = {
  source: 'Eurostat',
  dataset: 'Administrative units',
  version: '2026-01',
  recordId: 'source-record',
  uri: 'https://example.com/source-record',
  artifactChecksum: 'a'.repeat(64),
  license: {
    name: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
    attribution: 'Eurostat',
  },
};

export const LOCALIZED_NAME = {
  languageTag: 'es-ES',
  name: 'España',
  type: GeographicNameType.OFFICIAL,
  preferred: true,
};

export const COUNTRY_DOCUMENT = {
  id: 'ES',
  datasetReleaseId: 'spain-2026',
  isoAlpha2: 'ES',
  isoAlpha3: 'ESP',
  isoNumeric: '724',
  name: 'Spain',
  officialName: 'Kingdom of Spain',
  localizedNames: [LOCALIZED_NAME],
  languageTags: ['es-ES'],
  mobileCountryCodes: ['214'],
  callingCodes: ['+34'],
  timeZoneIds: ['Europe/Madrid'],
  independent: true,
  sovereigntyCountryCode: 'ES',
  sourceReferences: [SOURCE],
};

export const DIVISION_DOCUMENT = {
  id: 'ES-CT',
  datasetReleaseId: 'spain-2026',
  countryCode: 'ES',
  parentId: 'ES',
  ancestorIds: ['ES'],
  level: 1,
  type: AdministrativeDivisionType.AUTONOMOUS_COMMUNITY,
  code: 'CT',
  name: 'Catalonia',
  localizedNames: [{ ...LOCALIZED_NAME, languageTag: 'ca-ES', name: 'Catalunya' }],
  centroid: { latitude: 41.59, longitude: 1.52 },
  timeZoneIds: ['Europe/Madrid'],
  sourceReferences: [SOURCE],
};

export const PLACE_DOCUMENT = {
  id: 'ES-BCN',
  datasetReleaseId: 'spain-2026',
  countryCode: 'ES',
  parentDivisionId: 'ES-CT',
  administrativeDivisionIds: ['ES-CT', 'ES-B'],
  code: '08019',
  type: GeographicPlaceType.CITY,
  name: 'Barcelona',
  localizedNames: [{ ...LOCALIZED_NAME, languageTag: 'ca-ES', name: 'Barcelona' }],
  location: { latitude: 41.3874, longitude: 2.1686 },
  timeZoneId: 'Europe/Madrid',
  population: 1_620_343,
  sourceReferences: [SOURCE],
};

export const COUNTS = {
  countries: 1,
  administrativeDivisions: 1,
  places: 1,
  localizedNames: 3,
};

export const CATALOG_DOCUMENT = {
  id: 'global',
  schemaVersion: '1.0.0',
  activeReleaseIds: ['spain-2026'],
  packs: [
    {
      packId: 'spain',
      sequence: 1,
      status: RegionDatasetPackStatus.ACTIVE,
      countryCodes: ['ES'],
      activeReleaseId: 'spain-2026',
      recordCounts: COUNTS,
      startedAt: NOW,
      completedAt: NOW,
    },
  ],
  updatedAt: NOW,
};

export const RELEASE_DOCUMENT = {
  id: 'spain-2026',
  packId: 'spain',
  sequence: 1,
  schemaVersion: '1.0.0',
  status: RegionDatasetReleaseStatus.ACTIVE,
  countryCodes: ['ES'],
  sources: [SOURCE],
  recordCounts: COUNTS,
  manifestChecksum: 'b'.repeat(64),
  generatedAt: NOW,
  activatedAt: NOW,
  supersededAt: NOW,
  previousReleaseId: 'spain-2025',
};
