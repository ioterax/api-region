import { Injectable } from '@nestjs/common';
import { MapperFor } from '@ioterax/infra-lib-mapper';
import {
  AdministrativeDivisionType,
  GeographicNameType,
  GeographicPlaceType,
  RegionDatasetPackStatus,
  RegionDatasetReleaseStatus,
  type IAdministrativeDivision,
  type IGeographicDataLicense,
  type IGeographicPlace,
  type IGeographicSourceReference,
  type IGlobalCountry,
  type ILocalizedGeographicName,
  type IRegionDatasetCatalog,
  type IRegionDatasetPackCoverage,
  type IRegionDatasetRecordCounts,
  type IRegionDatasetRelease,
} from '@ioterax/foundation-lib-central';
import type { RegionSearchKind, RegionSearchResult } from '@/domain/region-query';
import { RegionDataInvalidException } from '@/exceptions/region.exceptions';

type StoredDocument = Readonly<Record<string, unknown>>;

export const REGION_PERSISTENCE_MAPPER = Symbol('RegionPersistenceMapper');

/** Explicitly maps trusted persistence fields into shared global region contracts. */
@Injectable()
@MapperFor(REGION_PERSISTENCE_MAPPER)
export class RegionPersistenceMapper {
  toCountry(document: StoredDocument): IGlobalCountry<string> {
    return {
      id: string(document.id),
      datasetReleaseId: string(document.datasetReleaseId),
      isoAlpha2: string(document.isoAlpha2),
      isoAlpha3: string(document.isoAlpha3),
      isoNumeric: string(document.isoNumeric),
      name: string(document.name),
      ...(optionalString(document.officialName)
        ? { officialName: string(document.officialName) }
        : {}),
      localizedNames: localizedNames(document.localizedNames),
      languageTags: stringArray(document.languageTags),
      mobileCountryCodes: stringArray(document.mobileCountryCodes),
      ...(document.callingCodes === undefined
        ? {}
        : { callingCodes: stringArray(document.callingCodes) }),
      timeZoneIds: stringArray(document.timeZoneIds),
      ...(typeof document.independent === 'boolean' ? { independent: document.independent } : {}),
      ...(optionalString(document.sovereigntyCountryCode)
        ? { sovereigntyCountryCode: string(document.sovereigntyCountryCode) }
        : {}),
      sourceReferences: sourceReferences(document.sourceReferences),
    };
  }

  toAdministrativeDivision(document: StoredDocument): IAdministrativeDivision<string> {
    return {
      id: string(document.id),
      datasetReleaseId: string(document.datasetReleaseId),
      countryCode: string(document.countryCode),
      ...(optionalString(document.parentId) ? { parentId: string(document.parentId) } : {}),
      ancestorIds: stringArray(document.ancestorIds),
      level: nonNegativeInteger(document.level),
      type: enumValue(document.type, AdministrativeDivisionType),
      code: string(document.code),
      name: string(document.name),
      localizedNames: localizedNames(document.localizedNames),
      ...(document.centroid === undefined ? {} : { centroid: point(document.centroid) }),
      ...(document.timeZoneIds === undefined
        ? {}
        : { timeZoneIds: stringArray(document.timeZoneIds) }),
      sourceReferences: sourceReferences(document.sourceReferences),
    };
  }

  toPlace(document: StoredDocument): IGeographicPlace<string> {
    return {
      id: string(document.id),
      datasetReleaseId: string(document.datasetReleaseId),
      countryCode: string(document.countryCode),
      ...(optionalString(document.parentDivisionId)
        ? { parentDivisionId: string(document.parentDivisionId) }
        : {}),
      administrativeDivisionIds: stringArray(document.administrativeDivisionIds),
      ...(optionalString(document.code) ? { code: string(document.code) } : {}),
      type: enumValue(document.type, GeographicPlaceType),
      name: string(document.name),
      localizedNames: localizedNames(document.localizedNames),
      location: point(document.location),
      timeZoneId: string(document.timeZoneId),
      ...(document.population === undefined
        ? {}
        : { population: nonNegativeInteger(document.population) }),
      sourceReferences: sourceReferences(document.sourceReferences),
    };
  }

  toCatalog(document: StoredDocument): IRegionDatasetCatalog<string> {
    if (!Array.isArray(document.packs)) invalid();
    return {
      id: string(document.id),
      schemaVersion: string(document.schemaVersion),
      activeReleaseIds: stringArray(document.activeReleaseIds),
      packs: document.packs.map(packCoverage),
      updatedAt: date(document.updatedAt),
    };
  }

