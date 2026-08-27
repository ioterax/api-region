import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permission } from '@ioterax/security-lib-auth';
import { RegionCountryPermissions } from '@ioterax/security-lib-rbac';
import {
  AdministrativeDivisionListQueryModel,
  CountryListQueryModel,
  GeographicPlaceListQueryModel,
  RegionIdParamModel,
  RegionSearchQueryModel,
} from '@/adapters/in/rest/models/region-query.model';
import {
  AdministrativeDivisionPageResponseModel,
  AdministrativeDivisionResponseModel,
  CountryPageResponseModel,
  GeographicPlacePageResponseModel,
  GeographicPlaceResponseModel,
  GlobalCountryResponseModel,
  RegionCatalogResponseModel,
  RegionErrorResponseModel,
  RegionReleaseResponseModel,
  RegionSearchPageResponseModel,
} from '@/adapters/in/rest/models/region-response.model';
import { RegionRestInPort } from '@/adapters/in/rest/ports/region-rest-in.port';

@ApiTags('Global regions')
@ApiBearerAuth('Authorization')
@ApiExtraModels(
  CountryPageResponseModel,
  GlobalCountryResponseModel,
  AdministrativeDivisionPageResponseModel,
  AdministrativeDivisionResponseModel,
  GeographicPlacePageResponseModel,
  GeographicPlaceResponseModel,
  RegionSearchPageResponseModel,
  RegionCatalogResponseModel,
  RegionReleaseResponseModel,
  RegionErrorResponseModel,
)
@ApiHeader({ name: 'x-request-id', required: true, description: 'Fresh UUID v4.' })
@ApiHeader({ name: 'x-correlation-id', required: true, description: 'Workflow correlation ID.' })
@ApiHeader({ name: 'x-api-key', required: true, description: 'Registered BFF API key.' })
@ApiHeader({ name: 'x-lang', required: true, description: 'Requested response language.' })
@ApiHeader({ name: 'x-erax-companyid', required: true, description: 'Effective company tenant.' })
@ApiBadRequestResponse({ type: RegionErrorResponseModel })
@ApiForbiddenResponse({ type: RegionErrorResponseModel })
@ApiServiceUnavailableResponse({ type: RegionErrorResponseModel })
@Controller({ path: 'region', version: '1' })
export class RegionController {
  constructor(@Inject(RegionRestInPort) private readonly regions: RegionRestInPort) {}

  @Permission(RegionCountryPermissions.VIEW_LIST)
  @Get('countries')
  @ApiOperation({ summary: 'List countries from the active global dataset catalog' })
  @ApiOkResponse({ type: CountryPageResponseModel })
  listCountries(@Query() query: CountryListQueryModel): Promise<CountryPageResponseModel> {
    return this.regions.listCountries(query);
  }

  @Permission(RegionCountryPermissions.VIEW_GET)
  @Get('countries/:id')
  @ApiOperation({ summary: 'Read one country from an active dataset release' })
  @ApiOkResponse({ type: GlobalCountryResponseModel })
  @ApiNotFoundResponse({ type: RegionErrorResponseModel })
  getCountry(@Param() params: RegionIdParamModel): Promise<GlobalCountryResponseModel> {
    return this.regions.getCountry(params.id);
  }

  @Permission(RegionCountryPermissions.VIEW_LIST)
  @Get('administrative-divisions')
  @ApiOperation({ summary: 'List active country administrative divisions' })
  @ApiOkResponse({ type: AdministrativeDivisionPageResponseModel })
  listAdministrativeDivisions(
    @Query() query: AdministrativeDivisionListQueryModel,
  ): Promise<AdministrativeDivisionPageResponseModel> {
    return this.regions.listAdministrativeDivisions(query);
  }

  @Permission(RegionCountryPermissions.VIEW_GET)
  @Get('administrative-divisions/:id')
  @ApiOperation({ summary: 'Read one active administrative division' })
  @ApiOkResponse({ type: AdministrativeDivisionResponseModel })
  @ApiNotFoundResponse({ type: RegionErrorResponseModel })
  getAdministrativeDivision(
    @Param() params: RegionIdParamModel,
  ): Promise<AdministrativeDivisionResponseModel> {
    return this.regions.getAdministrativeDivision(params.id);
  }

  @Permission(RegionCountryPermissions.VIEW_LIST)
  @Get('places')
  @ApiOperation({ summary: 'List active populated or administratively significant places' })
  @ApiOkResponse({ type: GeographicPlacePageResponseModel })
  listPlaces(
    @Query() query: GeographicPlaceListQueryModel,
  ): Promise<GeographicPlacePageResponseModel> {
    return this.regions.listPlaces(query);
  }

  @Permission(RegionCountryPermissions.VIEW_GET)
  @Get('places/:id')
  @ApiOperation({ summary: 'Read one active geographic place' })
  @ApiOkResponse({ type: GeographicPlaceResponseModel })
  @ApiNotFoundResponse({ type: RegionErrorResponseModel })
  getPlace(@Param() params: RegionIdParamModel): Promise<GeographicPlaceResponseModel> {
    return this.regions.getPlace(params.id);
  }

  @Permission(RegionCountryPermissions.VIEW_LIST)
  @Get('search')
  @ApiOperation({ summary: 'Search active countries, divisions, and places by localized name' })
  @ApiOkResponse({ type: RegionSearchPageResponseModel })
  search(@Query() query: RegionSearchQueryModel): Promise<RegionSearchPageResponseModel> {
    return this.regions.search(query);
  }

  @Permission(RegionCountryPermissions.VIEW_GET)
  @Get('catalog')
  @ApiOperation({ summary: 'Read the atomic active global region catalog pointer' })
  @ApiOkResponse({ type: RegionCatalogResponseModel })
  getActiveCatalog(): Promise<RegionCatalogResponseModel> {
    return this.regions.getActiveCatalog();
  }

  @Permission(RegionCountryPermissions.VIEW_LIST)
  @Get('releases/active')
  @ApiOperation({ summary: 'List metadata for releases referenced by the active catalog' })
  @ApiOkResponse({ type: RegionReleaseResponseModel, isArray: true })
  listActiveReleases(): Promise<RegionReleaseResponseModel[]> {
    return this.regions.listActiveReleases();
  }
}
