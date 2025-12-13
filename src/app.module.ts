import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CustomExceptionFilter, DomainExceptionFilter } from '@ioterax/foundation-lib-commons';
import { CorsMiddleware, HealthController } from '@ioterax/infra-lib-connectivity';
import { AuthModule } from '@ioterax/security-lib-auth';

import { CountryModule } from '@/modules/country.module';
import { StateModule } from '@/modules/state.module';

@Module({
  imports: [AuthModule.forRoot(), CountryModule, StateModule],
  controllers: [HealthController],
  providers: [CustomExceptionFilter, DomainExceptionFilter],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes({ path: '/*prefix/region', method: RequestMethod.ALL });
  }
}
