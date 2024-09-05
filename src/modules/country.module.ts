import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Adapter In
import { CountryRestAdapter } from '@/adapters/in/rest/country.rest.adapter';

// Application Service
import { CountryCrudUseCase, CountryViewUseCase } from '@/application/usescases/country.usecase';
import { CountryService, CountryViewService } from '@/application/services/country.service';

// Application Ports
import { CountryInPort } from '@/application/ports/in/country.in.port';
import { CountryOutPort } from '@/application/ports/out/country.out.port';

// Framework
import { CountryController } from '@/framework/controller/country.controller';
import { Country, CountrySchema } from '@/framework/repository/mongodb/schemas/country.schema';
import { CountryRepository } from '@/framework/repository/mongodb/country.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }])
  ],
  controllers: [
    CountryController
  ],
  providers: [
    { provide: CountryInPort, useClass: CountryRestAdapter },       // => provide Adapter In [rest >> app >> db]
    { provide: CountryCrudUseCase, useClass: CountryService },      // => provide Application Service
    { provide: CountryViewUseCase, useClass: CountryViewService },  // => provide Application Service
    { provide: CountryOutPort, useClass: CountryRepository },       // => provide Framework Crud Repository
  ],
})
export class CountryModule {}
