import { StateInPort } from "@/application/ports/in/state.in.port";
import { StateUseCase } from "@/application/usescases/state.usecase";
import { IState } from "@atisiothings/laniakea-lib-central/dist/domain/region";
import { Injectable, Inject } from "@nestjs/common";

@Injectable()
export class StateRestAdapter implements StateInPort {

    constructor(
        @Inject(StateUseCase) private readonly stateUseCase: StateUseCase
    ) {}

    handleToRegister(state: IState): Promise<IState> {
        return this.stateUseCase.registerNew(state)
    }

    handleFindAll(): Promise<IState[]> {
      return this.stateUseCase.retrieveAll();
    }

    handleFindOne(id: String): Promise<IState | null> {
      return this.stateUseCase.retrieveOne(id);
    }
  
    handleUpdateOne(id: String, state: IState) {
      return this.stateUseCase.updateOne(id, state);
    }
  
    handleRemoveOne(id: String) {
      console.log(`id: ${id}`)
        this.stateUseCase.removeOne(id);
    }

}
