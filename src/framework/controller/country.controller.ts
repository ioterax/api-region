import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ICountry } from '@atisiothings/laniakea-lib-central/dist/domain/region';
import { CountryInPort } from '@/application/ports/in/country.in.port';

@ApiTags('Country Endpoints')
@Controller('/countries')
export class CountryController {
  constructor(
    @Inject(CountryInPort) private countryInPort: CountryInPort
  ) {}

  @Post()
  create(@Body() country: ICountry) {
    return this.countryInPort.handleToRegister(country)
  }

  @Get()
  list(): Promise<ICountry[]> {
    return this.countryInPort.handleFindAll();
  }

  @Get('/country/:id')
  get(@Param('id') id: String): Promise<ICountry | null> {
    return this.countryInPort.handleFindOne(id);
  }

  @Put('/country/:id')
  update(@Param('id') id: String, @Body() country: ICountry) {
    return this.countryInPort.handleUpdateOne(id, country);
  }

  @Delete('/country/:id')
  delete(@Param('id') id: String) {
    console.log(`id: ${id}`)
      this.countryInPort.handleRemoveOne(id);
  }

  @Get('/view')
  listView(): Promise<ICountry[]> {
    return this.countryInPort.handleSimpleViewFindAll();
  }

  @Get('/view/country/:id')
  getView(@Param('id') id: String): Promise<ICountry | null> {
    return this.countryInPort.handleSimpleViewFindOne(id);
  }


}
