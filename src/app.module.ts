import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomExceptionFilter, DomainExceptionFilter } from '@ioterax/foundation-lib-commons';
import { CorsMiddleware, HealthController } from '@ioterax/infra-lib-connectivity';
import { AuthModule } from '@ioterax/security-lib-auth';
import { CacheModule } from '@ioterax/infra-lib-cache';
import { buildMongoConnectionUri } from '@ioterax/infra-lib-database';
import { SiloCtxEnum } from '@ioterax/bootstrap-lib-starter';
import { CountryModule } from '@/modules/country.module';
import { StateModule } from '@/modules/state.module';

const { uri } = buildMongoConnectionUri({
  databaseName: `${SiloCtxEnum.FOUNDATION}_generic`.toLowerCase(),
  host: process.env.MONGO_HOST!,
  port: process.env.MONGO_PORT,
  user: process.env.MONGO_USER,
  password: process.env.MONGO_PASSWORD,
  nodeEnv: process.env.NODE_ENV,
});

console.log(`CONNECTION_STRING => ${uri}`);

@Module({
  imports: [
    MongooseModule.forRoot(uri, {
      connectionName: process.env.MONGO_REGION_CN_NAME,
    }),
  ],
  exports: [MongooseModule],
})
export class InfraDatabaseRootModule {}

@Module({
  imports: [
    InfraDatabaseRootModule,
    CacheModule.forRoot({
      url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      prefix: 'cache:',
      defaultTTL: 3600,
    }),
    AuthModule.forRoot(),
    CountryModule,
    StateModule,
  ],
  controllers: [HealthController],
  providers: [CustomExceptionFilter, DomainExceptionFilter],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes({ path: '/*prefix/region', method: RequestMethod.ALL });
  }
}
