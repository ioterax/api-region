import { Module, Provider } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TypeOrmModule } from "@nestjs/typeorm";

// import { PORT_OUT } from "@/config/ports.config";
// import { CountryMongoDbRepository } from "@/framework/repository/mongodb/country.repository";
// import { CountrySchema } from "@/framework/repository/mongodb/schemas/country.schema";
// import { Country } from "@atisiothings/laniakea-lib-central/dist/domain/region";
// import { CountryOutPort } from "@/application/ports/out/country.out.port";

// @Module({
//     imports: [
//       // MongooseModule.forRoot(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=admin&retryWrites=true`)
//       // MongooseModule.forRoot(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@{process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}/?authSource=admin`),
//       MongooseModule.forRoot(`mongodb://local:local@localhost:27017/?authSource=admin`),
//       MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }])
//     ],
//     providers: [
//       { provide: CountryOutPort, useClass: CountryMongoDbRepository },
//     ],
//     exports: [
//       CountryMongoDbRepository, // Exporta o repositório
//       CountryOutPort,           // Exporta a interface (token)
//     ],
//   })
//   export class MongoDbModule {}
  
// @Module({
//   imports: [
//     MongooseModule.forRoot(`mongodb://local:local@localhost:27017/?authSource=admin`),
//     MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
//   ],
//   providers: [
//     { provide: CountryOutPort, useClass: CountryMongoDbRepository },
//   ],
//   exports: [
//     CountryOutPort
//   ],
// })
// export class MongoDbModule {}

// TODO: move to library
@Module({})
export class MongoDbModule {
  static create(options?: { 
    outPortProviders?: Provider[],
    models?: { name: string, schema: any }[]
  }) {
    const providers = options?.outPortProviders || [];
    const models = options?.models || [];

    @Module({
      imports: [
        MongooseModule.forRoot('mongodb://local:local@localhost:27017/?authSource=admin'),
        MongooseModule.forFeature(models),
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
  