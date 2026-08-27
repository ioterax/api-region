import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { AuthModule } from '@ioterax/security-lib-auth';
import { OperationsModule } from '@/modules/operations.module';
import { RegionModule } from '@/modules/region.module';

/** Composition root for the private read-only global Region API. */
@Module({
  imports: [
    AuthModule.forRoot({
      i18nPaths: [join(__dirname, 'i18n')],
      includeDefaultI18n: true,
    }),
    OperationsModule,
    RegionModule,
  ],
})
export class AppModule {}
