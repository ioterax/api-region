import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { State } from '@/framework/repository/mongodb/schemas/state.schema';
import { ApiTags } from '@nestjs/swagger';
import { StateInPort } from '@/application/ports/in/state.in.port';

@ApiTags('State Endpoints')
@Controller('/state')
export class StateController {

  constructor(
    @Inject(StateInPort) private countryInPort: StateInPort
  ) {}

  @Post()
  create(@Body() state: State) {
    return this.countryInPort.handleToRegister(state)
  }

  @Get()
  list(): Promise<State[]> {
    return this.countryInPort.handleFindAll();
  }

  @Get(':id')
  get(@Param('id') id: String): Promise<State | null> {
    return this.countryInPort.handleFindOne(id);
  }

  @Put(':id')
  update(@Param('id') id: String, @Body() state: State) {
    return this.countryInPort.handleUpdateOne(id, state);
  }

  @Delete(':id')
  delete(@Param('id') id: String) {
    console.log(`id: ${id}`)
      this.countryInPort.handleRemoveOne(id);
  }



}
