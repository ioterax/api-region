import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ICountry } from '@ioterax/laniakea-lib-central';
import { CountryInPort } from '@/application/ports/in/country.port';
import { Permission } from '@ioterax/laniakea-lib-auth';

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
@Controller({ path: '/region/country', version: '1' })
export class CountryController {
  /**
   * Creates an instance of CountryController.
   *
   * @param countryInPort - The application service handling Country operations.
   */
  constructor(
    @Inject(CountryInPort) private countryInPort: CountryInPort<ICountry>,
  ) {}

  /**
   * Handles the creation of a new Country entity.
   *
   * @param country - The Country entity to be created.
   * @returns The result of the creation operation.
   */
  @Permission('region.country.create')
  @Post('/op')
  create(@Body() country: ICountry) {
    return this.countryInPort.handleToRegister(country);
  }

  /**
   * Retrieves a list of all Country entities.
   *
   * @returns A promise that resolves to an array of Country entities.
   */
  @Permission('region.country.list')
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
  @Permission('region.country.get')
  @Get('/op/:id')
  get(@Param('id') id: string): Promise<ICountry | null> {
    return this.countryInPort.handleFindOne(id);
  }

  /**
   * Updates an existing Country entity by its ID.
   *
   * @param id - The ID of the Country entity to update.
   * @param country - The new data for the Country entity.
   * @returns The result of the update operation.
   */
  @Permission('region.country.change')
  @Put('/op/:id')
  update(@Param('id') id: string, @Body() country: ICountry) {
    return this.countryInPort.handleUpdateOne(id, country);
  }

  /**
   * Deletes a Country entity by its ID.
   *
   * @param id - The ID of the Country entity to delete.
   * @returns A void promise that resolves when the deletion operation is complete.
   */
  @Permission('region.country.remove')
  @Delete('/op/:id')
  async delete(@Param('id') id: string): Promise<void> {
    console.log(`id: ${id}`);
    await this.countryInPort.handleRemoveOne(id);
  }

  /**
   * Retrieves a simplified view list of all Country entities.
   *
   * @returns A promise that resolves to an array of simplified view Country entities.
   */
  @Permission('region.country.view')
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
  @Permission('region.country.catch')
  @Get('/vw/:id')
  getView(@Param('id') id: string): Promise<ICountry | null> {
    return this.countryInPort.handleSimpleViewFindOne(id);
  }
}
