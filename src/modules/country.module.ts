import { Module } from '@nestjs/common';

// Adapter In
import { CountryRestAdapter } from '@/adapters/in/rest/country.rest.adapter';

// Application Service
import { CountryCrudUseCase, CountryViewUseCase } from '@/application/usescases/country.usecase';
import { CountryService, CountryViewService } from '@/application/services/country.service';

// Application Ports
// import { PORT_OUT } from '@/config/ports.config';
import { CountryInPort } from '@/application/ports/in/country.in.port';

// Framework
import { CountryController } from '@/framework/controller/country.controller';
import { DynamicDatabaseModule } from './context.module';
import { regionConfig } from '@/framework/repository/mongodb/schema.mapper';

@Module({
  imports: [
    DynamicDatabaseModule.forFeature(regionConfig),
  ],
  controllers: [
    CountryController
  ],
  providers: [
    { provide: CountryInPort, useClass: CountryRestAdapter },               // => provide Adapter In [rest >> app >> db]
    { provide: CountryCrudUseCase, useClass: CountryService },              // => provide Application Service
    { provide: CountryViewUseCase, useClass: CountryViewService },          // => provide Application Service
  ],
})
export class CountryModule {}