  toRelease(document: StoredDocument): IRegionDatasetRelease<string> {
    return {
      id: string(document.id),
      packId: string(document.packId),
      sequence: nonNegativeInteger(document.sequence),
      schemaVersion: string(document.schemaVersion),
      status: enumValue(document.status, RegionDatasetReleaseStatus),
      countryCodes: stringArray(document.countryCodes),
      sources: sourceReferences(document.sources),
      recordCounts: recordCounts(document.recordCounts),
      manifestChecksum: string(document.manifestChecksum),
      generatedAt: date(document.generatedAt),
      ...(document.activatedAt === undefined ? {} : { activatedAt: date(document.activatedAt) }),
      ...(document.supersededAt === undefined ? {} : { supersededAt: date(document.supersededAt) }),
      ...(optionalString(document.previousReleaseId)
        ? { previousReleaseId: string(document.previousReleaseId) }
        : {}),
    };
  }

  toSearchResult(kind: RegionSearchKind, document: StoredDocument): RegionSearchResult {
    if (kind === 'country') {
      const entity = this.toCountry(document);
      return searchResult(kind, entity.id, entity.isoAlpha2, entity.name, entity.localizedNames);
    }
    if (kind === 'administrative_division') {
      const entity = this.toAdministrativeDivision(document);
      return searchResult(kind, entity.id, entity.countryCode, entity.name, entity.localizedNames);
    }
    const entity = this.toPlace(document);
    return searchResult(kind, entity.id, entity.countryCode, entity.name, entity.localizedNames);
  }
}

function searchResult(
  kind: RegionSearchKind,
  id: string,
  countryCode: string,
  name: string,
  localized: ReadonlyArray<ILocalizedGeographicName>,
): RegionSearchResult {
  return {
    kind,
    id,
    countryCode,
    name,
    localizedNames: localized.map(value => ({
      languageTag: value.languageTag,
      name: value.name,
    })),
  };
}

function packCoverage(value: unknown): IRegionDatasetPackCoverage<string> {
  const document = object(value);
  return {
    packId: string(document.packId),
    sequence: nonNegativeInteger(document.sequence),
    status: enumValue(document.status, RegionDatasetPackStatus),
    countryCodes: stringArray(document.countryCodes),
    ...(optionalString(document.activeReleaseId)
      ? { activeReleaseId: string(document.activeReleaseId) }
      : {}),
    ...(document.recordCounts === undefined
      ? {}
      : { recordCounts: recordCounts(document.recordCounts) }),
    ...(document.startedAt === undefined ? {} : { startedAt: date(document.startedAt) }),
    ...(document.completedAt === undefined ? {} : { completedAt: date(document.completedAt) }),
  };
}

function localizedNames(value: unknown): ILocalizedGeographicName[] {
  if (!Array.isArray(value)) invalid();
  return value.map(entry => {
    const document = object(entry);
    return {
      languageTag: string(document.languageTag),
      name: string(document.name),
      type: enumValue(document.type, GeographicNameType),
      ...(typeof document.preferred === 'boolean' ? { preferred: document.preferred } : {}),
    };
  });
}

function sourceReferences(value: unknown): IGeographicSourceReference[] {
  if (!Array.isArray(value)) invalid();
  return value.map(entry => {
    const document = object(entry);
    return {
      source: string(document.source),
      dataset: string(document.dataset),
      version: string(document.version),
      ...(optionalString(document.recordId) ? { recordId: string(document.recordId) } : {}),
      ...(optionalString(document.uri) ? { uri: string(document.uri) } : {}),
      ...(optionalString(document.artifactChecksum)
        ? { artifactChecksum: string(document.artifactChecksum) }
        : {}),
      license: license(document.license),
    };
  });
}

function license(value: unknown): IGeographicDataLicense {
  const document = object(value);
  return {
    name: string(document.name),
    url: string(document.url),
    ...(optionalString(document.attribution) ? { attribution: string(document.attribution) } : {}),
  };
}

function recordCounts(value: unknown): IRegionDatasetRecordCounts {
  const document = object(value);
  return {
    countries: nonNegativeInteger(document.countries),
    administrativeDivisions: nonNegativeInteger(document.administrativeDivisions),
    places: nonNegativeInteger(document.places),
    localizedNames: nonNegativeInteger(document.localizedNames),
  };
}

function point(value: unknown): { latitude: number; longitude: number } {
  const document = object(value);
  const latitude = finiteNumber(document.latitude);
  const longitude = finiteNumber(document.longitude);
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) invalid();
  return { latitude, longitude };
}

function object(value: unknown): Readonly<Record<string, unknown>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
  return value as Readonly<Record<string, unknown>>;
}

function string(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) invalid();
  return value;
}

function optionalString(value: unknown): value is string {
  if (value === undefined) return false;
  return typeof value === 'string' && value.length > 0;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) invalid();
  return value.map(entry => string(entry));
}

function nonNegativeInteger(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) invalid();
  return value as number;
}

function finiteNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) invalid();
  return value;
}

function date(value: unknown): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) invalid();
  return new Date(value);
}

function enumValue<T extends Record<string, string>>(value: unknown, values: T): T[keyof T] {
  if (typeof value !== 'string' || !Object.values(values).includes(value)) invalid();
  return value as T[keyof T];
}

function invalid(): never {
  throw new RegionDataInvalidException();
}
