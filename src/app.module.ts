import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { CountryModule } from '@/modules/country.module';
import { StateModule } from '@/modules/state.module';
import { AuthGuard } from '@/security/auth.guard';
import { DynamicDatabaseModule } from './modules/context.module';

@Module({
  providers: [{provide: APP_GUARD, useClass: AuthGuard}],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CountryModule
    // StateModule
  ],
})
export class AppModule {}
