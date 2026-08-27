import type {
  AdministrativeDivisionType,
  GeographicPlaceType,
  IAdministrativeDivision,
  IGeographicPlace,
  IGlobalCountry,
  IRegionDatasetCatalog,
  IRegionDatasetRelease,
} from '@ioterax/foundation-lib-central';

export interface RegionPage<T> {
  readonly items: ReadonlyArray<T>;
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
}

export interface RegionPageCommand {
  readonly page: number;
  readonly pageSize: number;
}

export interface CountryListCommand extends RegionPageCommand {
  readonly isoAlpha2?: string;
  readonly languageTag?: string;
}

export interface AdministrativeDivisionListCommand extends RegionPageCommand {
  readonly countryCode: string;
  readonly parentId?: string;
  readonly level?: number;
  readonly type?: AdministrativeDivisionType;
}

export interface GeographicPlaceListCommand extends RegionPageCommand {
  readonly countryCode: string;
  readonly parentDivisionId?: string;
  readonly type?: GeographicPlaceType;
}

export const REGION_SEARCH_KINDS = ['country', 'administrative_division', 'place'] as const;
export type RegionSearchKind = (typeof REGION_SEARCH_KINDS)[number];

export interface RegionSearchCommand extends RegionPageCommand {
  readonly query: string;
  readonly countryCode?: string;
  readonly kinds: ReadonlyArray<RegionSearchKind>;
}

export interface RegionSearchResult {
  readonly kind: RegionSearchKind;
  readonly id: string;
  readonly countryCode: string;
  readonly name: string;
  readonly localizedNames: ReadonlyArray<{ languageTag: string; name: string }>;
}

export type CountryPage = RegionPage<IGlobalCountry<string>>;
export type AdministrativeDivisionPage = RegionPage<IAdministrativeDivision<string>>;
export type GeographicPlacePage = RegionPage<IGeographicPlace<string>>;
export type RegionSearchPage = RegionPage<RegionSearchResult>;
export type RegionCatalog = IRegionDatasetCatalog<string>;
export type RegionRelease = IRegionDatasetRelease<string>;
