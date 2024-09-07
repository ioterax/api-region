import { Module, Provider } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TypeOrmModule } from "@nestjs/typeorm";

// // TODO: move to library
// @Module({})
export class MongoDbModule {
  static create(connectName: string, databaseName: string, options?: { 
    outPortProviders?: Provider[],
    models?: { name: string, schema: any }[]
  }) {
    const providers = options?.outPortProviders || [];
    const models = options?.models || [];

    const cnUri = (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'Docker') ? 'mongodb' : 'mongodb+srv';
    const dbUri = `${cnUri}://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${databaseName}?authSource=admin`;
    console.log(dbUri);

    @Module({
      imports: [
        MongooseModule.forRoot(dbUri, { connectionName: connectName }),
        MongooseModule.forFeature(models, connectName),
      ],
      providers: [...providers],
      exports: [...providers],
    })
    class MongoDbModuleWithOptions {}

    return MongoDbModuleWithOptions;
  }
}



  @Module({
    imports: [TypeOrmModule.forRoot({
      name: 'postgresConnection',
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT as string, 10) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'test',
      entities: [__dirname + '/framework/repository/postgres/entities/**/*.entity{.ts,.js}'], // only entities related with PostgreSQL
      synchronize: true, // disable in production
    })],
    providers: [
      // { provide: CountryOutPort, useClass: CountryPostgresRepository }, // => provide Framework Crud Repository
    ],
  })
  export class PostgresModule {}
  
  @Module({
    imports: [TypeOrmModule.forRoot({
      name: 'mysqlConnection',
      type: 'mysql',
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT as string, 10) || 3306,
      username: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DB || 'test',
      entities: [__dirname + '/framework/repository/mysql/entities/**/*.entity{.ts,.js}'], // only entities related with MySQL
      synchronize: true, // disable in production
    })],
    providers: [
    ],
    exports: [
    ],    
  })
  export class MySqlModule {}
  