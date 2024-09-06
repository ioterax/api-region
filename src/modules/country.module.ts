import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';

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
// import { Country, CountrySchema } from '@/framework/repository/mongodb/schemas/country.schema';
// import { CountryMongoDbRepository } from '@/framework/repository/mongodb/country.repository';
// import { CountryOutPort } from '@/application/ports/out/country.out.port';
import { DynamicDatabaseModule } from './context.module';
// import { MongoDbModule, MySqlModule, PostgresModule } from './repository.module';
// import { CountryPostgresRepository } from '@/framework/repository/postgres/country.repository';

@Module({
  imports: [
    DynamicDatabaseModule.forFeature(),
  ],
  controllers: [
    CountryController
  ],
  providers: [
    { provide: CountryInPort, useClass: CountryRestAdapter },               // => provide Adapter In [rest >> app >> db]
    { provide: CountryCrudUseCase, useClass: CountryService },              // => provide Application Service
    { provide: CountryViewUseCase, useClass: CountryViewService },          // => provide Application Service
    // { provide: CountryOutPort, useClass: CountryMongoDbRepository },   // => provide Framework Crud Repository
    // { provide: PORT_OUT.DB.POSTGRES, useClass: CountryPostgresRepository }, // => provide Framework Crud Repository
  ],
})
export class CountryModule {}
