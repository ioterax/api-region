import { Module, DynamicModule, Provider } from "@nestjs/common";
import { MongoDbModule, PostgresModule, MySqlModule } from './repository.module';
import { CountryOutPort } from "@/application/ports/out/country.out.port";
import { CountryMongoDbRepository } from "@/framework/repository/mongodb/country.repository";
import { Country, CountrySchema } from '@/framework/repository/mongodb/schemas/country.schema';

@Module({})
export class DynamicDatabaseModule {

  static forFeature(): DynamicModule {
    let selectedModule;

    switch (process.env.DATABASE_TYPE) {
      case 'mongodb':
        selectedModule = MongoDbModule.create({
          models: mongoDbModels,
          outPortProviders: mongoDbProviders
        });
        break;
        default:
          throw new Error('Invalid database type - Include a new database module if is needed.')
    }

    return {
      module: selectedModule,
    };
  }
}

const mongoDbModels = [
  { name: Country.name, schema: CountrySchema }
];

const mongoDbProviders = [
  { provide: CountryOutPort, useClass: CountryMongoDbRepository },
];