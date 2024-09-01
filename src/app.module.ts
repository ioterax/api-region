import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { CountryModule } from '@/modules/country.module';
import { StateModule } from '@/modules/state.module';
import { AuthGuard } from '@/security/auth.guard';

@Module({
  providers: [{provide: APP_GUARD, useClass: AuthGuard}],
  imports: [
    ConfigModule.forRoot({ envFilePath: '.develop.env', isGlobal: true }),
    MongooseModule.forRoot(process.env.DB_URI as string),
    CountryModule,
    StateModule
  ],
})
export class AppModule {}
