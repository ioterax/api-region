import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Adapter In
import { CountryRestAdapter } from '@/adapters/in/rest/country.rest.adapter';

// Application Service
import { CountryUseCase } from '@/application/usescases/country.usecase';
import { CountryService } from '@/application/services/country.service';

// Application Ports
import { CountryInPort } from '@/application/ports/in/country.in.port';
import { CountryOutPort } from '@/application/ports/out/country.out.port';

// Framework
import { CountryController } from '@/framework/controller/country.controller';
import { CountryRepository } from '@/framework/repository/country.repository';

import { Country, CountrySchema } from '../framework/repository/schemas/country.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }])
  ],
  controllers: [
    CountryController
  ],
  providers: [
    { provide: CountryInPort, useClass: CountryRestAdapter }, // => provide Adapter In [rest >> app >> db]
    { provide: CountryUseCase, useClass: CountryService },    // => provide Application Service
    { provide: CountryOutPort, useClass: CountryRepository }, // => provide Framework Repository
  ],
})
export class CountryModule {}
