import { Module, DynamicModule } from "@nestjs/common";
import { MongoDbModule } from './repository.module';
import { mongoDb } from "@/framework/repository/mongodb/schema.mapper";

@Module({})
export class DynamicDatabaseModule {

  static forFeature(): DynamicModule {
    let selectedModule;

    switch (process.env.DATABASE_TYPE) {
      case 'mongodb':
        // if more connections is needed duplicate and use others constants
        selectedModule = MongoDbModule.create(process.env.MONGO_REGION_CN_NAME as string, mongoDb.region.dbName, {
          models: mongoDb.region.models,
          outPortProviders: mongoDb.region.providers
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
