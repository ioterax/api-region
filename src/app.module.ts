import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthGuard } from '@/security/auth.guard';
import { CountryModule } from '@/modules/country.module';
import { StateModule } from './modules/state.module';

@Module({
  providers: [{provide: APP_GUARD, useClass: AuthGuard}],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // I18nModule.forRoot({
    //   fallbackLanguage: 'en',
    //   loaderOptions: {
    //     path: path.join(__dirname, '/i18n/'),
    //     watch: true,
    //   },
    // }),    
    CountryModule,
    StateModule,
  ],
})
export class AppModule {}
