import type { MongoCollectionIndexContract } from '@ioterax/infra-lib-database';
import {
  ADMINISTRATIVE_DIVISIONS_COLLECTION,
  GEOGRAPHIC_PLACES_COLLECTION,
  GLOBAL_COUNTRIES_COLLECTION,
} from '@/adapters/out/mongodb/region.collections';

/** API-owned query index contract; ordinary service startup never reconciles indexes. */
export function getRegionQueryIndexContracts(): MongoCollectionIndexContract[] {
  return [
    {
      collectionName: GLOBAL_COUNTRIES_COLLECTION,
      indexes: [
        {
          key: { datasetReleaseId: 1, name: 1, id: 1 },
          options: { name: 'country_release_name_idx' },
        },
      ],
    },
    {
      collectionName: ADMINISTRATIVE_DIVISIONS_COLLECTION,
      indexes: [
        {
          key: { datasetReleaseId: 1, countryCode: 1, level: 1, name: 1, id: 1 },
          options: { name: 'division_release_country_level_name_idx' },
        },
        {
          key: { datasetReleaseId: 1, countryCode: 1, parentId: 1, name: 1, id: 1 },
          options: { name: 'division_release_country_parent_name_idx' },
        },
        {
          key: { datasetReleaseId: 1, countryCode: 1, type: 1, name: 1, id: 1 },
          options: { name: 'division_release_country_type_name_idx' },
        },
      ],
    },
    {
      collectionName: GEOGRAPHIC_PLACES_COLLECTION,
      indexes: [
        {
          key: { datasetReleaseId: 1, countryCode: 1, name: 1, id: 1 },
          options: { name: 'place_release_country_name_idx' },
        },
        {
          key: { datasetReleaseId: 1, countryCode: 1, type: 1, name: 1, id: 1 },
          options: { name: 'place_release_country_type_name_idx' },
        },
      ],
    },
  ];
}

export interface RegionTextIndexContract {
  readonly collectionName: string;
  readonly name: string;
  readonly fields: ReadonlyArray<string>;
  readonly defaultLanguage: 'none';
}

/** Text indexes require MongoDB-specific verification through their persisted weights. */
export function getRegionTextIndexContracts(): ReadonlyArray<RegionTextIndexContract> {
  const fields = ['name', 'localizedNames.name'];
  return [
    {
      collectionName: GLOBAL_COUNTRIES_COLLECTION,
      name: 'country_localized_name_text_idx',
      fields,
      defaultLanguage: 'none',
    },
    {
      collectionName: ADMINISTRATIVE_DIVISIONS_COLLECTION,
      name: 'division_localized_name_text_idx',
      fields,
      defaultLanguage: 'none',
    },
    {
      collectionName: GEOGRAPHIC_PLACES_COLLECTION,
      name: 'place_localized_name_text_idx',
      fields,
      defaultLanguage: 'none',
    },
  ];
}
