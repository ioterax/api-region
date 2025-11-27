import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import {
  CorsMiddleware,
  HealthController,
} from '@ioterax/laniakea-lib-sec-comm';
import { AuthModule } from '@ioterax/laniakea-lib-auth';
import {
  CustomExceptionFilter,
  DomainExceptionFilter,
} from '@ioterax/laniakea-lib-commons';

import { CountryModule } from '@/modules/country.module';
import { StateModule } from './modules/state.module';

@Module({
  imports: [AuthModule.forRoot(), CountryModule, StateModule],
  controllers: [HealthController],
  providers: [CustomExceptionFilter, DomainExceptionFilter],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorsMiddleware)
      .forRoutes({ path: '/*prefix/region', method: RequestMethod.ALL });
  }
}
