import { Injectable } from '@nestjs/common';
import { MapperFor } from '@ioterax/infra-lib-mapper';
import type {
  IAdministrativeDivision,
  IGeographicPlace,
  IGlobalCountry,
  IRegionDatasetCatalog,
  IRegionDatasetRelease,
} from '@ioterax/foundation-lib-central';
import type {
  AdministrativeDivisionListCommand,
  CountryListCommand,
  GeographicPlaceListCommand,
  RegionPage,
  RegionSearchCommand,
  RegionSearchResult,
} from '@/domain/region-query';
import type {
  AdministrativeDivisionListQueryModel,
  CountryListQueryModel,
  GeographicPlaceListQueryModel,
  RegionSearchQueryModel,
} from '@/adapters/in/rest/models/region-query.model';
import type {
  AdministrativeDivisionPageResponseModel,
  AdministrativeDivisionResponseModel,
  CountryPageResponseModel,
  GeographicPlacePageResponseModel,
  GeographicPlaceResponseModel,
  GlobalCountryResponseModel,
  RegionCatalogResponseModel,
  RegionReleaseResponseModel,
  RegionSearchPageResponseModel,
  RegionSearchResultModel,
} from '@/adapters/in/rest/models/region-response.model';

export const REGION_REST_MAPPER = Symbol('RegionRestMapper');

/** Maps strict REST models to use-case commands and presentation allowlists. */
@Injectable()
@MapperFor(REGION_REST_MAPPER)
export class RegionRestMapper {
  toCountryCommand(query: CountryListQueryModel): CountryListCommand {
    return {
      page: query.page,
      pageSize: query.pageSize,
      ...(query.isoAlpha2 ? { isoAlpha2: query.isoAlpha2 } : {}),
      ...(query.languageTag ? { languageTag: query.languageTag } : {}),
    };
  }

  toDivisionCommand(
    query: AdministrativeDivisionListQueryModel,
  ): AdministrativeDivisionListCommand {
    return {
      page: query.page,
      pageSize: query.pageSize,
      countryCode: query.countryCode,
      ...(query.parentId ? { parentId: query.parentId } : {}),
      ...(query.level === undefined ? {} : { level: query.level }),
      ...(query.type ? { type: query.type } : {}),
    };
  }

  toPlaceCommand(query: GeographicPlaceListQueryModel): GeographicPlaceListCommand {
    return {
      page: query.page,
      pageSize: query.pageSize,
      countryCode: query.countryCode,
      ...(query.parentDivisionId ? { parentDivisionId: query.parentDivisionId } : {}),
      ...(query.type ? { type: query.type } : {}),
    };
  }

  toSearchCommand(query: RegionSearchQueryModel): RegionSearchCommand {
    return {
      page: query.page,
      pageSize: query.pageSize,
      query: query.query,
      kinds: [...query.kinds],
      ...(query.countryCode ? { countryCode: query.countryCode } : {}),
    };
  }

  toCountryPage(page: RegionPage<IGlobalCountry<string>>): CountryPageResponseModel {
    return mapPage(page, country => this.toCountry(country));
  }

  toCountry(country: IGlobalCountry<string>): GlobalCountryResponseModel {
    return clone(country) as GlobalCountryResponseModel;
  }

  toDivisionPage(
    page: RegionPage<IAdministrativeDivision<string>>,
  ): AdministrativeDivisionPageResponseModel {
    return mapPage(page, division => this.toDivision(division));
  }

  toDivision(division: IAdministrativeDivision<string>): AdministrativeDivisionResponseModel {
    return clone(division) as AdministrativeDivisionResponseModel;
  }

  toPlacePage(page: RegionPage<IGeographicPlace<string>>): GeographicPlacePageResponseModel {
    return mapPage(page, place => this.toPlace(place));
  }

  toPlace(place: IGeographicPlace<string>): GeographicPlaceResponseModel {
    return clone(place) as GeographicPlaceResponseModel;
  }

  toSearchPage(page: RegionPage<RegionSearchResult>): RegionSearchPageResponseModel {
    return mapPage(page, result => clone(result) as RegionSearchResultModel);
  }

  toCatalog(catalog: IRegionDatasetCatalog<string>): RegionCatalogResponseModel {
    return clone(catalog) as RegionCatalogResponseModel;
  }

  toReleases(releases: ReadonlyArray<IRegionDatasetRelease<string>>): RegionReleaseResponseModel[] {
    return releases.map(release => clone(release) as RegionReleaseResponseModel);
  }
}

function mapPage<Input, Output>(
  page: RegionPage<Input>,
  mapper: (value: Input) => Output,
): { items: Output[]; page: number; pageSize: number; total: number } {
  return {
    items: page.items.map(mapper),
    page: page.page,
    pageSize: page.pageSize,
    total: page.total,
  };
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
