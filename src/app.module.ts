import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { CountryModule } from '@/modules/country.module';
import { StateModule } from '@/modules/state.module';
import { AuthGuard } from '@/security/auth.guard';

@Module({
  providers: [{provide: APP_GUARD, useClass: AuthGuard}],
  imports: [
    ConfigModule.forRoot({ envFilePath: process.env.ENV_ENTRYPOINT, isGlobal: true }),
    TypeOrmModule.forRoot({
      name: 'postgresConnection',
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT as string, 10) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'test',
      entities: [__dirname + '/framework/repository/postgres/entities/**/*.entity{.ts,.js}'], // only entities related with PostgreSQL
      synchronize: true,
    }),
    TypeOrmModule.forRoot({
      name: 'mysqlConnection',
      type: 'mysql',
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT as string, 10) || 3306,
      username: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DB || 'test',
      entities: [__dirname + '/framework/repository/mysql/entities/**/*.entity{.ts,.js}'], // only entities related with MySQL
      synchronize: true,
    }),
    MongooseModule.forRoot(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?retryWrites=true`, { connectionName: 'laniakeaMongoConnection' }),
    CountryModule,
    StateModule
  ],
})
export class AppModule {}
