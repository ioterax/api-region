import * as winston from 'winston';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { APP_GUARD } from '@nestjs/core';

import { AuthGuard } from '@/security/auth.guard';
import { CountryModule } from '@/modules/country.module';
import { StateModule } from './modules/state.module';
import { AppLogger } from './framework/app.logger';

const customLevels = {
  levels: { error: 0, warn: 1, info: 2, http: 3, debug: 4 },
  colors: { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'blue' }
};

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}][${level}] ${message}`;
});

winston.addColors(customLevels.colors);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot({
      levels: customLevels.levels,
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat,
      ),
      transports: [
        new winston.transports.Console({
          level: 'debug', // Set the log level to 'debug' for the console transport
        }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    }),
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
  providers: [
    {provide: APP_GUARD, useClass: AuthGuard},
    AppLogger
  ],
  exports: [
    // AppLogger
  ]
})
export class AppModule {}


