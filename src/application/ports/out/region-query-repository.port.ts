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

/** Persistence boundary for release-filtered global region reads. */
export abstract class RegionQueryRepositoryPort {
  abstract listCountries(command: CountryListCommand): Promise<CountryPage>;
  abstract findCountry(id: string): Promise<IGlobalCountry<string> | undefined>;
  abstract listAdministrativeDivisions(
    command: AdministrativeDivisionListCommand,
  ): Promise<AdministrativeDivisionPage>;
  abstract findAdministrativeDivision(
    id: string,
  ): Promise<IAdministrativeDivision<string> | undefined>;
  abstract listPlaces(command: GeographicPlaceListCommand): Promise<GeographicPlacePage>;
  abstract findPlace(id: string): Promise<IGeographicPlace<string> | undefined>;
  abstract search(command: RegionSearchCommand): Promise<RegionSearchPage>;
  abstract getActiveCatalog(): Promise<RegionCatalog>;
  abstract listActiveReleases(): Promise<ReadonlyArray<RegionRelease>>;
  abstract isReady(): boolean;
}
