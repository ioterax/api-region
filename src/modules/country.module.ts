import { Module } from '@nestjs/common';
import { DynamicDatabaseModule } from '@ioterax/infra-lib-database';
import { MapperModule } from '@ioterax/infra-lib-mapper';

import { CountryRestInAdapter } from '@/adapters/in/rest/country.adapter';
import { CountryCrudUseCase, CountryViewUseCase } from '@/application/usescases/country.usecase';
import { CountryService, CountryViewService } from '@/application/services/country.service';
import { CountryInPort } from '@/application/ports/in/country.port';
import { CountryController } from '@/framework/controller/country.controller';
import { regionConfig } from '@/framework/repository/database.config';
import { CountryMapper } from '@/adapters/mappers/country.mapper';

@Module({
  imports: [MapperModule.register([CountryMapper]), DynamicDatabaseModule.forFeature(regionConfig)],
  controllers: [CountryController],
  providers: [
    { provide: CountryInPort, useClass: CountryRestInAdapter }, // => provide Adapter In [rest >> app >> db]
    { provide: CountryCrudUseCase, useClass: CountryService }, // => provide Application Service
    { provide: CountryViewUseCase, useClass: CountryViewService }, // => provide Application Service
  ],
})
export class CountryModule {}
