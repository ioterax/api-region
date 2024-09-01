import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { StateUseCase } from '@/application/usescases/state.usecase';
import { State } from '@/framework/repository/schemas/state.schema';

@Controller('/state')
export class StateController {
  constructor(@Inject(StateUseCase) private readonly stateUseCase: StateUseCase) {}

  @Post()
  create(@Body() state: State) {
    this.stateUseCase.create(state);
  }

  @Get()
  list(): Promise<State[]> {
    return this.stateUseCase.findAll();
  }

}
