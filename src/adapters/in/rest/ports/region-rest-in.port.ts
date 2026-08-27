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

/** REST-specific inbound boundary kept outside the reusable application use case. */
export abstract class RegionRestInPort {
  abstract listCountries(query: CountryListQueryModel): Promise<CountryPageResponseModel>;
  abstract getCountry(id: string): Promise<GlobalCountryResponseModel>;
  abstract listAdministrativeDivisions(
    query: AdministrativeDivisionListQueryModel,
  ): Promise<AdministrativeDivisionPageResponseModel>;
  abstract getAdministrativeDivision(id: string): Promise<AdministrativeDivisionResponseModel>;
  abstract listPlaces(
    query: GeographicPlaceListQueryModel,
  ): Promise<GeographicPlacePageResponseModel>;
  abstract getPlace(id: string): Promise<GeographicPlaceResponseModel>;
  abstract search(query: RegionSearchQueryModel): Promise<RegionSearchPageResponseModel>;
  abstract getActiveCatalog(): Promise<RegionCatalogResponseModel>;
  abstract listActiveReleases(): Promise<RegionReleaseResponseModel[]>;
}
