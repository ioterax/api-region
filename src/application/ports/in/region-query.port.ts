import type {
  AdministrativeDivisionListCommand,
  AdministrativeDivisionPage,
  CountryListCommand,
  CountryPage,
  GeographicPlaceListCommand,
  GeographicPlacePage,
  RegionCatalog,
  RegionRelease,
  RegionSearchCommand,
  RegionSearchPage,
} from '@/domain/region-query';
import type {
  IAdministrativeDivision,
  IGeographicPlace,
  IGlobalCountry,
} from '@ioterax/foundation-lib-central';

/** Application-facing read-only use cases for the active global region catalog. */
export abstract class RegionQueryInPort {
  abstract listCountries(command: CountryListCommand): Promise<CountryPage>;
  abstract getCountry(id: string): Promise<IGlobalCountry<string>>;
  abstract listAdministrativeDivisions(
    command: AdministrativeDivisionListCommand,
  ): Promise<AdministrativeDivisionPage>;
  abstract getAdministrativeDivision(id: string): Promise<IAdministrativeDivision<string>>;
  abstract listPlaces(command: GeographicPlaceListCommand): Promise<GeographicPlacePage>;
  abstract getPlace(id: string): Promise<IGeographicPlace<string>>;
  abstract search(command: RegionSearchCommand): Promise<RegionSearchPage>;
  abstract getActiveCatalog(): Promise<RegionCatalog>;
  abstract listActiveReleases(): Promise<ReadonlyArray<RegionRelease>>;
}
