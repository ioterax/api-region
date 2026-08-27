import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AdministrativeDivisionType,
  GeographicNameType,
  GeographicPlaceType,
  RegionDatasetPackStatus,
  RegionDatasetReleaseStatus,
} from '@ioterax/foundation-lib-central';
import { REGION_SEARCH_KINDS } from '@/domain/region-query';

export class LocalizedGeographicNameModel {
  @ApiProperty({ example: 'es-ES' })
  languageTag!: string;
  @ApiProperty({ example: 'España' })
  name!: string;
  @ApiProperty({ enum: GeographicNameType })
  type!: GeographicNameType;
  @ApiPropertyOptional()
  preferred?: boolean;
}

export class GeographicLicenseModel {
  @ApiProperty()
  name!: string;
  @ApiProperty({ format: 'uri' })
  url!: string;
  @ApiPropertyOptional()
  attribution?: string;
}

export class GeographicSourceReferenceModel {
  @ApiProperty()
  source!: string;
  @ApiProperty()
  dataset!: string;
  @ApiProperty()
  version!: string;
  @ApiPropertyOptional()
  recordId?: string;
  @ApiPropertyOptional({ format: 'uri' })
  uri?: string;
  @ApiPropertyOptional()
  artifactChecksum?: string;
  @ApiProperty({ type: GeographicLicenseModel })
  license!: GeographicLicenseModel;
}

export class GeographicPointModel {
  @ApiProperty({ minimum: -90, maximum: 90 })
  latitude!: number;
  @ApiProperty({ minimum: -180, maximum: 180 })
  longitude!: number;
}

export class GlobalCountryResponseModel {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  datasetReleaseId!: string;
  @ApiProperty({ example: 'ES' })
  isoAlpha2!: string;
  @ApiProperty({ example: 'ESP' })
  isoAlpha3!: string;
  @ApiProperty({ example: '724' })
  isoNumeric!: string;
  @ApiProperty()
  name!: string;
  @ApiPropertyOptional()
  officialName?: string;
  @ApiProperty({ type: [LocalizedGeographicNameModel] })
  localizedNames!: LocalizedGeographicNameModel[];
  @ApiProperty({ type: [String] })
  languageTags!: string[];
  @ApiProperty({ type: [String] })
  mobileCountryCodes!: string[];
  @ApiPropertyOptional({ type: [String] })
  callingCodes?: string[];
  @ApiProperty({ type: [String] })
  timeZoneIds!: string[];
  @ApiPropertyOptional()
  independent?: boolean;
  @ApiPropertyOptional()
  sovereigntyCountryCode?: string;
  @ApiProperty({ type: [GeographicSourceReferenceModel] })
  sourceReferences!: GeographicSourceReferenceModel[];
}

export class AdministrativeDivisionResponseModel {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  datasetReleaseId!: string;
  @ApiProperty()
  countryCode!: string;
  @ApiPropertyOptional()
  parentId?: string;
  @ApiProperty({ type: [String] })
  ancestorIds!: string[];
  @ApiProperty({ minimum: 1, maximum: 20 })
  level!: number;
  @ApiProperty({ enum: AdministrativeDivisionType })
  type!: AdministrativeDivisionType;
  @ApiProperty()
  code!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty({ type: [LocalizedGeographicNameModel] })
  localizedNames!: LocalizedGeographicNameModel[];
  @ApiPropertyOptional({ type: GeographicPointModel })
  centroid?: GeographicPointModel;
  @ApiPropertyOptional({ type: [String] })
  timeZoneIds?: string[];
  @ApiProperty({ type: [GeographicSourceReferenceModel] })
  sourceReferences!: GeographicSourceReferenceModel[];
}

export class GeographicPlaceResponseModel {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  datasetReleaseId!: string;
  @ApiProperty()
  countryCode!: string;
  @ApiPropertyOptional()
  parentDivisionId?: string;
  @ApiProperty({ type: [String] })
  administrativeDivisionIds!: string[];
  @ApiPropertyOptional()
  code?: string;
  @ApiProperty({ enum: GeographicPlaceType })
  type!: GeographicPlaceType;
  @ApiProperty()
  name!: string;
  @ApiProperty({ type: [LocalizedGeographicNameModel] })
  localizedNames!: LocalizedGeographicNameModel[];
  @ApiProperty({ type: GeographicPointModel })
  location!: GeographicPointModel;
  @ApiProperty()
  timeZoneId!: string;
  @ApiPropertyOptional({ minimum: 0 })
  population?: number;
  @ApiProperty({ type: [GeographicSourceReferenceModel] })
  sourceReferences!: GeographicSourceReferenceModel[];
}

