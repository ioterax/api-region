import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';

// Adapter In
import { StateRestAdapter } from '@/adapters/in/rest/state.rest.adapter';

// Application Service
import { StateUseCase } from '@/application/usescases/state.usecase';
import { StateService } from '@/application/services/state.service';

// Application Ports
import { StateInPort } from '@/application/ports/in/state.port';

// Framework
import { StateController } from '@/framework/controller/state.controller';
import { DynamicDatabaseModule } from '@ioterax/laniakea-lib-database';
import { stateConfig } from '@/framework/repository/database.config';

@Module({
  imports: [DynamicDatabaseModule.forFeature(stateConfig)],
  controllers: [StateController],
  providers: [
    { provide: StateInPort, useClass: StateRestAdapter }, // => provide Adapter In [rest >> app >> db]
    { provide: StateUseCase, useClass: StateService }, // => provide Application Service
  ],
})
export class StateModule {}
