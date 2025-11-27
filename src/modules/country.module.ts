import { Module } from '@nestjs/common';

// Adapter In
import { CountryRestInAdapter } from '@/adapters/in/rest/country.adapter';

// Application Service
import {
  CountryCrudUseCase,
  CountryViewUseCase,
} from '@/application/usescases/country.usecase';
import {
  CountryService,
  CountryViewService,
} from '@/application/services/country.service';

// Application Ports
import { CountryInPort } from '@/application/ports/in/country.port';

// Framework
import { CountryController } from '@/framework/controller/country.controller';
import { DynamicDatabaseModule } from '@ioterax/laniakea-lib-database';
import { countryConfig } from '@/framework/repository/database.config';
import { AppLogger } from '@ioterax/laniakea-lib-audit';

@Module({
  imports: [DynamicDatabaseModule.forFeature(countryConfig)],
  controllers: [CountryController],
  providers: [
    AppLogger,
    { provide: CountryInPort, useClass: CountryRestInAdapter }, // => provide Adapter In [rest >> app >> db]
    { provide: CountryCrudUseCase, useClass: CountryService }, // => provide Application Service
    { provide: CountryViewUseCase, useClass: CountryViewService }, // => provide Application Service
  ],
})
export class CountryModule {}
