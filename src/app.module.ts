import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { LoggerModule, AppLogger } from '@atisiothings/laniakea-lib-audit';
import { AuthClientModule } from '@atisiothings/laniakea-lib-http/dist/modules/auth.module';
import { AuthGuard } from '@/security/auth.guard';
import { CountryModule } from '@/modules/country.module';
import { StateModule } from './modules/state.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({ level: 'debug' }),
    AuthClientModule.forRoot('localhost:50051'),
    CountryModule,
    StateModule,
  ],
  providers: [
    AppLogger,
    {provide: APP_GUARD, useClass: AuthGuard},
  ],
  exports: [
    // AppLogger,
  ]
})
export class AppModule {}
