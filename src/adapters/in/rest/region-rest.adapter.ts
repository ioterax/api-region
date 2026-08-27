import { Injectable } from '@nestjs/common';
import { RegionQueryInPort } from '@/application/ports/in/region-query.port';
import { RegionRestInPort } from '@/adapters/in/rest/ports/region-rest-in.port';
import { RegionRestMapper } from '@/adapters/in/rest/mappers/region-rest.mapper';
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
} from '@/adapters/in/rest/models/region-response.model';

/** Adapts the private HTTP surface to transport-neutral global region queries. */
@Injectable()
export class RegionRestAdapter extends RegionRestInPort {
  constructor(
    private readonly queries: RegionQueryInPort,
    private readonly mapper: RegionRestMapper,
  ) {
    super();
  }

  async listCountries(query: CountryListQueryModel): Promise<CountryPageResponseModel> {
    return this.mapper.toCountryPage(
      await this.queries.listCountries(this.mapper.toCountryCommand(query)),
    );
  }

  async getCountry(id: string): Promise<GlobalCountryResponseModel> {
    return this.mapper.toCountry(await this.queries.getCountry(id));
  }

  async listAdministrativeDivisions(
    query: AdministrativeDivisionListQueryModel,
  ): Promise<AdministrativeDivisionPageResponseModel> {
    return this.mapper.toDivisionPage(
      await this.queries.listAdministrativeDivisions(this.mapper.toDivisionCommand(query)),
    );
  }

  async getAdministrativeDivision(id: string): Promise<AdministrativeDivisionResponseModel> {
    return this.mapper.toDivision(await this.queries.getAdministrativeDivision(id));
  }

  async listPlaces(
    query: GeographicPlaceListQueryModel,
  ): Promise<GeographicPlacePageResponseModel> {
    return this.mapper.toPlacePage(
      await this.queries.listPlaces(this.mapper.toPlaceCommand(query)),
    );
  }

  async getPlace(id: string): Promise<GeographicPlaceResponseModel> {
    return this.mapper.toPlace(await this.queries.getPlace(id));
  }

  async search(query: RegionSearchQueryModel): Promise<RegionSearchPageResponseModel> {
    return this.mapper.toSearchPage(await this.queries.search(this.mapper.toSearchCommand(query)));
  }

  async getActiveCatalog(): Promise<RegionCatalogResponseModel> {
    return this.mapper.toCatalog(await this.queries.getActiveCatalog());
  }

  async listActiveReleases(): Promise<RegionReleaseResponseModel[]> {
    return this.mapper.toReleases(await this.queries.listActiveReleases());
  }
}
