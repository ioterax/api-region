import { Module } from '@nestjs/common';
import { DynamicDatabaseModule } from '@ioterax/infra-lib-database';

import { StateRestAdapter } from '@/adapters/in/rest/state.rest.adapter';
import { StateUseCase } from '@/application/usescases/state.usecase';
import { StateService } from '@/application/services/state.service';
import { StateInPort } from '@/application/ports/in/state.port';
import { StateController } from '@/framework/controller/state.controller';
import { regionConfig } from '@/framework/repository/database.config';

@Module({
  imports: [DynamicDatabaseModule.forFeature(regionConfig)],
  controllers: [StateController],
  providers: [
    { provide: StateInPort, useClass: StateRestAdapter }, // => provide Adapter In [rest >> app >> db]
    { provide: StateUseCase, useClass: StateService }, // => provide Application Service
  ],
})
export class StateModule {}
