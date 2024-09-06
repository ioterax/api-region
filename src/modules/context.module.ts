import { Module, DynamicModule } from "@nestjs/common";
import { MongoDbModule, PostgresModule, MySqlModule } from './repository.module';

@Module({})
export class DynamicDatabaseModule {

  static forFeature(
    // options: {
    //   imports?: any[];
    //   inject?: any[];
    //   databaseType: 'mongodb' | 'postgres' | 'mysql'
    // }
  ): DynamicModule {

      let selectedModule;

    switch (process.env.DATABASE_TYPE) {
      case 'mongodb':
        console.log(
          'MONGODB',
          process.env.MONGO_USER,
          process.env.MONGO_PASSWORD,
          process.env.MONGO_HOST,
          process.env.MONGO_PORT,
          process.env.MONGO_DB,
        )
        selectedModule = MongoDbModule;
        break;
      case 'postgres':
        selectedModule = PostgresModule;
        break;
      case 'mysql':
        selectedModule = MySqlModule;
        break;
    }

    // console.log([selectedModule, ...(options.imports || [])]);
    return {
      module: selectedModule
      // imports: [selectedModule, ...(options.imports || [])],      
    };
  }
}
