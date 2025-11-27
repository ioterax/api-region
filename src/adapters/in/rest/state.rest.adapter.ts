import { IState } from '@ioterax/laniakea-lib-central/dist/domain/region';
import { StateInPort } from '@/application/ports/in/state.port';
import { StateUseCase } from '@/application/usescases/state.usecase';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class StateRestAdapter implements StateInPort {
  constructor(
    @Inject(StateUseCase)
    private readonly stateUseCase: StateUseCase,
  ) {}

  // -------------------------------------------------------------
  // CREATE
  // -------------------------------------------------------------
  handleToRegister(state: Partial<IState>): Promise<Partial<IState>> {
    // return this.stateUseCase.registerNew(state);
    throw new Error('Method not implemented.');
  }

  // -------------------------------------------------------------
  // FIND ALL
  // -------------------------------------------------------------
  handleFindAll(): Promise<Partial<IState>[]> {
    // return this.stateUseCase.retrieveAll();
    throw new Error('Method not implemented.');
  }

  // -------------------------------------------------------------
  // FIND ONE
  // -------------------------------------------------------------
  handleFindOne(id: string): Promise<Partial<IState> | null> {
    // return this.stateUseCase.retrieveOne(id);
    throw new Error('Method not implemented.');
  }

  // -------------------------------------------------------------
  // UPDATE
  // -------------------------------------------------------------
  handleUpdateOne(
    id: string,
    state: Partial<IState>,
  ): Promise<Partial<IState> | null> {
    // return this.stateUseCase.updateOne(id, state);
    throw new Error('Method not implemented.');
  }

  // -------------------------------------------------------------
  // DELETE
  // -------------------------------------------------------------
  handleRemoveOne(id: string): Promise<void> {
    console.log(`id: ${id}`);
    // return this.stateUseCase.removeOne(id);
    throw new Error('Method not implemented.');
  }
}
