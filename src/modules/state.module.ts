import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Adapter In
import { StateRestAdapter } from '@/adapters/in/rest/state.rest.adapter';

// Application Service
import { StateService } from '@/application/services/state.service';
import { StateUseCase } from '@/application/usescases/state.usecase';

// Application Ports
import { StateInPort } from '@/application/ports/in/state.in.port';
import { StateOutPort } from '@/application/ports/out/state.out.port';

// Framework
import { StateController } from '@/framework/controller/state.controller';
import { State, StateSchema } from '@/framework/repository/schemas/state.schema';
import { StateRepository } from '@/framework/repository/state.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: State.name, schema: StateSchema }])
  ],
  controllers: [
    StateController
  ],
  providers: [
    { provide: StateInPort, useClass: StateRestAdapter }, // => provide Adapter In [rest >> app >> db]
    { provide: StateUseCase, useClass: StateService },    // => provide Application Service
    { provide: StateOutPort, useClass: StateRepository }, // => provide Framework Repository
  ],
})
export class StateModule {}
