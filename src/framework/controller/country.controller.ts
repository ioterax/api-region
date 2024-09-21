import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ICountry } from '@atisiothings/laniakea-lib-central/dist/central';
import { CountryInPort } from '@/application/ports/in/country.in.port';
import { Public } from '@atisiothings/laniakea-lib-http/dist/security/auth.guard';

/**
 * Controller that handles HTTP requests for Country-related operations.
 * 
 * Provides endpoints for creating, retrieving, updating, and deleting Country entities,
 * as well as simplified view retrieval. It interacts with the application layer via the
 * injected `CountryInPort` interface.
 * 
 * @version 1
 * @path /country
 */
@ApiTags('Country Endpoints')
@Controller({ path: '/country', version: '1' })
export class CountryController {

  /**
   * Creates an instance of CountryController.
   * 
   * @param countryInPort - The application service handling Country operations.
   */
  constructor(
    @Inject(CountryInPort) private countryInPort: CountryInPort
  ) {}

  /**
   * Handles the creation of a new Country entity.
   * 
   * @param country - The Country entity to be created.
   * @returns The result of the creation operation.
   */
  @Post('/op')
  create(@Body() country: ICountry) {
    return this.countryInPort.handleToRegister(country);
  }

  /**
   * Retrieves a list of all Country entities.
   * 
   * @returns A promise that resolves to an array of Country entities.
   */
  // @Public()
  @Get('/op')
  list(): Promise<ICountry[]> {
    return this.countryInPort.handleFindAll();
  }

  /**
   * Retrieves a single Country entity by its ID.
   * 
   * @param id - The ID of the Country entity to retrieve.
   * @returns A promise that resolves to the found Country entity or null if not found.
   */
  @Get('/op/:id')
  get(@Param('id') id: String): Promise<ICountry | null> {
    return this.countryInPort.handleFindOne(id);
  }

  /**
   * Updates an existing Country entity by its ID.
   * 
   * @param id - The ID of the Country entity to update.
   * @param country - The new data for the Country entity.
   * @returns The result of the update operation.
   */
  @Put('/op/:id')
  update(@Param('id') id: String, @Body() country: ICountry) {
    return this.countryInPort.handleUpdateOne(id, country);
  }

  /**
   * Deletes a Country entity by its ID.
   * 
   * @param id - The ID of the Country entity to delete.
   * @returns A void promise that resolves when the deletion operation is complete.
   */
  @Delete('/op/:id')
  delete(@Param('id') id: String): Promise<void> {
    console.log(`id: ${id}`);
    return this.countryInPort.handleRemoveOne(id);
  }

  /**
   * Retrieves a simplified view list of all Country entities.
   * 
   * @returns A promise that resolves to an array of simplified view Country entities.
   */
  @Get('/vw')
  listView(): Promise<ICountry[]> {
    return this.countryInPort.handleSimpleViewFindAll();
  }

  /**
   * Retrieves a simplified view of a single Country entity by its ID.
   * 
   * @param id - The ID of the Country entity to retrieve.
   * @returns A promise that resolves to the simplified view of the found Country entity or null if not found.
   */
  @Get('/vw/:id')
  getView(@Param('id') id: String): Promise<ICountry | null> {
    return this.countryInPort.handleSimpleViewFindOne(id);
  }
}