export class RegionRecordCountsModel {
  @ApiProperty({ minimum: 0 })
  countries!: number;
  @ApiProperty({ minimum: 0 })
  administrativeDivisions!: number;
  @ApiProperty({ minimum: 0 })
  places!: number;
  @ApiProperty({ minimum: 0 })
  localizedNames!: number;
}

export class RegionPackCoverageModel {
  @ApiProperty()
  packId!: string;
  @ApiProperty()
  sequence!: number;
  @ApiProperty({ enum: RegionDatasetPackStatus })
  status!: RegionDatasetPackStatus;
  @ApiProperty({ type: [String] })
  countryCodes!: string[];
  @ApiPropertyOptional()
  activeReleaseId?: string;
  @ApiPropertyOptional({ type: RegionRecordCountsModel })
  recordCounts?: RegionRecordCountsModel;
  @ApiPropertyOptional({ format: 'date-time' })
  startedAt?: Date;
  @ApiPropertyOptional({ format: 'date-time' })
  completedAt?: Date;
}

export class RegionCatalogResponseModel {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  schemaVersion!: string;
  @ApiProperty({ type: [String] })
  activeReleaseIds!: string[];
  @ApiProperty({ type: [RegionPackCoverageModel] })
  packs!: RegionPackCoverageModel[];
  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;
}

export class RegionReleaseResponseModel {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  packId!: string;
  @ApiProperty()
  sequence!: number;
  @ApiProperty()
  schemaVersion!: string;
  @ApiProperty({ enum: RegionDatasetReleaseStatus })
  status!: RegionDatasetReleaseStatus;
  @ApiProperty({ type: [String] })
  countryCodes!: string[];
  @ApiProperty({ type: [GeographicSourceReferenceModel] })
  sources!: GeographicSourceReferenceModel[];
  @ApiProperty({ type: RegionRecordCountsModel })
  recordCounts!: RegionRecordCountsModel;
  @ApiProperty()
  manifestChecksum!: string;
  @ApiProperty({ format: 'date-time' })
  generatedAt!: Date;
  @ApiPropertyOptional({ format: 'date-time' })
  activatedAt?: Date;
  @ApiPropertyOptional({ format: 'date-time' })
  supersededAt?: Date;
  @ApiPropertyOptional()
  previousReleaseId?: string;
}

export class RegionSearchLocalizedNameModel {
  @ApiProperty()
  languageTag!: string;
  @ApiProperty()
  name!: string;
}

export class RegionSearchResultModel {
  @ApiProperty({ enum: REGION_SEARCH_KINDS })
  kind!: (typeof REGION_SEARCH_KINDS)[number];
  @ApiProperty()
  id!: string;
  @ApiProperty()
  countryCode!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty({ type: [RegionSearchLocalizedNameModel] })
  localizedNames!: RegionSearchLocalizedNameModel[];
}

export class CountryPageResponseModel {
  @ApiProperty({ type: [GlobalCountryResponseModel] })
  items!: GlobalCountryResponseModel[];
  @ApiProperty()
  page!: number;
  @ApiProperty()
  pageSize!: number;
  @ApiProperty()
  total!: number;
}

export class AdministrativeDivisionPageResponseModel {
  @ApiProperty({ type: [AdministrativeDivisionResponseModel] })
  items!: AdministrativeDivisionResponseModel[];
  @ApiProperty()
  page!: number;
  @ApiProperty()
  pageSize!: number;
  @ApiProperty()
  total!: number;
}

export class GeographicPlacePageResponseModel {
  @ApiProperty({ type: [GeographicPlaceResponseModel] })
  items!: GeographicPlaceResponseModel[];
  @ApiProperty()
  page!: number;
  @ApiProperty()
  pageSize!: number;
  @ApiProperty()
  total!: number;
}

export class RegionSearchPageResponseModel {
  @ApiProperty({ type: [RegionSearchResultModel] })
  items!: RegionSearchResultModel[];
  @ApiProperty()
  page!: number;
  @ApiProperty()
  pageSize!: number;
  @ApiProperty()
  total!: number;
}

export class RegionErrorResponseModel {
  @ApiProperty()
  statusCode!: number;
  @ApiProperty({ example: 'REGION_RECORD_NOT_FOUND' })
  errorCode!: string;
  @ApiProperty({ example: 'REGION' })
  module!: string;
  @ApiProperty({ example: 'region.query.not_found' })
  errorKey!: string;
  @ApiProperty()
  message!: string;
  @ApiProperty({ format: 'date-time' })
  timestamp!: string;
  @ApiProperty()
  path!: string;
  @ApiProperty()
  requestId!: string;
  @ApiProperty()
  correlationId!: string;
  @ApiPropertyOptional()
  traceId?: string;
}
