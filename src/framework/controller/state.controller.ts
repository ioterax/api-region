import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { State } from '@/framework/repository/mongodb/schemas/state.schema';
import { ApiTags } from '@nestjs/swagger';
import { StateInPort } from '@/application/ports/in/state.port';
import { Permission } from '@ioterax/laniakea-lib-auth';

@ApiTags('State Endpoints')
@Controller('/region/state')
export class StateController {
  constructor(@Inject(StateInPort) private countryInPort: StateInPort) {}

  @Permission('state.country.create')
  @Post()
  create(@Body() state: State) {
    // return this.countryInPort.handleToRegister(state);
    throw new Error('Method not implemented.');
  }

  @Permission('state.country.list')
  @Get()
  list(): Promise<State[]> {
    // return this.countryInPort.handleFindAll();
    throw new Error('Method not implemented.');
  }

  @Permission('state.country.get')
  @Get(':id')
  get(@Param('id') id: string): Promise<State | null> {
    // return this.countryInPort.handleFindOne(id);
    throw new Error('Method not implemented.');
  }

  @Permission('state.country.change')
  @Put(':id')
  update(@Param('id') id: string, @Body() state: State) {
    // return this.countryInPort.handleUpdateOne(id, state);
    throw new Error('Method not implemented.');
  }

  @Permission('state.country.remove')
  @Delete(':id')
  delete(@Param('id') id: string) {
    console.log(`id: ${id}`);
    // this.countryInPort.handleRemoveOne(id);
    throw new Error('Method not implemented.');
  }
}
