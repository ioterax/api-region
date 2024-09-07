import { Inject, Injectable } from '@nestjs/common';

import { StateUseCase } from '../usescases/state.usecase';
import { StateOutPort } from '../ports/out/state.out.port';
import { State } from '@/framework/repository/mongodb/schemas/state.schema';
import { DomainInvalidException } from '@/exceptions/domain.exception';

@Injectable()
export class StateService implements StateUseCase {

  constructor(@Inject(StateOutPort) private readonly stateOutPort: StateOutPort) {}

  registerNew(domain: State): Promise<State> {
    return this.stateOutPort.save(domain);
  }

  retrieveAll(): Promise<State[]> {
    // throw new DomainInvalidException('DOMAIN NOT IMPLEMENTED');
    return this.stateOutPort.findAll();
  }

  retrieveOne(id: String): Promise<State | null> {
    return this.stateOutPort.findById(id);
  }

  updateOne(id: String, domain: State): Promise<State | null> {
    return this.stateOutPort.updateById(id, domain);
  }

  removeOne(id: String) {
    return this.stateOutPort.deleteById(id);
  }

}
