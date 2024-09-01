import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { Country } from '@/framework/repository/schemas/country.schema';
import { ApiTags } from '@nestjs/swagger';
import { CountryInPort } from '@/application/ports/in/country.in.port';

@ApiTags('Country Endpoints')
@Controller('/country')
export class CountryController {
  constructor(
    @Inject(CountryInPort) private countryInPort: CountryInPort
  ) {}

  @Post()
  create(@Body() country: Country) {
    return this.countryInPort.handleToRegister(country)
  }

  @Get()
  list(): Promise<Country[]> {
    return this.countryInPort.handleFindAll();
  }

  @Get(':id')
  get(@Param('id') id: String): Promise<Country | null> {
    return this.countryInPort.handleFindOne(id);
  }

  @Put(':id')
  update(@Param('id') id: String, @Body() country: Country) {
    return this.countryInPort.handleUpdateOne(id, country);
  }

  @Delete(':id')
  delete(@Param('id') id: String) {
    console.log(`id: ${id}`)
      this.countryInPort.handleRemoveOne(id);
  }

}
