import { State } from "@/framework/repository/schemas/state.schema";

export interface StateUseCase {

  create(state: State): Promise<State>;

  delete(id: string);

  findAll(): Promise<State[]>;

  findOne(id: String): Promise<State>;

}

export const StateUseCase = Symbol('StateUseCase');
