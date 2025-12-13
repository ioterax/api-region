import { Inject, Injectable } from '@nestjs/common';
import { IState } from '@ioterax/foundation-lib-central';
import { StateUseCase } from '@/application/usescases/state.usecase';
import { StateOutPort } from '@/application/ports/out/state.port';

@Injectable()
export class StateService implements StateUseCase {
  constructor(
    @Inject(StateOutPort)
    private readonly stateOutPort: StateOutPort,
  ) {}

  // CREATE
  registerNew(domain: IState): Promise<IState> {
    return this.stateOutPort.save(domain);
  }

  // RETRIEVE ALL
  retrieveAll(): Promise<IState[]> {
    return this.stateOutPort.findAll();
  }

  // RETRIEVE ONE
  retrieveOne(id: string): Promise<IState | null> {
    return this.stateOutPort.findById(id);
  }

  // UPDATE
  updateOne(id: string, domain: IState): Promise<IState | null> {
    return this.stateOutPort.updateById(id, domain);
  }

  // DELETE
  removeOne(id: string): Promise<void> {
    return this.stateOutPort.deleteById(id);
  }
}
