import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { LoggerModule, AppLogger } from '@atisiothings/laniakea-lib-audit';
import { AuthGuard } from '@atisiothings/laniakea-lib-http/dist/security/auth.guard';
import { CountryModule } from '@/modules/country.module';
import { StateModule } from './modules/state.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({ level: 'debug' }),
    CountryModule,
    StateModule,
  ],
  providers: [
    {provide: APP_GUARD, useClass: AuthGuard},
    AppLogger
  ],
  exports: [AppLogger]
})
export class AppModule {}
