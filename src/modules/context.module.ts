import { Module, DynamicModule, Provider } from "@nestjs/common";
import { MongoDbModule } from './repository.module';

@Module({})
export class DynamicDatabaseModule {

  static forFeature(databaseConfigOptions: DatabaseConfigOptions): DynamicModule {
    let selectedModule;

    // process.env.DATABASE_TYPE

    switch (databaseConfigOptions.dbType) {
      case 'mongodb':
        // if more connections is needed duplicate and use others constants
        selectedModule = MongoDbModule.create(databaseConfigOptions.connectName, databaseConfigOptions.dbName, {
          models: databaseConfigOptions.models,
          outPortProviders: databaseConfigOptions.outPortProviders
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

export interface DatabaseConfigOptions {
  connectName: string;
  dbName: string;
  dbType: string;
  models: MongoModdel[] | undefined
  outPortProviders: Provider[];
}

export interface MongoModdel {
  name: string;
  schema: any;
}
