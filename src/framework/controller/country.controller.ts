import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ICountry } from '@atisiothings/laniakea-lib-central/dist/domain/region';
import { CountryInPort } from '@/application/ports/in/country.in.port';

@ApiTags('Country Endpoints')
@Controller({ path: '/country', version: '1' })
export class CountryController {
  constructor(
    @Inject(CountryInPort) private countryInPort: CountryInPort
  ) {}

  @Post('/op')
  create(@Body() country: ICountry) {
    return this.countryInPort.handleToRegister(country)
  }

  @Get('/op')
  list(): Promise<ICountry[]> {
    return this.countryInPort.handleFindAll();
  }

  @Get('/op/:id')
  get(@Param('id') id: String): Promise<ICountry | null> {
    return this.countryInPort.handleFindOne(id);
  }

  @Put('/op/:id')
  update(@Param('id') id: String, @Body() country: ICountry) {
    return this.countryInPort.handleUpdateOne(id, country);
  }

  @Delete('/op/:id')
  delete(@Param('id') id: String) {
    console.log(`id: ${id}`)
      this.countryInPort.handleRemoveOne(id);
  }

  @Get('/vw')
  listView(): Promise<ICountry[]> {
    return this.countryInPort.handleSimpleViewFindAll();
  }

  @Get('/vw/:id')
  getView(@Param('id') id: String): Promise<ICountry | null> {
    return this.countryInPort.handleSimpleViewFindOne(id);
  }
}
